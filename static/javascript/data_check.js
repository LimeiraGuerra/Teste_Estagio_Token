/**Escreve o erro em cima do form */
function errorLabel(message){
    let parent = document.querySelector(".alert");
    parent.innerHTML = `<span>${message}</span>`;
    parent.classList.remove("d-none");
}

/**Limpa os espacos em branco nos inputs e textareas toda vez q sairem de foco */
document.querySelectorAll("input, textarea").forEach((element) => {
    element.addEventListener("focusout", (event) => {
        let tgt = event.target;
        tgt.value = tgt.value.trim();
    });
});