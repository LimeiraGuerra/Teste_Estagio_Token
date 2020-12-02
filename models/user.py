from sql_alchemy import database as db
from sqlalchemy.ext.orderinglist import ordering_list
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from flask import request, url_for
from requests import post

# Constantes para a api de envio de emails
MAILGUN_DOMAIN = 'sandboxc94d5ef7fcf1472baeffac9e6999426e.mailgun.org'
MAILGUN_API_KEY = '05920451eb1dcacca771e9855a684f0a-95f6ca46-4710ed1d'
FROM_TITLE = '(NO-REPLY) Meus Eventos - Confirme seu cadastro'
FROM_EMAIL = 'no-reply@meuseventos.com'

class UserModel(UserMixin, db.Model):
    # Nome da tabela no banco
    __tablename__ = 'user'

    # Atributos da tabela no banco
    id = db.Column(db.Integer, primary_key=True)
    login = db.Column(db.String(40), nullable=False, unique=True)
    password = db.Column(db.String(40), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(80), nullable=False, unique=True)
    activated = db.Column(db.Boolean, default=False)
    events = db.relationship('EventModel', order_by="EventModel.start_datetime",
                            collection_class=ordering_list('start_datetime'))

    # Construtor
    def __init__(self, login, password, name, email, activated):
        self.login = login
        self.password = self.set_password(password)
        self.name = name
        self.email = email
        self.activated = activated

    # Funcao que faz uma requisicao para a api de envio de emais para a confirmacao do cadastro
    def send_confirmation_email(self):
        html = open("./templates/email_template.html", "r", encoding='utf-8')
        link = request.url_root[:-1] + url_for('userconfirm', user_id=self.id)
        return post('https://api.mailgun.net/v3/{}/messages'.format(MAILGUN_DOMAIN),
                    auth=('api', MAILGUN_API_KEY),
                    data={'from': '{} <{}>'.format(FROM_TITLE, FROM_EMAIL),
                          'to': self.email,
                          'subject': 'Confirmação de Cadastro',
                          'text': 'Confirme seu cadastro clicando no link a seguir: {}'.format(link),
                          'html': html.read().replace("{%name}", self.name).replace("{%link}", link)
                          }
                   )

    # Retorno do modelo em json
    def json(self):
        return {
            'id': self.id,
            'login': self.login,
            'name': self.name,
            'email': self.email,
            'activated': self.activated,
            }

    # Busca e retorna um usuario no banco a partir do id
    @classmethod
    def find_user(cls, id):
        user = cls.query.filter_by(id=id).first()
        if user:
            return user
        return None

    # Busca e retorna um usuario no banco a partir do email
    @classmethod
    def find_by_email(cls, email):
        user = cls.query.filter_by(email=email).first()
        if user:
            return user
        return None

    # Busca e retorna um usuario no banco a partir do login
    @classmethod
    def find_by_login(cls, login):
        user = cls.query.filter_by(login=login).first()
        if user:
            return user
        return None

    # Salva novo usuario no banco
    def save_user(self):
        db.session.add(self)
        db.session.commit()

    # Deleta o usuario do banco
    def delete_user(self):
        # Deleta todos os eventos associados ao usuario
        [event.delete_event() for event in self.events]
        db.session.delete(self)
        db.session.commit()

    # Criptografa a senha do usuario
    def set_password(self, password, method='sha256'):
        return generate_password_hash(password, method='sha256')

    # Checa a senha passada com a do usuario, estando ela criptografada
    def check_password(self, password):
        return check_password_hash(self.password, password)