from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from .serializers import UserSerializer
import logging

logger = logging.getLogger(__name__)

class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                logger.info("Token rafraîchi avec succès")
            return response
        except Exception as e:
            logger.error(f"Erreur lors du rafraîchissement du token: {str(e)}")
            return Response(
                {"detail": "Token invalide ou expiré"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username_or_email = request.data.get("username")
        password = request.data.get("password")

        logger.info(f"Tentative de connexion pour: {username_or_email}")

        # Vérifier si c'est un email
        try:
            user = User.objects.get(email=username_or_email)
            username = user.username
        except User.DoesNotExist:
            username = username_or_email

        user = authenticate(username=username, password=password)
        
        if user:
            logger.info(f"Connexion réussie pour l'utilisateur: {user.username}")
            refresh = RefreshToken.for_user(user)
            
            # Créer la réponse avec le token
            response_data = {
                "message": "Login successful",
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            }

            response = Response(response_data)
            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                httponly=True,
                secure=False,  # met à True en prod avec HTTPS
                samesite='Lax'
            )
            return response
        
        logger.warning(f"Échec de la connexion pour: {username_or_email}")
        return Response(
            {"detail": "Invalid credentials"}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # Récupérer le refresh token depuis le cookie
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                # Blacklister le refresh token
                token = RefreshToken(refresh_token)
                token.blacklist()
                logger.info(f"Token blacklisté pour l'utilisateur: {request.user.username}")

            response = Response({"message": "Déconnexion réussie"})
            # Supprimer les cookies
            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token")
            return response
        except Exception as e:
            logger.error(f"Erreur lors de la déconnexion: {str(e)}")
            return Response(
                {"detail": "Erreur lors de la déconnexion"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"username": request.user.username})

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            response = Response()
            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                httponly=True,
                secure=False,  # met à True en prod avec HTTPS
                samesite='Lax'
            )
            response.data = {
                "message": "Inscription réussie",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            }
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
