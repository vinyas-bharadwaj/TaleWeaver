from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from drf_spectacular.utils import extend_schema
from .serializers import UserSerializer


# API endpoint for creating a new user
class CreateUserView(APIView):
    @extend_schema(
        summary="Create a new user",
        description="Endpoint to create a new user with username, email, and password.",
        request=UserSerializer,
        responses={
            201: 'User created successfully!',
            400: 'Validation error',
        },
    )
    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Save the user if data is valid
            return Response({'message': 'User created successfully!'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
