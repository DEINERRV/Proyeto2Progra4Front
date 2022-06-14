var doctor;
var horario = [];
var dias = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
var backend = "http://localhost:8080/ExpedienteMedicoBackEnd/api";
const NET_ERR = 999;


function cargarDoctor(id){
    const request = new Request(backend + '/doctores/'+id, {
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
      
      doctor = await response.json();
      await guardarDoctor(doctor);
      return;
      
    } catch (e) {
      errorMessage(NET_ERR, $("#errorDiv"));
    }
  })();
}

function guardarDoctor(e){
    sessionStorage.setItem("doctor", JSON.stringify(e));
}

function autentificarDoctor() {
  if (!validar()){
      errorMessage("Debe llenar todos los campos", $("#errorDiv"));
      return;
  }
  var aux = Object.fromEntries((new FormData($("#formulario").get(0))).entries());
  const request = new Request(backend + '/doctores/'+aux.cedula+'/'+aux.contrasena, {
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
        return;
      }
      
      await cargarDoctor(aux.cedula);
      
      await (window.location.href = "../doctor/edit/view.html");
      return;
      
    } catch (e) {
      errorMessage(NET_ERR, $("#errorDiv"));
    }
  })();
}


function loaded() {
  $("#login").click(autentificarDoctor);
}

$(loaded);