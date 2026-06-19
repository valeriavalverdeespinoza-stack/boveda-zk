// CRYPTO.JS - Cifrado con Web Crypto API

let llaveCifrado = null;
let salGlobal = null;

// 1. Generar llave desde la contraseña maestra

async function derivarLlave(passwordMaestra, sal) {
  const encoder = new TextEncoder();

  const materialLlave = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passwordMaestra),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // Generar la llave AES-GCM usando PBKDF2
  const llave = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: sal,
      iterations: 100000, 
      hash: "SHA-256"
    },
    materialLlave,
    { name: "AES-GCM", length: 256 }, // AES de 256 bits
    false,
    ["encrypt", "decrypt"]
  );

  return llave;
}

// 2. Generar sal aleatoria para llaves diferentes
function generarSal() {
  return crypto.getRandomValues(new Uint8Array(16));
}

// 3. Iniciar la bóveda con la contraseña maestra
async function inicializarBoveda(passwordMaestra) {
  salGlobal = generarSal();
  llaveCifrado = await derivarLlave(passwordMaestra, salGlobal);
  console.log("Llave generada en el navegador. Nunca se enviará al servidor.");
  return true;
}

// 4. Cifrar un texto
async function cifrarTexto(texto) {
  if (!llaveCifrado) throw new Error("Bóveda no inicializada");

  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Vector de inicialización

  const textoCifrado = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    llaveCifrado,
    encoder.encode(texto)
  );

  const combined = new Uint8Array(iv.byteLength + textoCifrado.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(textoCifrado), iv.byteLength);

  return btoa(String.fromCharCode(...combined));
}

// 5. Descifrar un texto
async function descifrarTexto(textoCifradoBase64, passwordMaestra) {
  try {
    const combined = Uint8Array.from(atob(textoCifradoBase64), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const datos = combined.slice(12);

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

function simularCifrado(texto) {
  if (!texto) return "—";
  // Simulación visual usando btoa
  return btoa(texto + Math.random().toString(36)).substring(0, 40) + "...";
}