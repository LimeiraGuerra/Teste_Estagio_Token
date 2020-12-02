/**Configuracao inicial dos inputs de data e hora da lib datetimepicker */
$(function () {
    $('#datetimepicker1').datetimepicker({
        minDate: moment(),
        defaultDate: moment().add(1, 'minute'),
        format: 'DD/MM/YYYY HH:mm',
        locale: 'pt-br',
        useCurrent: false
    });
    $('#datetimepicker2').datetimepicker({
        minDate: moment(),
        defaultDate: moment().add(2, 'minute'),
        format: 'DD/MM/YYYY HH:mm',
        locale: 'pt-br',
        useCurrent: false
    });
    /**Funcoes que bloqueam a escolha de datas sem padrao cronologico */
    $("#datetimepicker1").on("change.datetimepicker", function (e) {
        $('#datetimepicker2').datetimepicker('minDate', e.date);
    });
    $("#datetimepicker2").on("change.datetimepicker", function (e) {
        $('#datetimepicker1').datetimepicker('maxDate', e.date);
    });
});