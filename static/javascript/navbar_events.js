/**Abre a modal de confirmacao do logout */
document.getElementById("logoutBt").addEventListener("click", () =>{
    let cModal = $('#confirmationModal');
    cModal.find(".modal-body p").text("Deseja realmente sair?")
    cModal.modal('toggle');
    document.getElementsByClassName("btn-confirm")[0].addEventListener("click", () =>{
        $.post("/logout").done(() => {
            window.location.href = "/entrar";
        });
    });
});

//**Limpa o form quando a pagina carrega */
document.forms['eventForm'].reset();

/**Muda o tipo de visualizacao dos eventos pelos botoes da barra de navegacao */
document.querySelectorAll("#upcomingBt, #pastBt").forEach((bt)=>{
    bt.addEventListener("click", (event)=>{
        let upcoming = document.getElementById("upcoming-events");
        let past = document.getElementById("past-events");
        if (event.target.id == "upcomingBt") {
            upcoming.classList.remove("d-none");
            past.classList.add("d-none");
        }
        else if (event.target.id == "pastBt") {
            upcoming.classList.add("d-none");
            past.classList.remove("d-none");
        }
    });
});