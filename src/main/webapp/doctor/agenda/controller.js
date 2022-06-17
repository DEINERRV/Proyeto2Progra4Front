

function genCalendario() {
    var x = 0;
    var xs = '00';
    var horario = [];
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
            <td class="${horario[0].clase} no-events" id="${horario[0].id}" data-cita="1-${i}:${xs}" rowspan="1"></td>
            <td class="${horario[1].clase} no-events" id="${horario[1].id}" data-cita="2-${i}:${xs}" rowspan="1"></td>
            <td class="${horario[2].clase} no-events" id="${horario[2].id}" data-cita="3-${i}:${xs}" rowspan="1"></td>
            <td class="${horario[3].clase} no-events" id="${horario[3].id}" data-cita="4-${i}:${xs}" rowspan="1"></td>
            <td class="${horario[4].clase} no-events" id="${horario[4].id}" data-cita="5-${i}:${xs}" rowspan="1"></td>
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
      console.log(e.currentTarget.dataset.cita);
    });
}

function loaded() {
    cargarDoctor();
    genCalendario();
    crearSideVar('../../');
}

$(loaded);


