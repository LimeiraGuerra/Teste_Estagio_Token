from flask_restful import Resource, reqparse
from flask_login import login_required, current_user
from models.event import EventModel
#from models.user import UserModel
import traceback

# Atributos validos a serem recebidos pela requisicao
attributes = reqparse.RequestParser()
attributes.add_argument('start_datetime', type=str, required=True, help="The field 'start_datetime' cannot be left blank.")
attributes.add_argument('end_datetime', type=str, required=True, help="The field 'end_datetime' cannot be left blank.")
attributes.add_argument('name', type=str, required=True, help="The field 'name' cannot be left blank.")
attributes.add_argument('description', type=str, required=True, help="The field 'description' cannot be left blank.")

class Event(Resource):
    def get(self, user_id, event_id=None):
        if event_id:
            # Retorna um evento por id
            event = EventModel.find_event(event_id, user_id)
            if event:
                return event.json()
            return {'message': 'Event not found.'}, 404
        else:
            # Retorna todos os eventos de um usuario
            return {'events': [event.json() for event in EventModel.query.filter_by(user_id=user_id).order_by(EventModel.start_datetime).all()]}
        

    # Adiciona um novo evento
    @login_required
    def post(self, user_id, event_id=None):
        data = attributes.parse_args()

        # Verifica se o evento esta ligado ao usuario logado
        if current_user.id != user_id:
            return {'message': 'The event must be associated to a logged in user.'}, 400

        event = EventModel(user_id, **data)

        # Verifica se o evento esta com as datas validas
        if not event.check_and_parse_dates():
            return {'message': 'The event dates must be valid and in chronological order.'}, 400

        # Verifica se o evento nao esta sobrepondo a data de outro
        if len(event.check_dates_in_interval()) > 0:
            return {'message': 'The event period must not overlap another one already created.'}, 400
        
        try:
            event.save_event()
        except:
            traceback.print_exc()
            return {"message": "Internal Server Error."}, 500 
        return event.json(), 201

    # Edita um evento
    @login_required
    def put(self, user_id, event_id=None):
        data = attributes.parse_args()

        # Verifica se o evento esta ligado ao usuario logado
        if current_user.id != user_id:
            return {'message': 'The event must be associated to a logged in user.'}, 400
        
        old_event = EventModel.find_event(event_id, user_id)
        if old_event:
            # Verifica se as novas datas sao validas
            if not old_event.check_today_date():
                return {'message': 'The event has already expired.'}, 400

            event = EventModel(user_id, **data)
            # Verifica se as novas datas sao validas
            if not event.check_and_parse_dates():
                return {'message': 'The event dates must be valid and in chronological order.'}, 400
            
            # Verifica se o evento nao esta sobrepondo a data de outro, mas pode estar de si mesmo
            event_check = event.check_dates_in_interval()
            for ec in event_check:
                if ec.id != old_event.id:
                    return {'message': 'The event period must not overlap another one already created.'}, 400

            # Salva a edicao
            old_event.update_event(event)
            old_event.save_event()
            return old_event.json(), 200
        return  {'message': 'Event not found.'}, 404

    # Remove um evento
    @login_required
    def delete(self, user_id, event_id=None):
        event = EventModel.find_event(event_id, user_id)
        if event:
            # Verifica se o evento esta ligado ao usuario logado
            if current_user.id != user_id:
                return {'message': 'The event must be associated to a logged in user.'}, 400
            event.delete_event()
            return {'message': 'Event deleted.'}
        return {'message': 'Event not found.'}, 404