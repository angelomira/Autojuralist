from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
import jwt
from config.config_reader import settings
from .serializers import UserRegistrationSerializer, UserAuthSerializer
from utils.check_token_validity import check_token
from utils.enc_dec_data_fun import encrypt_data
from loguru import logger


class UserRegistrationView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            access = AccessToken.for_user(user)

            encoded_refresh = encrypt_data(str(refresh), settings.TOKEN_SECRET_KEY.get_secret_value())
            encoded_access = encrypt_data(str(access), settings.TOKEN_SECRET_KEY.get_secret_value())

            logger.debug(f'encoded_refresh: {str(encoded_refresh)},\n'
                         f'encoded_access: {str(encoded_access)}')

            return Response({'status': 'Succes registration.',
                             'user_id': refresh.payload.get('user_id'),
                             'epired_in': refresh.payload.get('exp')},
                            status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserCheckTokenView(APIView):
    def post(self, request):
        result = check_token(request)
        if result.status_code == 200:
            return result
        else:
            return Response({'status': 'Login failed. Try to auth with login and passwoed.'}, status=500)


class UserAuthenticationView(APIView):
    def post(self, request):
        serializer = UserAuthSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        refresh = RefreshToken.for_user(user)
        access = AccessToken.for_user(user)

        encoded_refresh = encrypt_data(str(refresh), settings.TOKEN_SECRET_KEY.get_secret_value())
        encoded_access = encrypt_data(str(access), settings.TOKEN_SECRET_KEY.get_secret_value())

        logger.debug(f'encoded_refresh: {str(encoded_refresh)},\n'
                     f'encoded_access: {str(encoded_access)}')

        return Response({'status': 'Succes authentication.',
                         'user_id': refresh.payload.get('user_id'),
                         'epired_in': refresh.payload.get('exp')},
                        status=status.HTTP_200_OK)

