// APP.JS - Lógica principal de la aplicación
const API_URL = "http://127.0.0.1:5000";

let usuarioActual = null;

// 1. Navegación entre secciones
function mostrarSeccion(nombre) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

  document.getElementById("seccion-" + nombre).classList.add("active");

  const botones = document.querySelectorAll(".nav-btn");
  const nombres = ["registro", "agregar", "servidor", "recuperar"];
  botones[nombres.indexOf(nombre)].classList.add("active");

  if (nombre === "servidor") cargarDatosServidor();
}

// 2. Registro /desbloqueo de la bóveda
async function registrar() {
  const usuario = document.getElementById("regis-usuario").value.trim();
  const password = document.getElementById("regis-password").value.trim();

  document.getElementById("msg-registro").style.display = "none";
  document.getElementById("err-registro").style.display = "none";

  if (!usuario || !password) {
    document.getElementById("err-registro").style.display = "block";
    return;
  }

  if (password.length < 8) {
    document.getElementById("err-registro").textContent = "La contraseña maestra debe tener al menos 8 caracteres.";
    document.getElementById("err-registro").style.display = "block";
    return;
  }

  try {
    await inicializarBoveda(password);
    usuarioActual = usuario;

    document.getElementById("msg-registro").style.display = "block";
    setTimeout(() => mostrarSeccion("agregar"), 1500);

  } catch (e) {
    document.getElementById("err-registro").textContent = "Error al generar la llave: " + e.message;
    document.getElementById("err-registro").style.display = "block";
  }
}
// 3. Demo visual del cifrado en tiempo real
function actualizarDemo() {
  const password = document.getElementById("add-password").value;
  const usuario = document.getElementById("add-usuario").value;
  const servicio = document.getElementById("add-servicio").value;

  const textoOriginal = servicio || usuario || password;

  if (!textoOriginal) {
    document.getElementById("demo-original").textContent = "Escribí algo arriba...";
    document.getElementById("demo-cifrado").textContent = "—";
    return;
  }

  document.getElementById("demo-original").textContent =
    `${servicio} | ${usuario} | ${password}`;

  document.getElementById("demo-cifrado").textContent =
    simularCifrado(textoOriginal);
}

// 4. Cifrar Y guardar una credencial
async function cifrarYGuardar() {
  const servicio = document.getElementById("add-servicio").value.trim();
  const usuario = document.getElementById("add-usuario").value.trim();
  const password = document.getElementById("add-password").value.trim();

  document.getElementById("msg-agregar").style.display = "none";
  document.getElementById("err-agregar").style.display = "none";

  if (!servicio || !usuario || !password) {
    document.getElementById("err-agregar").style.display = "block";
    return;
  }

  if (!usuarioActual) {
    document.getElementById("err-agregar").textContent = "Primero debés desbloquear tu bóveda.";
    document.getElementById("err-agregar").style.display = "block";
    return;
  }

  try {
    const usuarioCifrado = await cifrarTexto(usuario);
    const passwordCifrado = await cifrarTexto(password);

    const respuesta = await fetch(`${API_URL}/guardar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_boveda: usuarioActual,
        servicio: servicio,
        usuario_cifrado: usuarioCifrado,
        password_cifrado: passwordCifrado
      })
    });

    if (respuesta.ok) {
      document.getElementById("msg-agregar").style.display = "block";
      document.getElementById("add-servicio").value = "";
      document.getElementById("add-usuario").value = "";
      document.getElementById("add-password").value = "";
      document.getElementById("demo-original").textContent = "Escribí algo arriba...";
      document.getElementById("demo-cifrado").textContent = "—";
    } else {
      throw new Error("Error del servidor");
    }

  } catch (e) {
    document.getElementById("err-agregar").textContent = "Error al guardar: " + e.message;
    document.getElementById("err-agregar").style.display = "block";
  }
}

// 5. Cargar datos del servidor (sección educativa)
async function cargarDatosServidor() {
  if (!usuarioActual) {
    document.getElementById("servidor-datos").innerHTML =
      "<p style='color:#999; font-size:13px;'>Primero debés iniciar sesión.</p>";
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/credenciales/${usuarioActual}`);
    const datos = await respuesta.json();

    if (!datos.credenciales || datos.credenciales.length === 0) {
      document.getElementById("servidor-datos").innerHTML =
        "<p style='color:#999; font-size:13px;'>Aún no hay datos guardados.</p>";
      return;
    }

    let html = "";
    datos.credenciales.forEach(cred => {
      html += `
        <div class="server-box" style="margin-bottom:12px;">
          <strong style="color:#fff;">Servicio:</strong> ${cred.servicio}<br>
          <strong style="color:#fff;">Usuario cifrado:</strong> ${cred.usuario_cifrado}<br>
          <strong style="color:#fff;">Password cifrado:</strong> ${cred.password_cifrado}
        </div>
      `;
    });

    document.getElementById("servidor-datos").innerHTML = html;

  } catch (e) {
    document.getElementById("servidor-datos").innerHTML =
      "<p style='color:#e74c3c; font-size:13px;'>No se pudo conectar al servidor.</p>";
  }
}

// 6. Descifrar credenciales
async function decifrarCredenciales() {
  const password = document.getElementById("recu-password").value.trim();

  document.getElementById("erro-recuperar").style.display = "none";
  document.getElementById("lista-credenciales").innerHTML = "";

  if (!password) {
    document.getElementById("erro-recuperar").style.display = "block";
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/credenciales/${usuarioActual}`);
    const datos = await respuesta.json();

    if (!datos.credenciales || datos.credenciales.length === 0) {
      document.getElementById("erro-recuperar").textContent = "No hay credenciales guardadas.";
      document.getElementById("erro-recuperar").style.display = "block";
      return;
    }

    let html = "";
    for (const cred of datos.credenciales) {
      const usuarioDescifrado = await descifrarTexto(cred.usuario_cifrado, password);
      const passwordDescifrado = await descifrarTexto(cred.password_cifrado, password);

      html += `
        <div class="cred-item">
          <p class="cred-site">🌐 ${cred.servicio}</p>
          <p class="cred-user">Usuario: ${usuarioDescifrado}</p>
          <div class="cred-encrypted"> Cifrado: ${cred.password_cifrado.substring(0, 40)}...</div>
          <div class="cred-decrypted" style="display:block;"> Descifrado: ${passwordDescifrado}</div>
        </div>
      `;
    }

    document.getElementById("lista-credenciales").innerHTML = html;

  } catch (e) {
    document.getElementById("erro-recuperar").textContent = "Contraseña incorrecta.";
    document.getElementById("erro-recuperar").style.display = "block";
  }
}