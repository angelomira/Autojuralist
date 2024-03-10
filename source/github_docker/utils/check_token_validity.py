import json

import jwt
from django.http import JsonResponse
from django.test import RequestFactory
from django.views.decorators.csrf import csrf_exempt
from rest_framework.request import Request
from rest_framework_simplejwt.authentication import JWTAuthentication

from config.config_reader import settings
from utils.enc_dec_data_fun import decrypt_data
from loguru import logger


@csrf_exempt
def check_token(request):
    JWT_authenticator = JWTAuthentication()
    factory = RequestFactory()

    if request.method == 'POST':
        try:
            # Получаем зашифрованные данные из тела запроса
            data = json.loads(request.body.decode('utf-8'))
            encrypted_data = data.get('encrypted_data')
            if not encrypted_data:
                return JsonResponse({'error': 'No encrypted data'}, status=400)

            encrypted_data_bytes = encrypted_data.encode()

            decrypted_jwt_refresh_token = decrypt_data(encrypted_data_bytes, settings.TOKEN_SECRET_KEY.get_secret_value())

            request = factory.get('/api/auth', HTTP_AUTHORIZATION=f'Bearer {decrypted_jwt_refresh_token}')

            drf_request = Request(request)

            response = JWT_authenticator.authenticate(drf_request)

            if response is not None:
                user, token = response
                return JsonResponse({'message': 'Login Success!', 'decoded_payload': token.payload}, status=200)
            else:
                return JsonResponse({'message': 'Token is no token is provided in the header or the header is missing!'}, status=404)

        except jwt.InvalidTokenError:
            # Обработка ошибки, если токен невалиден
            return JsonResponse({'error': 'Token is not valid!'}, status=401)
        except json.JSONDecodeError:
            # Обработка ошибки, если в теле запроса не JSON
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as err:
            # Обработка других ошибок
            logger.warning(err)
            return JsonResponse({'error': f'Server error: {str(err)}'}, status=500)

    else:
        return JsonResponse({'error': 'Method not supported'}, status=405)
