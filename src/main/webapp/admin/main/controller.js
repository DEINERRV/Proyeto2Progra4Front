var doctores = [];
var backend = "http://localhost:8080/ExpedienteMedicoBackEnd/api";
const NET_ERR = 999;

async function cargarDocs() {
    const request = new Request(backend + '/doctores/estado/' + 0, {method: 'GET', headers: {}});
    try {
        const response = await fetch(request);
        if (!response.ok) {
            errorMessage(response.status, $("#buscarDiv #errorDiv"));
            return;
        }
        doctores = await response.json();
        list();
    } catch (e) {
        errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
    }
}

function list() {
    $('#docs').empty();
    doctores.forEach((d) => {
        $('#docs').append(`
        <li class="list-group-item d-flex justify-content-between">
            <p id="info" class="w-100 m-0 p-2">${d.cedula} / ${d.nombre}</p>
            <button type="button" class="btn btn-primary" id="aceptar">Aceptar</button>
        </li>
        `);

        $('.list-group-item #info').last().on('click', () => {
            show(d);
        });
        $('.list-group-item #aceptar').last().on('click', () => {
            aceptarDoc(d);
        });
    });
}

function show(d) {
    $('#nom').text(d.nombre);
    $('#body').empty();
    $('#body').append(`
        <p><b>Cedula:</b> ${d.cedula}</p>
        <p><b>Correo:</b> ${d.correo}</p>
        <p><b>Locacion:</b> ${d.locacion}</p>
        <p><b>Especialidad:</b> ${d.especialidad}</p>
        <p><b>Precio por Consulta:</b> ${d.precio}</p>
        <p><b>Tiempo por Consulta:</b> ${d.tiempo}</p>
    `);
    $('#add-modal').modal('show');
}

async function aceptarDoc(d) {
    const request = new Request(backend + '/doctores/' + d.cedula, {method: 'PUT', headers: {}});

    try {
        const response = await fetch(request);
        if (!response.ok) {
            errorMessage(response.status, $("#add-modal #errorDiv"));
            return;
        }
        cargarDocs();
    } catch (e) {
        errorMessage(NET_ERR, $("#add-modal #errorDiv"));
    }
}



////////////////////////////////////////////////////////////
function loaded() {
    cargarDocs();
    crearSideVarAdmin();
    root='../../';
}

$(loaded);

