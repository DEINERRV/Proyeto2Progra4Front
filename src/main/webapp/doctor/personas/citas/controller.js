var persona;
var citas;
var cita;
var doctor;
var pdf = {id: 0, nombre: '', idPersona: 0, direccion: ''};
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
               <input type="button" id="exam" class="btn btn-primary btn-block" value="Examenes">
             </div></td>
             <td class=""><div>
               <input type="button" id="nota" class="btn btn-primary btn-block" value="Notas">
             </div></td>
             
    `);
    tr.find('#nota').on('click', () => {
        cargarCita(cita.id);
    });
    tr.find('#exam').on('click', () => {
        cargarExams(cita.id);
    });
    listado.append(tr);
}

////////////////////////////////////////////////////////////
function cargarExams(id) {
    const request = new Request(backend + '/examenes/' + id + '/pdf', {method: 'GET', headers: {}});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#buscarDiv #errorDiv"));
                return;
            }
            examenes = await response.json();
            $('#id-cita').text(id);
            showExamenes(examenes);
        } catch (e) {
            errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
        }
    })();
}

function showExamenes(examenes){
    $('#examenes').empty();
    examenes.forEach((e)=>{
        $('#examenes').append(`
            <li class="list-group-item d-flex justify-content-between">
                <a href="${backend}/examenes/${cita.id}/${e.nombre}/pdf">${e.nombre}</a>
                <div > <button type="button" class="close" id="elim" data-idPDF="${e.id}"> <span aria-hidden="true">&times;</span> </button> </div>
            </li>
            
        `);
    });
    $(".list-group-item #elim").click((e) => {deletePDF(e.currentTarget.dataset.idpdf);});
    $('#add-modal-2').modal('show');
}

async function addExamen() {
    var idCita = parseInt($('#id-cita').text());
    pdf.nombre = $('#nom').val();
    pdf.idPersona = persona.id;

    const request = new Request(backend + '/examenes/' + idCita,
            {method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(pdf)});

    try {
        const response = await fetch(request);
        if (!response.ok) {
            errorMessage("Ya existe un Archivo con el mismo nombre", $("#add-modal-2 #errorDiv"));
            return;
        }
        await addPDF(idCita,pdf.nombre);
        $('#nom').val('');
        $("#examen").val('');
        cargarExams(idCita);
    } catch (e) {
        errorMessage(NET_ERR, $("#add-modal-2 #errorDiv"));
    }
}

async function addPDF(id,nom) {
    var pdfData = new FormData();
    pdfData.append("pdf", $("#examen").get(0).files[0]);
    let request = new Request(backend + '/examenes/' + id +'/' + nom + '/pdf', {method: 'POST', body: pdfData});
    const response = await fetch(request);
    if (!response.ok) {
        errorMessage(response.status, $("#add-modal-2 #errorDiv"));
        return;
    }
}

async function deletePDF(id){
    const request = new Request(backend + '/examenes/' + id + '/pdf', {method: 'DELETE', headers: {}});
    try {
        const response = await fetch(request);
        if (!response.ok) {
            errorMessage(response.status, $("#add-modal-2 #errorDiv"));
            return;
        }
        cargarExams(cita.id);
    } catch (e) {
        errorMessage(NET_ERR, $("#add-modal-2 #errorDiv"));
    }
}

////////////////////////////////////////////////////////////
function cargarCita(id) {
    const request = new Request(backend + '/citas/esp/' + id, {method: 'GET', headers: {}});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#add-modal #errorDiv"));
                return;
            }
            cita = await response.json();
            show();
        } catch (e) {
            errorMessage(NET_ERR, $("#add-modal #errorDiv"));
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
function updateCita() {
    load();
    const request = new Request(backend + '/citas',
            {method: 'PUT', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(cita)});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#add-modal #errorDiv1"));
                return;
            }
            $('#add-modal').modal('hide');
        } catch (e) {
            errorMessage(NET_ERR, $("#add-modal #errorDiv1"));
        }
    })();
}

function load() {
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
    $('#agregarPDF').click((e) => {
        addExamen();
    });
}

$(loaded);



