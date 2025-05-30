from .models import PendingUser
from .utils import generate_verification_code, send_verification_email
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from django.contrib.auth import get_user_model
import re

User = get_user_model()

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        # Vérifier si un User existe déjà avec cet email
        if User.objects.filter(email=validated_data["email"]).exists():
            raise serializers.ValidationError({
                "email": ["Un compte avec cet email existe déjà."]
            })
        # Vérifier si un User existe déjà avec ce username
        if User.objects.filter(username=validated_data["username"]).exists():
            raise serializers.ValidationError({
                "username": ["Ce nom d'utilisateur est déjà pris."]
            })
        # Vérifier si un PendingUser existe déjà avec cet email
        if PendingUser.objects.filter(email=validated_data["email"]).exists():
            raise serializers.ValidationError({
                "email": ["Un compte avec cet email est déjà en attente de validation."]
            })
        # Vérifier si un PendingUser existe déjà avec ce username
        if PendingUser.objects.filter(username=validated_data["username"]).exists():
            raise serializers.ValidationError({
                "username": ["Ce nom d'utilisateur est déjà en attente de validation."]
            })
        # Validation de la complexité du mot de passe
        password = validated_data["password"]
        if len(password) < 8 or not re.search(r"[A-Za-z]", password) or not re.search(r"\d", password):
            raise serializers.ValidationError({
                "password": ["Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre."]
            })
        code = generate_verification_code()
        hashed_password = make_password(password)
        
        pending_user = PendingUser.objects.create(
            email=validated_data["email"],
            username=validated_data["username"],
            password=hashed_password,
            verification_code=code,
        )
        send_verification_email(pending_user.email, code)
        return pending_user
