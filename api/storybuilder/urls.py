from django.urls import path
from . import views


urlpatterns = [
    path('', views.home),
    path('create-story/', views.CreateStoryView.as_view()),
    path('generate-story/', views.StoryBlockView.as_view()),
    path('regenerate-options/<str:story_id>', views.RegenerateOptionsView.as_view(), name='regenerate-options'),
    path('generate-pdf/<str:story_id>/', views.GeneratePDFView.as_view()),
    path('conclude-story/', views.ConcludeStoryView.as_view()),
    path('list-pdf/<str:user_id>/', views.UserPDFListView.as_view()),
]