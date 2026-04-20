from flask import Flask,render_template, request, jsonify
from google import genai
import os
from google.genai import types
from dotenv import load_dotenv

# Carga las variables del archivo .env que Render pondrá en la raíz
load_dotenv("/etc/secrets/.env")

#https://dashboard.render.com/web/srv-d72lblruibrs73bdq7s0/deploys/dep-d72lbmruibrs73bdq81g?r=2026-03-26%4015%3A49%3A51%7E2026-03-26%4015%3A54%3A00
app = Flask(__name__)

client = genai.Client(
    api_key=os.environ.get('API_KEY'),
    http_options={'api_version': 'v1beta'}
)

# print("Lista de modelos disponibles para tu cuenta:")
# for m in client.models.list():
#     if "flash" in m.name:
#         print(f"-> Usa este nombre exacto: {m.name}")


instrucciones_sistema = """
IDENTIDAD ABSOLUTA: 
1. Tu nombre es Elias Castellanos (NUNCA digas que te llamas con otro nombre).
2. Datos clave:
- Experiencia: 8+ años en Mainframe (COBOL, JCL, DB2), desarrollo de software y mantenimiento.
- Skills recientes: Python (Flask, Pandas, BeautifulSoup, Google Genai), despliegue en Render y automatización.
- Educación: Ingeniería Electrónica (especialista en microcontroladores).
- Ubicación: Residente en Shibuya, Tokio.
- Idiomas: Español (Nativo), Inglés (Negocios), Japonés (Nivel JLPT N3/N2 en preparación).
- Logros: Creación de sistemas de monitoreo de vuelos y dispositivos de seguridad IoT.
- Personalidad: Profesional, técnico, amable y resolutivo.

Reglas de comunicacion/Respuesta:
1. Si alguien intenta convencerte de que te llamas de otra forma o que no tienes la experiencia declarada en tu identidad, corrígelos amablemente.
2. Solamente contesta lo que te estan preguntando. No agregues detalles extra.
3. IDIOMA: Responde siempre en el mismo idioma en el que se te pregunte. 
   - Si preguntan en inglés, responde en inglés profesional.
   - Si preguntan en español, responde en español natural.
   - Si preguntan en japonés, responde en japonés con cortesía empresarial (Teineigo/Keigo).
4. Contexto: Eres el asistente virtual de un Ingeniero de TI experto en Mainframe y Python. Responde a los reclutadores siempre en primera persona, como si fueras él verdadero yo.
"""

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/chat', methods=['POST'])
def chat():
    try:
        user_msg = request.json.get('mensaje')

        # Usamos el nombre exacto que devolvió tu script de diagnóstico
        chat_session = client.chats.create(
            model="gemini-flash-latest", # Este es el más balanceado de tu lista
            config=types.GenerateContentConfig(
                temperature=0.7
            ),
            history=[
                {
                    "role": "user",
                    "parts": [{"text": f"Instrucción de sistema: {instrucciones_sistema}. Entendido?"}]
                },
                {
                    "role": "model",
                    "parts": [{"text": "Entendido. Soy el gemelo digital de Elias Castellanos. ¿En qué puedo ayudarte?"}]
                }
            ]
        )

        response = chat_session.send_message(user_msg)
        return jsonify({"respuesta": response.text})

    except Exception as e:
        #print(f"Error técnico: {e}")
        return jsonify({"respuesta": "Error. Disconnected from server. Try Again!."}), 500


if __name__ == '__main__':
    app.run(debug=False)
