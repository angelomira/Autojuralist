import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken


@csrf_exempt
def refresh_token(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            refresh_token = data.get('refresh')
            if not refresh_token:
                return JsonResponse({'error': 'No refresh token provided'}, status=400)

            # Проверяем refresh token и генерируем новый access token
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)

            return JsonResponse({'access': new_access_token})
        except TokenError as e:
            return JsonResponse({'error': str(e)}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)
    else:
        return JsonResponse({'error': 'Method not supported'}, status=405)
