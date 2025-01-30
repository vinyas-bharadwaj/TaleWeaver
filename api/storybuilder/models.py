from django.db import models

class Story(models.Model):
    title = models.CharField(max_length=255)
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='author')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class StoryBlock(models.Model):
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name='blocks')
    content = models.TextField()  # LLM's generated text
    choices = models.JSONField()  # Store choices for the next block as JSON
    user_choice = models.CharField(max_length=255, blank=True, null=True)  # User's selection
    created_at = models.DateTimeField(auto_now_add=True)
