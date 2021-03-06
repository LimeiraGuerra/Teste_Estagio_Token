/**Recebe o evento de submit do form, pega os seus dados e faz a requisicao post para o cadastro */
document.forms["signupForm"].addEventListener("submit", (event) => {
    document.querySelector('.load-page').classList.remove('invisible');
    event.preventDefault()
    let form = event.target
    let request_json = {
        "login": form.login.value,
        "password": form.password.value,
        "name": form.name.value,
        "email": form.email.value
    }
    /**Realiza o cadastro por post, passando os parametros por json e verificando a resposta
     * A resposta abre uma modal de confirmacao de cadastro e envio de autenticacao por email
     */
    $.post("/signup", request_json)
    .fail((data) =>{
        if (data.status === 400 && data.responseJSON.message.includes("exists")){
            if (data.responseJSON.message.includes("email")){
                errorLabel("O email informado já existe.")
            }
            else if (data.responseJSON.message.includes("login")) {
                errorLabel("O login informado já existe.")
            }
        }else {errorLabel("Erro inesperado, tente novamente mais tarde.")}
        document.querySelector('.load-page').classList.add('invisible');
    })
    .done((data) =>{
        document.querySelector('.load-page').classList.add('invisible');
        let cModal = $('#successModal');
        cModal.find(".modal-body .email-link").text("Por favor, confirme o email enviado para "+ form.email.value);
        if (data.verification_url){
            cModal.find(".modal-body .alert").removeClass("d-none");
            cModal.find(".modal-body .alert span")[0].innerHTML = `Credenciais para a API de envio do email de confirmação não foram encontradas
            ou são referentes a um domínio gratuito para testes. 
            Clique <a href="${data.verification_url}">aqui</a> para validar como se fosse o link enviado no email`;
        }
        cModal.on('hide.bs.modal', ()=>{window.location.href = "/entrar"});
        cModal.modal('toggle');
    });
});
