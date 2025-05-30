from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth import get_user_model
from .models import PendingUser
from django.contrib.auth.hashers import check_password
from django.contrib.auth.models import User as DefaultUser
from .serializers import RegisterSerializer
from .models import EmailVerification
from .utils import send_verification_email
from rest_framework.decorators import api_view
from rest_framework.views import APIView
import logging
import random

logger = logging.getLogger(__name__)
User = get_user_model()


def generate_code():
    return ''.join(random.choices('0123456789', k=6))


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

        try:
            user = User.objects.get(email=username_or_email)
            username = user.username
        except User.DoesNotExist:
            username = username_or_email

        user = authenticate(username=username, password=password)

        if user:
            if not user.is_active:
                return Response(
                    {"detail": "Veuillez vérifier votre adresse email avant de vous connecter."},
                    status=status.HTTP_403_FORBIDDEN
                )

            logger.info(f"Connexion réussie pour l'utilisateur: {user.username}")
            refresh = RefreshToken.for_user(user)

            response_data = {
                "message": "Login successful",
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                    "is_superuser": user.is_superuser
                }
            }

            response = Response(response_data)
            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                httponly=True,
                secure=False,
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
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                logger.info(f"Token blacklisté pour l'utilisateur: {request.user.username}")

            response = Response({"message": "Déconnexion réussie"})
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
        return Response({
            "username": request.user.username,
            "is_staff": request.user.is_staff
        })

class VerifyEmailView(APIView):
    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        try:
            pending = PendingUser.objects.get(email=email)
        except PendingUser.DoesNotExist:
            return Response({"error": "Email not found"}, status=404)

        if pending.verification_code != code:
            return Response({"error": "Invalid code"}, status=400)

        user = User.objects.create(
            username=pending.username,
            email=pending.email,
            password=pending.password,  # already hashed
        )

        pending.delete()
        return Response({"message": "Account verified and created successfully!"}, status=201)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "Inscription réussie. Vérifiez votre email.",
                "email": user.email
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class UpdateProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        user = request.user
        username = request.data.get('username')
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if username and username != user.username:
            if User.objects.filter(username=username).exclude(id=user.id).exists():
                return Response(
                    {"detail": "Ce nom d'utilisateur est déjà pris"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.username = username

        if new_password:
            if not current_password:
                return Response(
                    {"detail": "Le mot de passe actuel est requis"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not check_password(current_password, user.password):
                return Response(
                    {"detail": "Mot de passe actuel incorrect"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(new_password)

        user.save()
        return Response({
            "username": user.username,
            "message": "Profil mis à jour avec succès"
        })





@api_view(['POST'])
def resend_verification(request):
    email = request.data.get('email')
    if not email:
        return Response({'message': 'Email requis'}, status=400)

    try:
        user = User.objects.get(email=email)
        if user.email_verification:
            user.email_verification.delete()
    except User.DoesNotExist:
        return Response({'message': 'Utilisateur non trouvé'}, status=404)
    except EmailVerification.DoesNotExist:
        pass

    code = generate_code()
    EmailVerification.objects.create(user=user, code=code)
    send_verification_email(user.email, code)

    return Response({'message': 'Code renvoyé'})
