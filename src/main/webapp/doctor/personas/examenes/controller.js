var persona;
var doctor;
var citas = [];
var examenes = [];
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


async function cargarCitas() {
    const request = new Request(backend + '/citas/' + persona.id, {method: 'GET', headers: {}});
    try {
        const response = await fetch(request);
        if (!response.ok) {
            errorMessage(response.status, $("#buscarDiv #errorDiv"));
            return;
        }
        citas = await response.json();
    } catch (e) {
        errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
    }
}

////////////////////////////////////////////////////////////
async function cargarDatos(){
    $('#listado').empty();
    await cargarCitas();
    cargarExamenes();
}

async function cargarExamenes() {
    await citas.reduce(async (memo, c) => {
        try {
            await memo;
            const request = new Request(backend + '/examenes/' + c.id +'/pdf', {method: 'GET', headers: {}});
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#buscarDiv #errorDiv"));
                return;
            }
            examenes = await response.json();
            list(c);
            
        } catch (e) {
            errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
        }
    }, undefined);
}

function list(cita) {
    examenes.forEach((p) => {
        row($("#listado"), p, cita);
    });
}

function row(listado, examen, cita) {
    var tr = $("<tr />");
    tr.html(`<td><a href="${backend}/examenes/${persona.id}/${cita.id}/${examen.nombre}/pdf">${examen.nombre}</a></td>
             <td>${new Date(cita.dia).toLocaleDateString('es-ES', {weekday: "long", year: "numeric", month: "short", day: "numeric"})}</td>
             <td>${cita.from}-${cita.to}</td>
             <td class=""><div>
               <input type="button" id="elim" class="btn btn-primary btn-block" value="Eliminar">
             </div></td>
    `);
    tr.find('#elim').on('click', () => {
        deletePDF(examen.id);
        cargarDatos();
    });
    listado.append(tr);
}


////////////////////////////////////////////////////////////
async function addExamen() {
    if (!validar()){
      errorMessage("Falta Algo", $("#add-modal-2 #errorDiv"));
      return;
    }
    
    var idCita = parseInt($('#cita option:selected').val());
    pdf.nombre = $('#nom').val();
    pdf.idPersona = persona.id;

    const request = new Request(backend + '/examenes/' + idCita,
            {method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(pdf)});

    try {
        const response = await fetch(request);
        if (!response.ok) {
            errorMessage("Ya existe un Archivo con el mismo nombre relacionado al item", $("#add-modal #errorDiv"));
            return;
        }
        await addPDF(idCita,pdf.nombre);
        $('#nom').val('');
        $("#examen").val('');
        $('#add-modal').modal('hide');
    } catch (e) {
        errorMessage(NET_ERR, $("#add-modal #errorDiv"));
    }
}

async function addPDF(idCita,nom) {
    var pdfData = new FormData();
    pdfData.append("pdf", $("#examen").get(0).files[0]);
    let request = new Request(backend + '/examenes/'+persona.id + '/' + idCita +'/' + nom + '/pdf', {method: 'POST', body: pdfData});
    const response = await fetch(request);
    if (!response.ok) {
        errorMessage(response.status, $("#add-modal #errorDiv"));
        return;
    }
}


////////////////////////////////////////////////////////////
async function deletePDF(id){
    const request = new Request(backend + '/examenes/' + id + '/pdf', {method: 'DELETE', headers: {}});
    try {
        const response = await fetch(request);
        if (!response.ok) {
            errorMessage(response.status, $("#add-modal #errorDiv"));
            return;
        }
        cargarCitas();
    } catch (e) {
        errorMessage(NET_ERR, $("#add-modal #errorDiv"));
    }
}


////////////////////////////////////////////////////////////
async function showCitas(){
    await cargarCitas();
    $('#cita').empty();
    $('#cita').append(`<option value="0">NO RELACIONADO</option>`)
    citas.forEach((c) => {
        $('#cita').append(`
        <option value="${c.id}">${new Date(c.dia).toLocaleDateString('es-ES', {weekday: "long", year: "numeric", month: "short", day: "numeric"})}
        | ${c.from} - ${c.to}</option>
        `);
    });
}


////////////////////////////////////////////////////////////
function loaded() {
    cargarDoctor();
    cargarPersona();
    cargarDatos();
    $('#subir').click((e) => {
        showCitas();
        $('#add-modal').modal('show');
    });
    $('#agregarPDF').click((e) => {
        addExamen();
        cargarDatos();
    });
    crearSideVar('../../../');
    root='../../../';
}

$(loaded);