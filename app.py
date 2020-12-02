from flask import Flask, render_template, redirect
from flask_restful import Api
from werkzeug.exceptions import HTTPException
from flask_login import LoginManager, current_user, login_required
from resources.user import UserRegister, UserLogin, UserLogout, UserConfirm
from resources.event import Event
from models.user import UserModel
import secrets
from config import HOST, PORT

# Configuracoes necessarias para o Flask e o Banco de Dados
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = secrets.token_urlsafe(32)
api = Api(app)
login = LoginManager(app)

# Carrega o usuario logado
@login.user_loader
def load_user(user_id):
    return UserModel.find_user(user_id)

# Cria o banco caso nao exista na primeira requisicao
@app.before_first_request
def create_database():
    db.create_all()

# Adicao dos recursos da api de usuarios
api.add_resource(UserRegister, '/signup')
api.add_resource(UserLogin, '/login')
api.add_resource(UserLogout, '/logout')
api.add_resource(UserConfirm, '/verify/<int:user_id>')

# Adicao dos recursos da api de eventos
api.add_resource(Event, '/event/<int:user_id>', '/event/<int:user_id>/<int:event_id>')

# Trata o erro 404 (pagina nao encontrada)
@app.errorhandler(HTTPException)
def page_not_found(e):
    return render_template('error404.html'), 404

# Trata o erro 401 (nao autorizado)
@app.errorhandler(401)
def unauthorized(e):
    return redirect('/entrar')

# Redireciona para a pagina principal
@app.route('/')
def blanc():
    return redirect('eventos')

# Retorna a pagina de login ou a pagina inicial, caso ja esteja logado
@app.route('/entrar', methods=['GET']) 
def login_page():
    if current_user.is_authenticated:
        return redirect('/eventos')
    return render_template("login.html")

# Retorna a pagina de cadastro ou a pagina inicial, caso ja esteja logado
@app.route('/cadastrar', methods=['GET'])
def signup_page():
    if current_user.is_authenticated:
        return redirect('/eventos')
    return render_template("signup.html")

# Retorna a pagina de eventos do usuario se ele estiver logado
@app.route('/eventos', methods=['GET'])
@login_required
def events_page():
    return render_template("events.html", user=current_user)

# Inicia a aplicacao
if __name__ == '__main__':
    from sql_alchemy import database as db
    db.init_app(app)
    app.run(host=HOST, port=PORT, debug=True, use_reloader=True)
    