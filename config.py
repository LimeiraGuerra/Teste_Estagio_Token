import json

# Abre o arquivo 'credentials.json' que contem as credenciais da api do mailgun
# Caso esse arquivo nao existir, as constantes serao nulas
# O arquivo json deve estar no seguinte formato:
# {
#     "MAILGUN_DOMAIN": {dominio da api},
#     "MAILGUN_API_KEY": {chave da api},
#     "FROM_TITLE": {titulo customizado},
#     "FROM_EMAIL": {endereco de email customizado}
# }
try:
    with open('credentials.json') as json_file:
        config = json.load(json_file)
except:
    config = {}

# Constantes do projeto
MAILGUN_DOMAIN = config.get("MAILGUN_DOMAIN")
MAILGUN_API_KEY = config.get("MAILGUN_API_KEY")
FROM_TITLE = config.get("FROM_TITLE")
FROM_EMAIL = config.get("FROM_EMAIL")

PORT = "5000"
HOST = "localhost"