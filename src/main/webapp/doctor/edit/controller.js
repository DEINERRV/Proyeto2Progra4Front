var doctor = {
  cedula: "",
  nombre: "",
  especialidad: "",
  correo:"",
  locacion:"",
  contrasena:"",
  precio: 0,
  tiempo: 0,
  horario:[]
};
var horario = [];
var dias = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
var id = "";
var backend = "http://localhost:8080/ExpedienteMedicoBackEnd/api";
const NET_ERR = 999;


function show() {
    mostrarHorario();
    $('#add-modal').modal('show');
}

function crearHorario() {
    for (i = 0; i < 5; i++) {
        $(".schedule-row").append(
                `<div class="col schedule-col">
        <div class="d-flex gap-1">
        <input class="form-check-input" type="checkbox" id="checked">
        <p>${dias[i]}</p>
        </div>
        
        <div class="schedule-body">
            <div class="d-flex gap-1 mb-2  align-items-start">
            <p>Desde</p>
            <select id="desde">
            <option value="8" selected>8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
            </select>
            </div>
            <div class="d-flex gap-1  align-items-start">
            <p>Hasta</p>
            <select id="hasta">
            <option value="8" selected>8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
            </select>
            </div>
          </div>
        </div>`
                );
    }

    $(".schedule-col #checked").click(
            (e) => {
        e.target.parentNode.parentNode.querySelector(".schedule-body").classList.toggle("active");
    })
}


function mostrarHorario() {
    $(".schedule-col").each(
            (i, e) => {
        e.querySelector("#checked").checked = false;
        e.querySelector(".schedule-body").classList.remove("active");
        e.querySelector("#desde").value = "8";
        e.querySelector("#hasta").value = "8";
        if (horario.length != 0 && horario[i].trabaja) {
            e.querySelector("#checked").checked = true;
            e.querySelector(".schedule-body").classList.add("active");
            e.querySelector("#desde").value = horario[i].desde;
            e.querySelector("#hasta").value = horario[i].hasta;
        }
    }
    )
}


function loaded() {
    cargarDoctor();
    crearSideVar('../../');
    crearHorario();
    cargarDoctor();
    $("#horario").click(show);
}

$(loaded);