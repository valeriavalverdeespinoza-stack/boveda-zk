# boveda-zk

#Proyecto Pasantía - Bóveda ZK

## Problema:
    - Las personas reutilizan contraseñas débiles en varios sitios, ya que les resulta difícil recordar muchas credenciales seguras, además desconfían de los gestores de contraseña porque creen que pueden ver o acceder a sus datos almacenados. 
## Nuestra Solución:
    - La solucon es desarrollar una bóveda educativa de contraseñas s¿basada en el Conocimiento Cero (Zero-Knowledge), donde las contraseñas se cifran directamente en el navegador antes de enviarse al servidor.
De esta forma: 
• La contraseña maestra nunca sale del dispositivo del usuario.
• Las credenciales se transforman en texto cifrado.
• El servidor almacena únicamente datos cifrados, sin poder leer su contenido.
• Aunque alguien acceda a la base de datos, no podrá conocer las contraseñas sin la clave maestra.
• El sistema educa al usuario mostrando  cómo los datos legibles se convierten en texto cifrado antes de viajar por Internet.
## Diseño de la solución:
## Pruebas:
## Consideraciones a pensar antes:
    Antes de desarrollar el proyecto tomamos en cuenta:
1. Definir cómo se protegerá la contraseña maestra.
2. Asegurar que el cifrado ocurra en el navegador y no en el servidor.
3. Diseñar una interfaz que muestre el proceso de cifrado y descifrado.
4. Mantener buenas prácticas en GitHub (commits y .gitignore).
5. Verificar que la demostración pruebe el concepto de Zero-Knowledge
## Tecnologías:
Frontend: HTML, CSS, JavaScript y Web Crypto API.
Backend: Python(Flask).
Trabajo en grupo: Git y GitHub.
Servidor: Servidor Linux con acceso SSH.
Almacenamiento: Base de datos que guarde la información cifrada.
## Código

- Funciones del Crypto API:

1.	derivarLlave: Convierte la contraseña maestra en llave criptográfica con PBKDF2
2.	generarSal: Genera datos aleatorios para hacer el cifrado único
3.	inicializarBoveda: Arranca todo cuando el usuario ingresa su contraseña maestra.
4.	cifrarTexto: Cifra con AES-GCM antes de enviar al servidor
5.	descifrarTexto: Descifra cuando el usuario quiere ver sus credenciales
6.	simularCifrado: Demo visual en tiempo real mientras el usuario escribeCrypto explicado por secciones: 

- Funciones del App Javascript:

1.	mostrarSeccion: Cambia entre las diferentes pantallas de la aplicación y muestra la sección seleccionada.
2.	registrar: Valida al usuario, inicializa la bóveda y genera la llave criptográfica a partir de la contraseña maestra.
3.	actualizarDemo: Simula visualmente el cifrado en tiempo real mientras el usuario escribe sus credenciales.
4.	cifrarYGuardar: Cifra el usuario y la contraseña antes de enviarlos al servidor para su almacenamiento.
5.	cargarDatosServidor: Obtiene las credenciales almacenadas en el servidor y muestra únicamente sus versiones cifradas.
6.	decifrarCredenciales: Recupera las credenciales cifradas desde el servidor y las descifra usando la contraseña maestra correcta.

