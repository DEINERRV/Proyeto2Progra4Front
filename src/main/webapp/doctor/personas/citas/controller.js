var persona;
var citas;
var cita;
var doctor;
var backend = "http://localhost:8080/ExpedienteMedicoBackEnd/api";
const NET_ERR = 999;

function cargarPersona() {
    persona = JSON.parse(sessionStorage.getItem('persona'));

    $('#titulo-per').text('Citas - ' + persona.nombre);
    $('#info-per').append(`
        <p class="mb-0 mt-2">CEDULA: ${persona.cedula}</p>
        <p>SEXO: ${persona.sexo}</p>
    `);
    persona.enfermedades.forEach((e) => {
        $('#enf-per').append(`
            <p class="mb-0">${e.nombre}</p>
        `)
    });
}

function cargarCitas() {
    const request = new Request(backend + '/citas/' + persona.id, {method: 'GET', headers: {}});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#buscarDiv #errorDiv"));
                return;
            }
            citas = await response.json();
            list();
        } catch (e) {
            errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
        }
    })();
}

function list() {
    $("#listado").html("");
    citas.forEach((p) => {
        row($("#listado"), p);
    });
}

function row(listado, cita) {
    var tr = $("<tr />");
    tr.html(`<td>${new Date(cita.dia).toLocaleDateString('es-ES', {weekday: "long", year: "numeric", month: "short", day: "numeric"})}</td>
             <td>${cita.from}-${cita.to}</td>
             <td class=""><div>
               <input type="button" id="nota" class="btn btn-primary btn-block" value="Notas">
             </div></td>
    `);
    tr.find('#nota').on('click', () => {
        cargarCita(cita.id);
    });
    listado.append(tr);
}

////////////////////////////////////////////////////////////
function cargarCita(id) {
    const request = new Request(backend + '/citas/esp/' + id, {method: 'GET', headers: {}});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#buscarDiv #errorDiv"));
                return;
            }
            cita = await response.json();
            show();
        } catch (e) {
            errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
        }
    })();
}

function show() {
    //Agregar la persona
    $('#persona').append(`
        <option value="${persona.id}">${persona.cedula}-${persona.nombre}</option>
        `)
    //Agregar infor de la cita al modal
    $('#info-cita').empty();
    $('#info-cita').append('Para el ' + cita.dia + '  desde ' + cita.from + ' hasta ' + cita.to);
    //Para el campo de texto
    $('#texto').val(cita.texto);
    $('#motivo').val(cita.motivo);
    $('#prescripcion').val(cita.prescripcion);
    //mostrar el modal
    $('#add-modal').modal('show');
}


////////////////////////////////////////////////////////////
function updateCita(){
    load();
    const request = new Request(backend + '/citas',
            {method: 'PUT', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(cita)});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#add-modal #errorDiv"));
                return;
            }
            $('#add-modal').modal('hide');
        } catch (e) {
            errorMessage(NET_ERR, $("#add-modal #errorDiv"));
        }
    })();
}

function load(){
    cita.texto = $('#texto').val();
    cita.motivo = $('#motivo').val();
    cita.prescripcion = $('#prescripcion').val();
}

////////////////////////////////////////////////////////////
function loaded() {
    cargarDoctor();
    cargarPersona();
    cargarCitas();
    crearSideVar('../../../');
    $('#aplicar').click((e) => {
        updateCita();
    });
}

$(loaded);



