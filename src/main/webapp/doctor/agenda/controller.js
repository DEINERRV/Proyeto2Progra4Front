var personas = new Array();
var semana = new Array();
var cita = {id:0,doctor:'',persona:0,texto:'',dia:'',from:'',to:''};
var backend = "http://localhost:8080/ExpedienteMedicoBackEnd/api";
const NET_ERR = 999;

function getSemanaAndShow(tipo,dia) {
    var url = '';
    if(tipo == 'actual') url = tipo;
    else if(tipo == 'anterior' || tipo == 'siguiente') url = tipo+'/'+dia;
    
    const request = new Request(backend + '/utiles/'+url, {method: 'GET', headers: {}});
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
        } catch (e) {
            errorMessage(NET_ERR, $("#buscarDiv #errorDiv"));
        }
    })();
}

function genHeadCalendario(){
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
    $("#id-calendar").empty();
    for (i = 8; i < 20;i) {
        for(j=0;j<=4;j++){
            var dia = doctor.horario[j];
            var obj = {clase:' ',id:' '};
            if(dia.checked && dia.from<=i && dia.to>i){
                obj.clase = 'bg-secondary';
                obj.id = 'cita';
                horario[j] = obj;
            }
            else{
                horario[j] = obj;
            }
        }
        
        $("#id-calendar").append(
          `<tr class="tr-calendar">
            <td>${i}:${xs}</td>
            <td class="${horario[0].clase} no-events" id="${horario[0].id}" data-cita="${i}:${xs}" data-dia="${semana[0]}" rowspan="1"></td>
            <td class="${horario[1].clase} no-events" id="${horario[1].id}" data-cita="${i}:${xs}" data-dia="${semana[1]}" rowspan="1"></td>
            <td class="${horario[2].clase} no-events" id="${horario[2].id}" data-cita="${i}:${xs}" data-dia="${semana[2]}" rowspan="1"></td>
            <td class="${horario[3].clase} no-events" id="${horario[3].id}" data-cita="${i}:${xs}" data-dia="${semana[3]}" rowspan="1"></td>
            <td class="${horario[4].clase} no-events" id="${horario[4].id}" data-cita="${i}:${xs}" data-dia="${semana[4]}" rowspan="1"></td>
          </tr>`
        );

        x = x + doctor.tiempo;
        xs = x.toString();
        if(x===60){ 
            xs = '00';
            x = 0;
            i++;
        }
        else if(x<10) xs = '0' + xs;
    }
    
    $(".tr-calendar #cita").click(
    (e) => {
      show(e.currentTarget.dataset.dia,e.currentTarget.dataset.cita);
    });
}


function agregarPersonas(){
    $('#persona').empty();
    personas.forEach((p)=>{
        $('#persona').append(`
        <option value="${p.id}">${p.cedula}-${p.nombre}</option>
        `)
    });
}

function fetchAndList() {
    const request = new Request(backend + '/personas/'+doctor.cedula, {method: 'GET', headers: {}});
    (async () => {
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
    })();
}

function show(dia,hora){
    //agregar las personas al modal
    fetchAndList();
    //Abajo, obtener el hasta
    var hor = parseInt(hora.split(':')[0]);
    var min = parseInt(hora.split(':')[1])+doctor.tiempo;
    if(min>=60){
        hor++;
        min= '00';
    }
    else if(min<10) min = '0' + min.toString();
    cita.dia = dia;
    cita.from = hora;
    cita.to = hor+':'+min;
    //Agregar infor de la cita al modal
    $('#info-cita').empty();
    $('#info-cita').append('Para el '+dia+'  desde '+hora+' hasta '+hor+':'+min);
    //mostrar el modal
    $('#add-modal').modal('show');
}

function load(){
    cita.id = 0;
    cita.doctor = doctor.cedula;
    cita.persona = $('#persona option:selected').val();
    cita.texto = " ";
}

function agregarCitas(){
    
}

function loaded() {
    cargarDoctor();
    getSemanaAndShow('actual','');
    crearSideVar('../../');
    $('#ant').click((e)=>{ getSemanaAndShow('anterior',semana[0])});
    $('#prev').click((e)=>{ getSemanaAndShow('anterior',semana[0])})
    $('#aplicar').off('click').on('click', agregarCitas);
}

$(loaded);


