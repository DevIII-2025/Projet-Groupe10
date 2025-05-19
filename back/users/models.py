from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='email_verification')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Verification for {self.user.email}"

class PendingUser(models.Model):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=128)  
    verification_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)