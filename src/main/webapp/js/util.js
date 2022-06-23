function crearSideVar(root) {
    $("#viewport").prepend(
      `<div id="sidebar">
      <header>
        <a href="#">Electronic Medical Record</a>
      </header>
      <ul class="nav d-flex flex-column justify-content-between">
        <div> 
            <li>
                <a href="${root}doctor/agenda/view.html">
                    <i class="zmdi zmdi-view-dashboard"></i> Calendario
                </a>
            </li>
            <li>
                <a href="${root}doctor/personas/manejar/view.html">
                    <i class="zmdi zmdi-link"></i> Personas
                </a>
            </li>
            <li>
                <a href="${root}doctor/edit/view.html">
                    <i class="zmdi zmdi-widgets"></i> Mi informacion
                </a>
            </li>
        </div>
        <div>
            <li>
                <img src="${backend}/doctores/${doctor.cedula}/imagen" alt="Foto Perfil" class="ml-4 img-thumbnail" style="width: 8rem; height: 8rem">
            </li>
            <li>
                <a href="#">
                    <i class="zmdi zmdi-comment-more"></i>Cerrar sesion
                </a>
            </li>
        </div>
        
      </ul>
    </div>`
    );
}


function validar() {
    var error = false;
    $("#formulario input").removeClass("is-invalid");
    error |= $("#formulario input").filter((i, e) => {
        return e.value == '';
    }).length > 0;
    $("#formulario input").filter((i, e) => {
        return e.value == '';
    }).addClass("is-invalid");
    return !error;
}


function errorMessage(status, place) {
    switch (status) {
        case 404:
            error = "Registro no encontrado";
            break;
        case 403:
        case 405:
            error = "Usuario no autorizado";
            break;
        case 406:
        case 405:
            error = "Usuario ya existe";
            break;
        case NET_ERR:
            error = "Error de comunicación";
            break;
        default:
            error = status;
    };
    place.empty();
    place.append('<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
            error +
            '<button type="button" class="ml-2 bg-transparent btn-close" data-bs-dismiss="alert" aria-label="Close"><span aria-hidden="true">X</span></button></div>');
    return;
}

function cargarDoctor(){
    doctor = JSON.parse(sessionStorage.getItem('doctor'));
    horario = doctor.horario;
    $("#cedula").val(doctor.cedula);
    $("#contrasena").val(doctor.contrasena);
    $("#nombre").val(doctor.nombre);
    $("#especialidad").val(doctor.especialidad);
    $("#correo").val(doctor.correo);
    $("#locacion").val(doctor.locacion);
    $("#precio").val(doctor.precio);
    $("#tiempo").val(doctor.tiempo);
}