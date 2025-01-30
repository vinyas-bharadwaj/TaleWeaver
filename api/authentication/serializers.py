from rest_framework.serializers import ModelSerializer
from django.contrib.auth.models import User

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {
            'password': {'write_only': True},  # Ensure the password is write-only
        }
    
    def create(self, validated_data):
    # Use `create_user` to ensure the password is hashed
        return User.objects.create_user(**validated_data)