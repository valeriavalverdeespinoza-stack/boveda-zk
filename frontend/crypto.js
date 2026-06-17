// CRYPTO.JS - Cifrado con Web Crypto API

let llaveCifrado = null;
let salGlobal = null;

// 1. DERIVAR LLAVE desde la contraseña maestra
//    Usar PBKDF2 para convertir una contraseña en una llave criptográfica AES-GCM

async function derivarLlave(passwordMaestra, sal) {
  const encoder = new TextEncoder();

  // Importar la contraseña como material de llave
  const materialLlave = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passwordMaestra),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // Derivar la llave AES-GCM usando PBKDF2
  const llave = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: sal,
      iterations: 100000, // 100,000 iteraciones es más seguro
      hash: "SHA-256"
    },
    materialLlave,
    { name: "AES-GCM", length: 256 }, // AES de 256 bits
    false,
    ["encrypt", "decrypt"]
  );

  return llave;
}

// 2. Generar sal aleatoria
//    La sal hace que dos contraseñas iguales produzcan llaves diferentes

function generarSal() {
  return crypto.getRandomValues(new Uint8Array(16));
}

// 3. Iniciar la bóveda con la contraseña maestra
//    Genera la sal y deriva la llave de cifrado

async function inicializarBoveda(passwordMaestra) {
  salGlobal = generarSal();
  llaveCifrado = await derivarLlave(passwordMaestra, salGlobal);
  console.log("Llave generada en el navegador. Nunca se enviará al servidor.");
  return true;
}

// 4. Cifrar un texto
//    Convierte texto legible en texto ilegible
//    usando AES-GCM con un vector de inicialización

async function cifrarTexto(texto) {
  if (!llaveCifrado) throw new Error("Bóveda no inicializada");

  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Vector de inicialización

  const textoCifrado = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    llaveCifrado,
    encoder.encode(texto)
  );

  // Combinar iv + datos cifrados y convertir a Base64 para guardar
  const combined = new Uint8Array(iv.byteLength + textoCifrado.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(textoCifrado), iv.byteLength);

  return btoa(String.fromCharCode(...combined));
}

// 5. DESCIFRAR un texto
//    Convierte texto cifrado de vuelta al original
//    Solo funciona con la llave correcta

async function descifrarTexto(textoCifradoBase64, passwordMaestra) {
  try {
    // Convertir Base64 a bytes
    const combined = Uint8Array.from(atob(textoCifradoBase64), c => c.charCodeAt(0));

    // Separar IV y datos cifrados
    const iv = combined.slice(0, 12);
    const datos = combined.slice(12);

    // Derivar la misma llave con la misma sal
    const llave = await derivarLlave(passwordMaestra, salGlobal);

    const textoDescifrado = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      llave,
      datos
    );

    return new TextDecoder().decode(textoDescifrado);
  } catch (e) {
    throw new Error("Contraseña incorrecta o datos corruptos");
  }
}

// 6. Simular cifrado para la demo visual
//    Muestra al usuario cómo luce el texto cifrado
//    en tiempo real mientras escribe

function simularCifrado(texto) {
  if (!texto) return "—";
  // Simulación visual usando btoa (no es cifrado real, solo demo)
  return btoa(texto + Math.random().toString(36)).substring(0, 40) + "...";
}