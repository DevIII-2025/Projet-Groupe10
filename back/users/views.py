from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            response = Response()
            response.set_cookie(
                key="access_token",
                value=str(refresh.access_token),
                httponly=True,
                secure=False,  # met à True en prod avec HTTPS
                samesite='Lax'
            )
            response.data = {"message": "Login successful"}
            return response
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self, request):
        response = Response()
        response.delete_cookie("access_token")
        response.data = {"message": "Logged out"}
        return response

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"username": request.user.username})
