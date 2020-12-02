var currentUser = null; /**Usuario ativo */
var events = {}; /**Eventos do usuario ativo */
var selectedEvent = null; /**Evento selecionado para visualizacao/edicao/exclusao */
var checkId = null; /**Id da funcao que checa o estado dos eventos */

/**Requisicao para retornar o usuario logado */
$.get("/login").done((userData) => {
    document.getElementById('nbMenuLink-3').innerHTML += userData.name.split(" ")[0]
    currentUser = userData;
    getAndLoadEvents(userData.id);
});

/**Checa a cada 3 segundos as datas dos eventos, para atualizar seus estados */
function startEventStateCheck() {
    checkId = setInterval(() => {
        Object.entries(events).forEach((e) => {
            if (moment(e[1].start_datetime) <= moment.now()) {
                if (moment(e[1].end_datetime) < moment.now()) {
                    changeEventState(e[0], true);
                } else { changeEventState(e[0], false); }
            }
        });
    }, 3000);
}

/**Para a checagem de estado dos eventos */
function stopEventStateCheck(){
    if (checkId != null) {
        clearInterval(checkId);
        checkId = null;
    }
}

/**Muda o estado do evento (proximo=azul, atual=verde, passado=cinza e em outra aba) */
function changeEventState(id, expired) {
    let card = document.querySelector(`[data-id="${id}"]`).parentElement;
    let classList = card.querySelector('.card-header').classList;
    if (expired) {
        classList.remove("bg-now");
        classList.add("bg-past");
        document.getElementById("past-events").append(card);
    }
    else {
        classList.remove("bg-future");
        classList.add("bg-now");
    }
}

/**Busca os eventos do usuario logado e os separa por estado e exibe no html (cards) */
function getAndLoadEvents(user_id) {
    stopEventStateCheck();
    $.get("/event/" + user_id).done((data) => {
        events = {};
        document.querySelectorAll("#upcoming-events, #past-events").forEach((board) => { board.innerHTML = ""; });
        data.events.forEach(event => {
            let upcomingDeck = document.getElementById("upcoming-events");
            let pastDeck = document.getElementById("past-events");
            events[event.id] = event;
            if (moment(event.end_datetime) > moment.now()) {
                if (moment(event.start_datetime) <= moment.now()) {
                    createAndAddEvents(upcomingDeck, event, "bg-now");
                } else { createAndAddEvents(upcomingDeck, event, "bg-future"); }
            } else {
                createAndAddEvents(pastDeck, event, "bg-past");
            }
        });
    });
    startEventStateCheck();
}

/**Cria os elementos html dos eventos (cards) de acordo com seu estado */
function createAndAddEvents(deck, eventsObj, headerType) {
    let parent = document.createElement('div')
    parent.innerHTML =
        `<div class="card border-secondary" data-id="${eventsObj.id}" data-toggle="modal" data-target="#formModal">
        <div class="card-header p-0 d-flex text-center ${headerType}">
            <div class="d-block w-100 separator-left">
                <span class="label-sm">Começa:</span>
                <h6>${viewDateFormat(eventsObj.start_datetime)}</h6>
            </div>
            <div class="d-block w-100">
                <span class="label-sm">Termina:</span>
                <h6>${viewDateFormat(eventsObj.end_datetime)}</h6>
            </div>
        </div>
        <div class="card-body">
            <h4>${eventsObj.name}</h4>
        </div>
        <div class="card-footer">
            <small class="text-muted">Última modificação: ${viewDateFormat(eventsObj.last_modification)}</small>
        </div>
    </div>`;
    parent.classList.add('mt-3');
    parent.classList.add('col-xl-4');
    parent.classList.add('col-md-6');
    parent.classList.add('col-sm-12');
    parent.classList.add('event-card');
    deck.appendChild(parent);
}

/**Abre a modal a partir do clique em um evento ou no botao de novo evento */
$('#formModal').on('show.bs.modal', (e) => {
    eventDetails($(e.relatedTarget)[0], currentUser.name);
});

/**Desmarca o evento selecionado para ser exibido na modal assim que ela fechar */
$('#formModal').on('hidden.bs.modal', () => {
    selectedEvent = null;
});

/**Preenche a modal e configura seu campos de acordo com o elemento passado */
function eventDetails(element) {
    let modal = document.getElementById("formModal")
    document.querySelector(".alert").classList.add("d-none");
    /**Se o elemento passado for o botao, abre a modal com os campos limpos para serem preechidos */
    if (element.id == "addEvent") {
        modal.querySelector(".modal-title").innerHTML = "Novo Evento"
        dtPickerSetAndToggle(false)
        inputSetAndToggle("eventNameIn", "", false);
        inputSetAndToggle("eventDescTa", "", false);
        modal.querySelector(".modal-footer").classList.remove("d-none");
        modal.querySelectorAll("#edit-bt, #delete-bt").forEach((e) => { e.classList.add("d-none") });
    }
    /**Se o elemento passado for um evento, preenche os campos da modal e marca como modo leitura */
    else {
        selectedEvent = events[element.getAttribute("data-id")];
        modal.querySelector(".modal-title").innerHTML = "Visualizar Evento"
        dtPickerSetAndToggle(true)
        inputSetAndToggle("eventNameIn", selectedEvent.name, true);
        inputSetAndToggle("eventDescTa", selectedEvent.description, true);
        modal.querySelector(".modal-footer").classList.add("d-none");
        if (element.querySelector(".bg-future")) {
            modal.querySelectorAll("#edit-bt, #delete-bt").forEach((e) => { e.classList.remove("d-none") });
        } else {
            modal.querySelector("#edit-bt").classList.add("d-none");
            modal.querySelector("#delete-bt").classList.remove("d-none");
        }
    }
}

/**Ativa os campos da modal para editar o evento exibido nela */
document.getElementById("edit-bt").addEventListener("click", () => {
    document.querySelector("#formModal .modal-footer").classList.remove("d-none");
    document.getElementById("eventForm").querySelectorAll("input, textarea").forEach((e) => {
        e.readOnly = false;
    });
});

/**Recebe um id do campo e o preenche com o valor informado, marcando ou desmarcando o modo somente leitura */
function inputSetAndToggle(inputId, value, toggle) {
    let input = document.getElementById(inputId);
    input.value = value;
    input.readOnly = toggle;
}

/**Preenche o campo de datas com de acordo com o modo de exibicao da modal, e atualiza suas configuracoes */
function dtPickerSetAndToggle(toggle) {
    let dt1 = $("#datetimepicker1");
    let dt2 = $("#datetimepicker2");
    if (toggle) {
        /**Se for verdadeiro, marca os campos com os dados do evento */
        let startDt = viewDateFormat(selectedEvent.start_datetime);
        let endDt = viewDateFormat(selectedEvent.end_datetime);
        inputSetAndToggle("datetimepickerIn1", startDt, toggle);
        dt1.datetimepicker('viewDate', startDt);
        dt1.datetimepicker('maxDate', endDt)
        inputSetAndToggle("datetimepickerIn2", endDt, toggle);
        dt2.datetimepicker('viewDate', endDt);
        dt2.datetimepicker('minDate', startDt)
    } else {
        /**Se falso, limpa os campos e volta ao padrao */
        inputSetAndToggle("datetimepickerIn1", "", toggle);
        dt1.datetimepicker('viewDate', null);
        dt1.datetimepicker('maxDate', false);
        dt1.datetimepicker('clear');
        inputSetAndToggle("datetimepickerIn2", "", toggle);
        dt2.datetimepicker('viewDate', null);
        dt2.datetimepicker('minDate', moment());
        dt2.datetimepicker('clear');
    }
}

/**Realiza a delecao de um evento exibido na modal */
document.getElementById("delete-bt").addEventListener("click", (event) => {
    if (selectedEvent != null && currentUser != null) {
        let cModal = $('#confirmationModal');
        cModal.find(".modal-body p").text("Deseja realmente excluir?")
        cModal.modal('toggle');
        document.getElementsByClassName("btn-confirm")[0].addEventListener("click", () => {
            document.querySelector('.load-page').classList.remove('invisible');
            /**Requisicao do tipo delete, caso sucesso atualiza os eventos, senao retorna um erro */
            $.ajax({ url: `/event/${currentUser.id}/${selectedEvent.id}`, type: 'DELETE' })
                .done(() => {
                    document.forms["eventForm"].reset();
                    cModal.modal('toggle');
                    $('#formModal').modal('toggle');
                    getAndLoadEvents(currentUser.id);
                    document.querySelector('.load-page').classList.add('invisible');
                })
                .fail(() => {
                    errorLabel("Erro inesperado, tente novamente mais tarde.");
                    document.querySelector('.load-page').classList.add('invisible');
                });
        });
    }
});

/**Recebe uma data no formato iso (YYYY-MM-DD HH:mm) e passa no formato de exibicao pt-br (DD/MM/YYYY HH:mm) */
function viewDateFormat(strDateISO) {
    return moment(strDateISO).format("DD/MM/YYYY HH:mm")
}

/**Recebe uma data no formato pt-br (DD/MM/YYYY HH:mm) e passa no formato iso (YYYY-MM-DD HH:mm) */
function isoDateFormat(strDateView) {
    return moment(strDateView, "DD/MM/YYYY HH:mm").format("YYYY-MM-DD HH:mm")
}

/**Recebe o evento de submit do form, pega os seus dados e faz a requisicao de acordo com o contexto */
document.forms["eventForm"].addEventListener("submit", (event) => {
    event.preventDefault()
    let form = event.target
    let request_json = {
        "start_datetime": isoDateFormat(form.iniDateTime.value),
        "end_datetime": isoDateFormat(form.endDateTime.value),
        "name": form.eventName.value,
        "description": form.eventDesc.value
    }
    if (currentUser != null) {
        document.querySelector('.load-page').classList.remove('invisible');
        if (selectedEvent == null) {
            /**Caso nao tenha um evento selecionado, cria um novo evento */
            saveNewEvent(request_json, form);
        } else {
            /**Caso tenha um evento selecionado, edita o mesmo */
            editSelectedEvent(request_json, form);
        }
    }
});

/**Faz a requisicao do tipo post para criar um novo evento, passando os parametros por json */
function saveNewEvent(request_json, form) {
    /**Caso de sucesso salva o novo evento e atualiza a exibicao, caso falhe retorna os erros */
    $.post("/event/" + currentUser.id, request_json)
        .fail((data) => {
            if (data.status === 400) {
                if (data.responseJSON.message.includes("overlap")) {
                    errorLabel("O período informado não pode sobrepor o de outros eventos.")
                }
                if (data.responseJSON.message.includes("chronological")) {
                    errorLabel("O período informado está inválido.")
                }
            } else { errorLabel("Erro inesperado, tente novamente mais tarde.") }
            document.querySelector('.load-page').classList.add('invisible');
        })
        .done(() => {
            form.reset();
            $('#formModal').modal('toggle');
            getAndLoadEvents(currentUser.id);
            document.querySelector('.load-page').classList.add('invisible');
        });
}

/**Faz a requisicao do tipo put para editar um evento selecionado, passando os novos parametros por json */
function editSelectedEvent(request_json, form) {
    /**Caso de sucesso salva a edicao e atualiza a exibicao, caso falhe retorna os erros */
    $.ajax({
        url: `/event/${currentUser.id}/${selectedEvent.id}`,
        type: 'PUT',
        data: request_json
    })
    .done(() => {
        form.reset();
        $('#formModal').modal('toggle');
        getAndLoadEvents(currentUser.id);
        document.querySelector('.load-page').classList.add('invisible');
    }).fail((data) => {
        if (data.status === 400) {
            if (data.responseJSON.message.includes("overlap")) {
                errorLabel("O período informado não pode sobrepor o de outros eventos.")
            }
            if (data.responseJSON.message.includes("chronological")) {
                errorLabel("O período informado está inválido.")
            }
        } else { errorLabel("Erro inesperado, tente novamente mais tarde.") }
        document.querySelector('.load-page').classList.add('invisible');
    });
}