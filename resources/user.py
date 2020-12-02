from flask_restful import Resource, reqparse
from flask import make_response, render_template, request
from flask_login import login_user, logout_user, login_required, current_user
from models.user import UserModel
import traceback

# Atributos validos a serem recebidos pela requisicao
attributes = reqparse.RequestParser()
attributes.add_argument('login', type=str, required=True, help="The field 'login' cannot be left blank.")
attributes.add_argument('password', type=str, required=True, help="The field 'password' cannot be left blank.")
attributes.add_argument('name', type=str)
attributes.add_argument('email', type=str)
attributes.add_argument('activated', type=bool)

# Cadastro do usuario
class UserRegister(Resource):
    def post(self):
        data = attributes.parse_args()
        
        # Checa se o email foi informado
        if not data.get('email') or data.get('email') is None:
            return {"message": "The field 'email' cannot be left blank."}, 400

        # Checa se o nome foi informado
        if not data.get('name') or data.get('name') is None:
            return {"message": "The field 'name' cannot be left blank."}, 400
        
        # Verifica se o email ja existe
        if UserModel.find_by_email(data['email']):
            return {"message": "The email '{}' already exists.".format(data['email'])}, 400

        # Verifica se o login ja existe
        if UserModel.find_by_login(data['login']):
            return {"message": "The login '{}' already exists.".format(data['login'])}, 400

        user = UserModel(**data)
        user.activated = False
        try:
            user.save_user()
            r = user.send_confirmation_email()
            verification_url = None
            if r.status_code != 200:
                verification_url = user.confirmation_url()           
        except:
            user.delete_user()
            traceback.print_exc()
            return {'message': 'An internal server error has ocurred.'}, 500
        return {'message': 'User created successfully!',
                'verification_url': verification_url}, 201

# Login do usuario
class UserLogin(Resource):
    def post(self):
        data = attributes.parse_args()

        # Busca o usuario pelo login informado
        user = UserModel.find_by_login(data['login'])

        # Verifica se o usuario existe e checa a senha informada
        if user and user.check_password(data['password']):
            # Verifica se o usuario e uma conta ativada
            if user.activated:
                login_user(user, remember=True);
                return {'message': 'Logged in successfully!'}, 200
            return {'message': 'User not confirmed.'}, 400
        return {'message': 'The username or password is incorrect.'}, 401

    @login_required
    def get(self):
        return current_user.json()

# Logout do usuario
class UserLogout(Resource):
    @login_required
    def post(self):
        logout_user()
        return {'message': 'Logged out successfully!'}, 200

# Confirmacao de cadastro do usuario
class UserConfirm(Resource):
    @classmethod
    def get(cls, user_id):
        user = UserModel.find_user(user_id)

        # verifica se a confirmacao de email é pra um usuario existente
        if not user:
            return {"message": "User id '{}' not found.".format(user_id)}, 404

        # Ativa o usuario e envia uma pagina de resposta
        user.activated = True
        user.save_user()
        headers = {'Content-Type': 'text/html'}
        return make_response(
            render_template('user_confirm.html', email=user.email, user=user.name, link=request.url_root + "entrar"),
                200, headers)