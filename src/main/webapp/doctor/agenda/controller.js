var personas = new Array();
var persona;
var semana = new Array();
var citasDia = new Array();
mode = 'A';
var cita = {id: 0, doc: '', per: 0, texto: '',motivo:'',prescripcion:'', dia: '', from: '', to: ''};
var backend = "http://localhost:8080/ExpedienteMedicoBackEnd/api";
const NET_ERR = 999;

function show(dia, hora, modo, idUs, idC, text,motivo,prescripcion) {
    var hoy;
    const request = new Request(backend + '/utiles/hoy', {method: 'GET', headers: {}});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#buscarDiv #errorDiv"));
                return;
            }
            hoy = await response.json();
            hoy = new Date(hoy);

            if (new Date(dia) < hoy && modo == 'no')
                return;

            //agregar las personas al modal
            await fetchAndList();

            //cambiar el modo
            switch (modo) {
                case 'no':
                    $('titulo').val('Agregar Cita');
                    $('#notas').addClass('d-none');
                    $('#aplicar').off('click').on('click', agregarCitas);
                    $('#modal-tam').removeClass('modal-lg');
                    $('#modal-tam').css({'width':'400px'});
                    $('#elim').addClass('d-none');
                    break;
                case 'si':
                    $('#titulo').text('Editar Cita');
                    //Traer la persona de la cita
                    await cargarPer(parseInt(idUs));
                    $('#notas').removeClass('d-none');
                    $('#aplicar').off('click').on('click', editCita);
                    if (typeof (persona) !== 'undefined') {
                        $('#persona').val(persona.id.toString());
                    }
                    $('#modal-tam').addClass('modal-lg');
                    $('#modal-tam').css({'width':''});
                    $('#elim').removeClass('d-none');
                    $('#elim').off('click').on('click',()=>{
                        elimCita(idC);
                        $('#add-modal').modal('hide');
                    });
                    break;
            }


            //Abajo, obtener el hasta
            var hor = parseInt(hora.split(':')[0]);
            var min = parseInt(hora.split(':')[1]) + doctor.tiempo;
            if (min >= 60) {
                hor++;
                min = '00';
            } else if (min < 10)
                min = '0' + min.toString();
            if (hor < 10) {
                hora = '0' + hora;
                hor = '0' + hor;
            }
            cita.dia = dia;
            cita.from = hora;
            cita.to = hor + ':' + min;
            //Agregar infor de la cita al modal
            $('#info-cita').empty();
            $('#info-cita').append('Para el ' + dia + '  desde ' + hora + ' hasta ' + hor + ':' + min);
            //Para el campo de texto
            $('#texto').val(text);
            $('#motivo').val(motivo);
            $('#prescripcion').val(prescripcion);
            //mostrar el modal
            $('#add-modal').modal('show');
            cita.id = idC;

        } catch (e) {
            errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
        }
    })();
}

function load() {
    cita.doc = doctor.cedula;
    cita.per = parseInt($('#persona option:selected').val());
    cita.texto = $('#texto').val();
    cita.motivo = $('#motivo').val();
    cita.prescripcion = $('#prescripcion').val();
}

function reset() {
    cita.id = 0;
    cita.per = 0;
    cita.dia = '';
    cita.from = '';
    cita.to = '';
    cita.texto = '';
    cita.motivo = '';
    cita.prescripcion = '';
}

async function fetchAndList() {
    const request = new Request(backend + '/personas/' + doctor.cedula, {method: 'GET', headers: {}});

    try {
        const response = await fetch(request);
        if (!response.ok) {
            errorMessage(response.status, $("#buscarDiv #errorDiv"));
            return;
        }
        personas = await response.json();
        agregarPersonas();
    } catch (e) {
        errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
    }

}

function agregarPersonas() {
    $('#persona').empty();
    $('#persona').append(`
        <option value="">Seleccione Un Paciente</option>
    `);
    personas.forEach((p) => {
        $('#persona').append(`
        <option value="${p.id}">${p.cedula}-${p.nombre}</option>
        `);
    });
}

async function cargarPer(id) {
    const request = new Request(backend + '/personas/id/' + id, {method: 'GET', headers: {}});

    try {
        const response = await fetch(request);
        if (!response.ok) {
            errorMessage(response.status, $("#buscarDiv #errorDiv"));
            return;
        }
        persona = await response.json();
    } catch (e) {
        errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
    }

}


///////////////////////////////////////////
function getSemanaAndShow(tipo, dia) {
    var url = '';
    if (tipo == 'actual')
        url = tipo;
    else if (tipo == 'anterior' || tipo == 'siguiente')
        url = tipo + '/' + dia;

    const request = new Request(backend + '/utiles/' + url, {method: 'GET', headers: {}});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#buscarDiv #errorDiv"));
                return;
            }
            semana = await response.json();
            genHeadCalendario();
            genCalendario();
            await getCitasAndVal();
            $(".tr-calendar #cita").click((e) => {
                show(e.currentTarget.dataset.dia, e.currentTarget.dataset.cita, e.currentTarget.dataset.reservada,
                    e.currentTarget.dataset.usu, e.currentTarget.dataset.id, e.currentTarget.dataset.text,
                    e.currentTarget.dataset.motivo, e.currentTarget.dataset.prescripcion);
            });

        } catch (e) {
            errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
        }
    })();
}

function genHeadCalendario() {
    $("#id-head-calendar").empty();
    $("#id-head-calendar").append(`
        <th>&nbsp;</th>
        <th width="20%">Lunes(${semana[0]})</th>
        <th width="20%">Martes(${semana[1]})</th>
        <th width="20%">Miercoles(${semana[2]})</th>
        <th width="20%">Jueves(${semana[3]})</th>
        <th width="20%">Viernes(${semana[4]})</th>
    `)
}

function genCalendario() {
    var x = 0;
    var xs = '00';
    var horario = [];
    const request = new Request(backend + '/utiles/hoy', {method: 'GET', headers: {}});
    $("#id-calendar").empty();
    for (i = 8; i < 20; i) {
        for (j = 0; j <= 4; j++) {
            var dia = doctor.horario[j];
            var obj = {clase: ' ', id: ' '};
            if (dia.checked && dia.from <= i && dia.to > i) {
                obj.clase = 'bg-secondary';
                obj.id = 'cita';
                horario[j] = obj;
            } else {
                horario[j] = obj;
            }
        }

        $("#id-calendar").append(
                `<tr class="tr-calendar">
            <td>${i}:${xs}</td>
            <td class="${horario[0].clase} 1 no-events" id="${horario[0].id}" data-reservada="no" data-usu="0" data-cita="${i}:${xs}" data-dia="${semana[0]}" rowspan="1"><p class="m-0 text-center text-white 1"></p></td>
            <td class="${horario[1].clase} 2 no-events" id="${horario[1].id}" data-reservada="no" data-usu="0" data-cita="${i}:${xs}" data-dia="${semana[1]}" rowspan="1"><p class="m-0 text-center text-white 2"></p></td>
            <td class="${horario[2].clase} 3 no-events" id="${horario[2].id}" data-reservada="no" data-usu="0" data-cita="${i}:${xs}" data-dia="${semana[2]}" rowspan="1"><p class="m-0 text-center text-white 3"></p></td>
            <td class="${horario[3].clase} 4 no-events" id="${horario[3].id}" data-reservada="no" data-usu="0" data-cita="${i}:${xs}" data-dia="${semana[3]}" rowspan="1"><p class="m-0 text-center text-white 4"></p></td>
            <td class="${horario[4].clase} 5 no-events" id="${horario[4].id}" data-reservada="no" data-usu="0" data-cita="${i}:${xs}" data-dia="${semana[4]}" rowspan="1"><p class="m-0 text-center text-white 5"></p></td>
          </tr>`
                );

        x = x + doctor.tiempo;
        xs = x.toString();
        if (x === 60) {
            xs = '00';
            x = 0;
            i++;
        } else if (x < 10)
            xs = '0' + xs;
    }
}


///////////////////////////////////////////
async function getCitasAndVal() {
    var numDia = 1;
    await semana.reduce(async (memo, d) => {
        try {
            await memo;
            const request = new Request(backend + '/citas/' + doctor.cedula + '/' + d, {method: 'GET', headers: {}});
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#buscarDiv #errorDiv"));
                return;
            }
            citasDia = await response.json();
            valAgenda(citasDia, numDia);
            numDia++;
        } catch (e) {
            errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
        }
    }, undefined);

}

function valAgenda(list, numDia) {
    list.forEach((c) => {
        var aux = ".tr-calendar #cita ." + numDia;
        try {
            $(aux).each((i, d) => {
                if ($(d).parent()[0].dataset.cita == c.from) {
                    $(d).parent().addClass("bg-dark");
                    $(d).text('RESERVADA');
                    $(d).parent()[0].dataset.usu = c.per;
                    $(d).parent()[0].dataset.reservada = "si";
                    $(d).parent()[0].dataset.id = c.id;
                    $(d).parent()[0].dataset.text = c.texto;
                    $(d).parent()[0].dataset.motivo = c.motivo;
                    $(d).parent()[0].dataset.prescripcion = c.prescripcion;
                    throw 'a';
                }
            });
        } catch (e) {
        }
    });
}


////////////////////////////////////////////
function agregarCitas() {
    if ($('#persona').val() == ""){
      errorMessage("Seleccione un Paciente Valido", $("#add-modal #errorDiv"));
      return;
    }
    load();
    const request = new Request(backend + '/citas',
            {method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(cita)});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#add-modal #errorDiv"));
                return;
            }
            getCitasAndVal();

            $('#add-modal').modal('hide');
        } catch (e) {
            errorMessage(NET_ERR, $("#add-modal #errorDiv"));
        }
    })();
    reset();
}


function editCita() {
    if ($('#persona-2').val() == ""){
      errorMessage("Seleccione un Paciente Valido", $("#add-modal-2 #errorDiv"));
      return;
    }
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
            getCitasAndVal();
            
            $('#add-modal').modal('hide');
        } catch (e) {
            errorMessage(NET_ERR, $("#add-modal #errorDiv"));
        }
    })();
    reset();
}


function elimCita(idCita){
    const request = new Request(backend + '/citas/' + idCita, {method: 'DELETE', headers: {}});
    (async () => {
        try {
            const response = await fetch(request);
            if (!response.ok) {
                errorMessage(response.status, $("#add-modal #errorDiv"));
                return;
            }
            location.reload();
            
        } catch (e) {
            errorMessage(NET_ERR, $("#add-modal #errorDiv"));
        }
    })();
    reset();
}

//////////////////////////////////
function loaded() {
    cargarDoctor();
    getSemanaAndShow('actual', '');
    crearSideVar('../../');
    $('#ant').click((e) => {
        getSemanaAndShow('anterior', semana[0])
    });
    $('#prev').click((e) => {
        getSemanaAndShow('siguiente', semana[0])
    });
    $('#aplicar').off('click').on('click', agregarCitas);
    root='../../';
}

$(loaded);


