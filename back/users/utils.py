import os
import requests
import random

def generate_verification_code():
    return str(random.randint(100000, 999999))

def send_verification_email(email, code):
    MAILERSEND_API_KEY = os.environ.get("MAILERSEND_API_KEY")
    if not MAILERSEND_API_KEY:
        raise Exception("MAILERSEND_API_KEY not set")

    data = {
                "from": {
            "email": "no-reply@critiq.ovh", 
            "name": "Critiq"
        },
        "to": [{"email": email}],
        "subject": "Code de vérification",
        "text": f"Votre code de vérification est : {code}"
    }

    print(f"[DEBUG] Envoi à {email} avec code {code}")

    response = requests.post(
        "https://api.mailersend.com/v1/email",
        json=data,
        headers={"Authorization": f"Bearer {MAILERSEND_API_KEY}"}
    )

    if response.status_code >= 400:
        raise Exception(f"Erreur d'envoi Mailersend: {response.text}")
    

