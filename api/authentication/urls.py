from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.CreateUserView.as_view(), name='create-user'),
    path('profile/', views.UserProfileView.as_view(), name='create-user-profile'),
]
