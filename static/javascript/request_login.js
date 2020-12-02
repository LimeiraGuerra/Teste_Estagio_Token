/**Recebe o evento de submit do form, pega os seus dados e faz a requisicao post para o login */
document.forms["loginForm"].addEventListener("submit", (event) => {
    document.querySelector('.load-page').classList.remove('invisible');
    event.preventDefault()
    let form = event.target
    let request_json = {
        "login": form.login.value,
        "password": form.password.value
    }
    /**Realiza o login por post, passando os parametros por json e verificando a resposta */
    $.post("/login", request_json)
    .fail((data) =>{
        if (data.status === 401){errorLabel("O login ou senha estão incorretos.")}
        else if (data.status === 400) {errorLabel("O usuário não foi autenticado.")}
        else {errorLabel("Erro inesperado, tente novamente mais tarde.")}
        document.querySelector('.load-page').classList.add('invisible');
    })
    .done(() =>{
        document.querySelector('.load-page').classList.add('invisible');
        window.location.href = "/eventos";
    });
});

