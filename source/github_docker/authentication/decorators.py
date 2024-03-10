from django.http import JsonResponse
from functools import wraps


def token_required(f):
    @wraps(f)
    def decorated(request, *args, **kwargs):
        token = request.META.get('HTTP_AUTHORIZATION')
        if not token:
            return JsonResponse({'message': 'Token is missing!'}, status=401)

        try:
            # Проверка токена
            # Здесь должна быть ваша логика проверки токена
            # Например, расшифровка JWT или проверка в базе данных
            # Если токен невалидный, вызовите исключение
            print('token_1')

        except Exception as err:
            print(err)
            return JsonResponse({'message': 'Token is invalid!'}, status=401)

        return f(request, *args, **kwargs)
    return decorated
