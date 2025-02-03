# Generated by Django 5.1.5 on 2025-02-03 09:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('storybuilder', '0004_storypdf_delete_storymodel'),
    ]

    operations = [
        migrations.AddField(
            model_name='story',
            name='pdf',
            field=models.FileField(blank=True, null=True, upload_to='story_pdfs/'),
        ),
        migrations.DeleteModel(
            name='StoryPDF',
        ),
    ]
