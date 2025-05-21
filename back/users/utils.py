import os
import requests
import random

import random
from django.core.mail import send_mail

def generate_verification_code():
    return str(random.randint(100000, 999999))

def send_verification_email(email, code):
    subject = "Code de vérification"
    message = f"Bonjour,\n\nVoici votre code de vérification : {code}\n\nL'équipe Critiq"
    
    print(f"[DEBUG] Envoi SMTP à {email} avec code {code}")
    
    send_mail(
        subject,
        message,
        None,  # Utilise DEFAULT_FROM_EMAIL
        [email],
        fail_silently=False
    )