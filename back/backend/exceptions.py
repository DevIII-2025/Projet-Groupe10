from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        # Erreur non gérée par DRF (ex: 500)
        return Response(
            {"detail": "Erreur interne du serveur. Veuillez réessayer plus tard."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    return response 