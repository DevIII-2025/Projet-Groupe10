from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import EmailVerification
from .utils import send_verification_email
from .views import generate_code

User = get_user_model()

@receiver(post_save, sender=User)
def create_verification(sender, instance, created, **kwargs):
    if created:
        code = generate_code()
        EmailVerification.objects.create(user=instance, code=code)
        send_verification_email(instance.email, code)
        instance.is_active = False  # empêcher la connexion avant vérification
        instance.save()
