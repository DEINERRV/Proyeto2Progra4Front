var personas = new Array();
var persona = {id:0,cedula:'',nombre:'',sexo:'',correo:'',enfermedades:[]};
var doctor;
var enfermedades;
var mode = 'A'; //adding
var perId;
var backend = "http://localhost:8080/ExpedienteMedicoBackEnd/api";
const NET_ERR = 999;


function render() {
    $("#cedula").val(persona.cedula);
    $("#nombre").val(persona.nombre);
    $("#correo").val(persona.correo);
    $("input[name='sexo']").val([persona.sexo]);
    $("#id").val(persona.id);
    switch (mode) {
        case 'A':
            $("#cedula").prop("readonly", false);
            $('#aplicar').off('click').on('click', add);
            break;
        case 'E':
            $("#cedula").prop("readonly", true);
            $('#aplicar').off('click').on('click', update);
            break;
    }
    cargarEnfermedades();
    $('#add-modal').modal('show');  
}

async function fetchAndList() {
    const request = new Request(backend + '/personas/'+doctor.cedula, {method: 'GET', headers: {}});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#buscarDiv #errorDiv"));
                return;
            }
            personas = await response.json();
            list();
        } catch (e) {
            errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
        }
    })();
}

function list() {
    $("#listado").html("");
    personas.forEach((p) => {
        row($("#listado"), p);
    });
}

function row(listado, persona) {
    var tr = $("<tr />");
    tr.html(`<td>${persona.cedula}</td>
                 <td>${persona.nombre}</td>
                 <td><img src='../../../img/${persona.sexo}.png' class='icon' ></td>
                 <td id='edit'><img src='../../../img/edit.png'></td>
                 <td class="d-none">${persona.id}</td>
                 <td class=""><div>
                                    <input type="button" id="verCitas" class="btn btn-primary btn-block" value="ver citas">
                                </div></td>
                 <td class=""><div>
                                    <input type="button" id="agregar cita" class="btn btn-primary btn-block" value="agregar cita">
                                </div></td>
                 <td class=""><div>
                                    <input type="button" id="examenes" class="btn btn-primary btn-block" value="examenes">
                                </div></td>
    `);
    tr.find("#edit").on("click", () => {
        edit(persona.cedula);
        perId = persona.id;
    });
    tr.find('#verCitas').on('click',()=>{
        redirect(persona.cedula,"../../../doctor/personas/citas/view.html");
    });
    tr.find('#examenes').on('click',()=>{
        redirect(persona.cedula,"../../../doctor/personas/examenes/view.html");
    });
    listado.append(tr);
}


////////////////////////////////////////////////////////////
function cargarEnfermedades(){
    const request = new Request(backend + '/enfermedades', {method: 'GET', headers: {}});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#buscarDiv #errorDiv"));
                return;
            }
            enfermedades = await response.json();
            listEnfermedades()
            renderEnfermedades(persona);
        } catch (e) {
            errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
        }
    })();
}

function listEnfermedades(){
    $("#form-enfermedades").empty();
    enfermedades.forEach((e) => {
        $('#form-enfermedades').append(`
        <div class="form-group form-enf">
         <input class="form-check-input ml-0" type="checkbox" id="enfermedad" value="${e.id}-${e.nombre}">
         <p class="ml-4">${e.nombre}</p>
        </div> `);
    });
}

function recolectarEnfermedades(){
    persona.enfermedades = [];
    $(".form-enf").each(
    (i, e) => {
      var obj = new Object();
      if(e.querySelector("#enfermedad").checked){
          var obj = new Object();
          var datos = e.querySelector("#enfermedad").value.split('-');
          obj.id = parseInt(datos[0]);
          obj.nombre = datos[1];
          persona.enfermedades.push(obj);
      }
    }
  );
}

function renderEnfermedades(p){
    p.enfermedades.forEach((e)=>{
       $(".form-enf").each(
        (i,d) => {
            if(e.id.toString() === d.querySelector("#enfermedad").value.split('-')[0]){
                d.querySelector("#enfermedad").checked = true;
            }
        }); 
    });
}

////////////////////////////////////////////////////////////
function load() {
    x = Object.fromEntries((new FormData($("#formulario").get(0))).entries());
    persona.id = 0;
    persona.cedula = x.cedula;
    persona.nombre = x.nombre;
    persona.sexo = x.sexo;
    persona.correo = x.correo;
    recolectarEnfermedades();
}

function reset() {
    persona = {id:0,cedula:'',nombre:'',sexo:'',correo:'',enfermedades:[]};
}

////////////////////////////////////////////////////////////
function add() {
    if (!validar())
        return;
    doctor = JSON.parse(sessionStorage.getItem('doctor'));
    load();
    const request = new Request(backend + '/personas/'+doctor.cedula,
            {method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(persona)});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#add-modal #errorDiv"));
                return;
            }
            await fetchAndList();
            reset();
            $('#add-modal').modal('hide');
        } catch (e) {
            errorMessage(NET_ERR, $("#add-modal #errorDiv"));
        }
    })();
}

function update() {
    load();
    if (!validar())
        return;
    const request = new Request(backend + '/personas/' + perId,
            {method: 'PUT', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(persona)});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#add-modal #errorDiv"));
                return;
            }
            fetchAndList();
            reset();
            $('#add-modal').modal('hide');
        } catch (e) {
            errorMessage(NET_ERR, $("#add-modal #errorDiv"));
        }
    })();
}


////////////////////////////////////////////////////////////
function edit(cedula) {
    const request = new Request(backend + '/personas/' + doctor.cedula +'/'+cedula, {method: 'GET', headers: {}});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#buscarDiv #errorDiv"));
                return;
            }
            persona = await response.json();
            mode = 'E'; //editing
            render();
        } catch (e) {
            errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
        }
    })();
}

function redirect(cedula,dir) {
    const request = new Request(backend + '/personas/' + doctor.cedula +'/'+cedula, {method: 'GET', headers: {}});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#buscarDiv #errorDiv"));
                return;
            }
            persona = await response.json();
            await sessionStorage.setItem("persona", JSON.stringify(persona));
            window.location.href = dir;
        } catch (e) {
            errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
        }
    })();
}

function makenew() {
    reset();
    mode = 'A'; //adding
    render();
}

function search() {
    //to do
}


////////////////////////////////////////////////////////////
function loaded() {
    cargarDoctor();
    crearSideVar('../../../');
    fetchAndList();
    $("#crear").click(makenew);
    $("#buscar").on("click", search);
    root='../../../';
}

$(loaded);
