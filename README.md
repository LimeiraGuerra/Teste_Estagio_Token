<h1 align="center">Meus Eventos</h1>

<p align="center">Sistema web de calendários de eventos realizado para o desafio de estágio da TokenLabs

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tecnologias">Tecnologias</a> •
  <a href="#pré-requisitos">Pré requisitos</a> •
  <a href="#como-usar">Como usar</a>
</p>

### Features

- [x] Cadastro de usuário e login para acesso ao sistema
  - [x] Suporte a vários usuários, com ativação do cadastro por um link
  - [x] Eventos ligados ao usuário que os criou
  - [x] Suporte a API de envio de email com o link de ativação do cadastro (desativado se não encontrar o json com as credenciais da api)
- [x] Adicão, edição, remoção e listagem de eventos
  - [x] Eventos possuem data e horário de início e fim, nome e descrição
  - [x] Eventos podem ter duração de vários dias/meses e até anos, cronológicamente
  - [x] Eventos não podem ser criados com datas e horas mais antigas que a atual
  - [x] Eventos não podem sobrescrever o período de duração de outros eventos já criados
- [x] Funcionalidades de eventos e usuários podem ser realizadas tanto pelo front quanto pelo uso da api (algumas funcionalidades necessitam que o usuário esteja logado para serem realizadas)

### Tecnologias

O projeto foi criado com as seguintes ferramentas:

- Backend
  - Python 3.9
  - Micro-framework Flask e Flask RESTful(api)
  - ORM SQLAlchemy
  - Banco de dados SQLite
  - Outras bibliotecas python auxiliares, lista completa disponível no arquivo [requirements.txt](requirements.txt)
  - API do MailGun para envio automático do email de confirmação, em sua versão gratuita (indisponível sem o arquivo credentials.json)
  
- Frontend
  - Bootstrap 4
  - jQuery e Popper.js (necessários para o Bootstrap 4)
  - Material icons
  - Moment.js
  - DateTimePicker Tempus Dominus - Bootstrap 4 (com modificações para aceitar ícones do Material icons)

### Pré-requisitos

Antes de começar, instale todas as bibliotecas python necessárias que se encontram no arquivo [requirements.txt](requirements.txt).
Certifique-se que está usando a versão do 3.9 do Python, versões anteriores não foram testadas.
Para instalar as bibliotecas do pip, certifique que o mesmo está na versão mais nova (atual 20.2.4) e pelo terminal (ou cmd) digite:
```bash
$ pip install -r requirements.txt
```
Para clonar esse repositório utilize o comando:
```bash
$ git clone https://github.com/LimeiraGuerra/Teste_Estagio_Token.git
```

### Como usar

O sistema (backend/api) é inicializado a partir do script [app.py](app.py), podendo ser executado como:
```bash
# Dentro de ./Teste_Estagio_Token/
$ python app.py
```

Por padrão, a aplicação roda em [localhost:5000](http://localhost:5000).

**Navegador**

Pelo navegador, o usuário é redirecionado para as páginas do front, onde deve-se realizar o cadastro, confirmar o cadastro e realizar o login.

A confirmação de cadastro é uma funcionalidade extra que é realizada pelo acesso a um link de confirmação. Se a aplicação encontrar o credentials.json (json com as credenciais da api de envio de emails), esse link será enviado ao email informado no cadastro (na versão 
do MailGun, apenas um endereço de email é válido). Se não possuir esse arquivo, o link de validação aparece na modal de confirmação do cadastro (temporário).

Ao realizar o login, o usuário poderá adicionar novos eventos, editá-los (apenas eventos que ainda não aconteceram), excluí-los e listar por Próximos Eventos e Eventos Passados. Também é possível realizar o logout.

**API**

As mesmas funcionalidades realizadas pelo navegador podem ser realizadas pela api.

Exemplos:

* Realização do cadastro
```http
POST /signup 
```
```javascript
//Body JSON
{
  "login": "userlogin",
  "password": "12345",
  "name": "username",
  "email": "user@email.com"
}
```
```javascript
//Resposta de sucesso - 201
{
  "message": "User created successfully!",
  "verification_url": "<url_de_verificacao>" // null se for enviado por email
}
```

* Realização do login
```http
POST /login
```
```javascript
//Body JSON
{
  "login": "userlogin",
  "password": "12345"
}
```
```javascript
//Resposta de sucesso - 200
{
  "message": "Logged in successfully!"
}
```

* Realização do login
```http
POST /login
```
```javascript
//Body JSON
{
  "login": "userlogin",
  "password": "12345"
}
```
```javascript
//Resposta de sucesso - 200
{
  "message": "Logged in successfully!"
}
```

* Realização do logout
  * Necessita estar logado
```http
POST /logout
```
```javascript
//Resposta de sucesso - 200
{
  "message": "Logged out successfully!"
}
```

* Dados do usuário logado
  * Necessita estar logado
```http
GET /login
```
```javascript
//Resposta de sucesso - 200
{
  "id": 1,
  "login": "userlogin",
  "name": "username",
  "email": "user@email.com",
  "activated": true
}
```

* Eventos de um usuário
```http
GET /event/<int:userid>
```
```javascript
//Resposta de sucesso - 200
{
  "events": [
    {
      "id": 1,
      "start_datetime": "YYYY-MM-DD hh:mm",
      "end_datetime": "YYYY-MM-DD hh:mm",
      "name": "eventname",
      "description": "eventdescription",
      "user_id": 1,
      "last_modification": "YYYY-MM-DD hh:mm"
    },
    {
      "id": 2,
      "start_datetime": "YYYY-MM-DD hh:mm",
      "end_datetime": "YYYY-MM-DD hh:mm",
      "name": "eventname2",
      "description": "eventdescription2",
      "user_id": 1,
      "last_modification": "YYYY-MM-DD hh:mm"
     }
  ]
}
```

* Evento específico de um usuário
```http
GET /event/<int:userid>/<int:eventid>
```
```javascript
//Resposta de sucesso - 200
{
  "id": 1,
  "start_datetime": "YYYY-MM-DD hh:mm",
  "end_datetime": "YYYY-MM-DD hh:mm",
  "name": "eventname",
  "description": "eventdescription",
  "user_id": 1,
  "last_modification": "YYYY-MM-DD hh:mm"
}
```

* Criação de um evento
  * Necessita estar logado
```http
POST /event/<int:userid>
```
```javascript
//Body JSON
{
  "start_datetime": "YYYY-MM-DD hh:mm",
  "end_datetime": "YYYY-MM-DD hh:mm",
  "name": "eventname",
  "description": "eventdescription"
}
```
```javascript
//Resposta de sucesso - 201
{
  "id": 1,
  "start_datetime": "YYYY-MM-DD hh:mm",
  "end_datetime": "YYYY-MM-DD hh:mm",
  "name": "eventname",
  "description": "eventdescription",
  "user_id": 1,
  "last_modification": "YYYY-MM-DD hh:mm"
}
```

* Edição de um evento
  * Necessita estar logado
```http
PUT /event/<int:userid>/<int:eventid>
```
```javascript
//Body JSON
{
  "start_datetime": "YYYY-MM-DD hh:mm",
  "end_datetime": "YYYY-MM-DD hh:mm",
  "name": "newEventname",
  "description": "newEventdescription"
}
```
```javascript
//Resposta de sucesso - 200
{
  "id": 1,
  "start_datetime": "YYYY-MM-DD hh:mm",
  "end_datetime": "YYYY-MM-DD hh:mm",
  "name": "newEventname",
  "description": "newEventdescription",
  "user_id": 1,
  "last_modification": "YYYY-MM-DD hh:mm"
}
```

* Exclusão de um evento
  * Necessita estar logado
```http
DELETE /event/<int:userid>/<int:eventid>
```
```javascript
//Resposta de sucesso - 200
{
  "message": "Event deleted."
}
```

* Outras respostas (falhas)

| Status Code | Descrição |
| :--- | :--- |
| 400 | `BAD REQUEST (Solicitação Inválida)` |
| 401 | `UNAUTHORIZED (Não Autorizado)`
| 404 | `NOT FOUND (Não Encontrado)` |
| 500 | `INTERNAL SERVER ERROR (Erro Interno do Servidor)` |
