// Import del script de iniciar base de datos:
import { bd,TABLA_USERS,iniciarBaseDatos} from '/scripts/scriptIniciarBD.js';

//DOM
let loginButton = document.querySelector('#loginButton');
 // Botón de login:
 loginButton.addEventListener('click', login);

 // Para login de usuarios, si introduce bien la contraseña entra, sino lanza aviso para volver a introducir datos:
function login(){

    // Capturamos los datos introducidos por usuario en login:
    let userNameLogin = document.querySelector('#userNameLogin').value.trim();
    let passwordLogin = document.querySelector('#passwordLogin').value.trim(); 
  
    leerDatosLogin(userNameLogin,passwordLogin);
  }

  function leerDatosLogin(userNameLogin, passwordLogin) {

    iniciarBaseDatos();

    let transaccion = bd.transaction(TABLA_USERS, 'readwrite');
    let usuarios = transaccion.objectStore(TABLA_USERS);
    let nombreUsuario;
    let contraseña;
    let avatar;
    let rol;
    let conectado;
    // Boolean que controla si se encuentra al usuario en la bd
    let encontradasCredenciales = false;
  
    let cursorRequest = usuarios.openCursor();
  
    cursorRequest.onsuccess = function (event) {
      let cursor = event.target.result;
  
      if (cursor) {
        nombreUsuario = cursor.value.userName;
        contraseña = cursor.value.password;
        avatar = cursor.value.avatar;
        rol = cursor.value.rol;
        conectado = cursor.value.conectado;

         // Encriptar la contraseña con sjcl
          let miClave = "mi_contraseña";
          let desencryptedData = sjcl.decrypt(miClave, contraseña);
          // console.log(desencryptedData);
  
        // Comparar los datos introducidos con los datos que existen en la db
        // para ver si existe el usuario en la base de datos
        if (userNameLogin === nombreUsuario && passwordLogin === desencryptedData) {
          // Actualizar el estado de conexión en la base de datos
          cursor.value.conectado = 1;
          cursor.update(cursor.value);

          encontradasCredenciales = true;
  
          // Actualizar la interfaz de usuario
          document.getElementById('avatarUsuario').setAttribute('src', avatar);
          document.getElementById('nombreUsuario').textContent = `Hola ${nombreUsuario}`;
  
          if (rol === 'usuario') {

            // Sino le pongo el setTimeOut las operaciones se realizan tan deprisa
            // que no se me actualiza el estado del cursor a 1, es decir, no conecta al usuario a pesar de entrar en el condicional
            // y estar todo correcto
            setTimeout(function () {
              window.location.href = "index.html";
            }, 500);
            document.querySelector('#settings').style.display = 'block';
            
  
          } else if (rol === 'administrador') {

            document.querySelector('#admin').style.display = 'block';
            // Sino le pongo el setTimeOut las operaciones se realizan tan deprisa
            // que no se me actualiza el estado del cursor a 1, es decir, no conecta al usuario a pesar de entrar en el condicional
            // y estar todo correcto
            setTimeout(function () {
              window.location.href="admin.html";
            }, 500);
            
          }
         
        } else {
          
        }
  
        cursor.continue();

      } else {
        
      }
      
    };
    cursorRequest.onerror = function (event) {
      console.error("Error al abrir el cursor:", event.target.error);
    };

    // Cuando se haya recorrido todo el cursor
    transaccion.oncomplete = function () {

      if (!encontradasCredenciales) {
        // Informar al usuario y redirigir a la página de registro si desea registrarse
        console.log("No encontramos sus datos, por favor, inténtelo de nuevo.");
        document.querySelector('.errorLogin').style.display = 'inline-block';
        document.querySelector('#userNameLogin').value = "";
        document.querySelector('#passwordLogin').value = "";
    }
      // bd.close();
    };
    
  }
  


    // EJECUCION DE APERTURA DE BASE DE DATOS Y RASTREO EN WEB DE USUARIOS CONECTADOS
    window.addEventListener('load', (event) =>{

        iniciarBaseDatos();
    
    });