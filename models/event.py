from sql_alchemy import database as db
from datetime import datetime as dt

class EventModel(db.Model):
    # Nome da tabela no banco
    __tablename__ = 'event'

    # Atributos da tabela no banco
    id = db.Column(db.Integer, primary_key=True)
    start_datetime = db.Column(db.DateTime)
    end_datetime = db.Column(db.DateTime)
    name = db.Column(db.String(80))
    description = db.Column(db.String())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    last_modification = db.Column(db.DateTime)
    #user = db.relationship('UserModel')

    # Construtor
    def __init__(self, user_id, start_datetime, end_datetime, name, description):
        self.start_datetime = start_datetime
        self.end_datetime = end_datetime
        self.name = name
        self.description = description
        self.user_id = user_id

    # Retorno do modelo em json
    def json(self):
        return {
            'id': self.id,
            'start_datetime': self.start_datetime.strftime('%Y-%m-%d %H:%M'),
            'end_datetime': self.end_datetime.strftime('%Y-%m-%d %H:%M'),
            'name': self.name,
            'description': self.description,
            'user_id': self.user_id,
            'last_modification': self.last_modification.strftime('%Y-%m-%d %H:%M')
        }

    # Encontra e retorna um evento no banco a partir do id
    @classmethod
    def find_event(cls, id, user_id):
        event = cls.query.filter_by(id=id, user_id=user_id).first()
        if event:
            return event
        return None

    # Checa se as datas sao validas estao em ordem cronologica e adiciona no objeto
    def check_and_parse_dates(self):
        try:
            self.start_datetime = dt.strptime(self.start_datetime, '%Y-%m-%d %H:%M')
            self.end_datetime = dt.strptime(self.end_datetime, '%Y-%m-%d %H:%M')
            return self.start_datetime < self.end_datetime and self.check_today_date()
        except:
            return False
    
    # Compara a primeira data com o dia atual
    def check_today_date(self):
        return self.start_datetime > dt.now()

    # Checa se o intervalo passado esta sobreposto a outro evento
    def check_dates_in_interval(self):
        result = db.session.execute("SELECT * FROM event WHERE user_id = :user_id\
            AND datetime(:end) >= datetime(start_datetime)\
            AND datetime(:start) <= datetime(end_datetime);", 
            {'user_id': self.user_id, 'end': self.end_datetime, 'start': self.start_datetime})
        return result.fetchall()

    # Salva novo evento no banco
    def save_event(self):
        self.last_modification = dt.now()
        db.session.add(self)
        db.session.commit()

    # Atualiza o evento no banco
    def update_event(self, new_event):
        self.last_modification = dt.now()
        self.start_datetime =  new_event.start_datetime
        self.end_datetime =  new_event.end_datetime
        self.name =  new_event.name
        self.description =  new_event.description
        self.user_id =  new_event.user_id

    # Deleta o evento no banco
    def delete_event(self):
        db.session.delete(self)
        db.session.commit()