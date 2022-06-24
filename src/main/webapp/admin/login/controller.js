var backend = "http://localhost:8080/ExpedienteMedicoBackEnd/api";
const NET_ERR = 999;


function guardarAdmin(e){
    sessionStorage.setItem("admin", JSON.stringify(e));
}

function autentificarAdmin() {
  if (!validar()){
      errorMessage("Debe llenar todos los campos", $("#errorDiv"));
      return;
  }
  var aux = Object.fromEntries((new FormData($("#formulario").get(0))).entries());
  const request = new Request(backend + '/admin/'+aux.cedula+'/'+aux.contrasena, {
    method: 'GET',
    headers: {}
  });
  (async () => {
    try {
      const response = await fetch(request);
      if (!response.ok) {
        errorMessage(response.status, $("#errorDiv"));
        return;
      }
      valido = await response.json();
      if(!valido){
          errorMessage("Credenciales no validas", $("#errorDiv"));
          $('#x').text('');
        return;
      }
      guardarAdmin(aux);
      window.location.href = "../main/view.html";
      
    } catch (e) {
      errorMessage(NET_ERR, $("#errorDiv"));
    }
  })();
}


////////////////////////////////////////////////////////////
function loaded() {
  $("#login").click(autentificarAdmin);
}

$(loaded);