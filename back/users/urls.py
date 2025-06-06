from django.urls import path
from .views import LoginView, LogoutView, MeView, RegisterView, CustomTokenRefreshView, UpdateProfileView, resend_verification, VerifyEmailView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("register/", RegisterView.as_view(), name="register"),
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("update-profile/", UpdateProfileView.as_view(), name="update_profile"),
    path('resend-verification/', resend_verification),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
]
