from .models import PendingUser
from .utils import generate_verification_code, send_verification_email
from django.contrib.auth.hashers import make_password
from rest_framework import serializers

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        code = generate_verification_code()
        hashed_password = make_password(validated_data["password"])
        
        pending_user = PendingUser.objects.create(
            email=validated_data["email"],
            username=validated_data["username"],
            password=hashed_password,
            verification_code=code,
        )
        send_verification_email(pending_user.email, code)
        return pending_user
