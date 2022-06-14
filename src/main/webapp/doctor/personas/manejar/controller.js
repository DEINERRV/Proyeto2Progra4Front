var personas = new Array();
var persona = {cedula: "", nombre: "", sexo: ""};
var doctor;
var mode = 'A'; //adding
var backend = "http://localhost:8080/ExpedienteMedicoBackEnd/api";
const NET_ERR = 999;

function render() {
    $("#cedula").val(persona.cedula);
    $("#nombre").val(persona.nombre);
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
    $('#add-modal').modal('show');
}


function load() {
    persona = Object.fromEntries((new FormData($("#formulario").get(0))).entries());
}

function reset() {
    persona = {cedula: "", nombre: "", sexo: ""};
}

function add() {
    load();
    if (!validar())
        return;
    doctor = JSON.parse(sessionStorage.getItem('doctor'));
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
            fetchAndList();
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
    const request = new Request(backend + '/personas/' + persona.id,
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
                <td class="invisible">${persona.id}</td>
                 <td><img src='/img/${persona.sexo}.png' class='icon' ></td>
                 <td id='edit'><img src='/img/edit.png'></td>`);
    tr.find("#edit").on("click", () => {
        edit(persona.id);
    });
    listado.append(tr);
}

function edit(id) {
    const request = new Request(backend + '/personas/' + id, {method: 'GET', headers: {}});
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

function makenew() {
    reset();
    mode = 'A'; //adding
    render();
}

function search() {
    //to do
}


function fetchAndList() {
    doctor = sessionStorage.getItem("doctor");
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

function loaded() {
    crearSideVar('../../../');
    fetchAndList();
    $("#crear").click(makenew);
    $("#buscar").on("click", search);
}

$(loaded);
