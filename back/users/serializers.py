# users/serializers.py

from django.contrib.auth.models import User
from rest_framework import serializers
import requests
import os

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")

        api_key = os.getenv('MAILBOXLAYER_API_KEY')
        if not api_key:
            raise serializers.ValidationError("Clé API MailboxLayer manquante.")

        url = f"http://apilayer.net/api/check?access_key={api_key}&email={value}&smtp=1&format=1"
        try:
            response = requests.get(url, timeout=10)
            result = response.json()
            if not result.get("smtp_check", False):
                raise serializers.ValidationError("Cette adresse email ne semble pas valide ou existante.")
        except requests.RequestException:
            raise serializers.ValidationError("Erreur lors de la vérification de l'adresse email.")

        return value

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
