from django.db import migrations
from django.contrib.auth import get_user_model
import os

def create_superuser(apps, schema_editor):
    User = get_user_model()
    
    # Get admin credentials from environment variables
    DJANGO_SUPERUSER_USERNAME = os.environ.get('DJANGO_SUPERUSER_USERNAME')
    DJANGO_SUPERUSER_EMAIL = os.environ.get('DJANGO_SUPERUSER_EMAIL')
    DJANGO_SUPERUSER_PASSWORD = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

    # Check if the user already exists
    if not User.objects.filter(username=DJANGO_SUPERUSER_USERNAME).exists():
        print(f'Creating superuser: {DJANGO_SUPERUSER_USERNAME}')
        User.objects.create_superuser(
            username=DJANGO_SUPERUSER_USERNAME,
            email=DJANGO_SUPERUSER_EMAIL,
            password=DJANGO_SUPERUSER_PASSWORD
        )
    else:
        print(f'Superuser {DJANGO_SUPERUSER_USERNAME} already exists.')


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_alter_storeprofile_is_approved'),  # IMPORTANT: Change this to your PREVIOUS migration file
    ]

    operations = [
        migrations.RunPython(create_superuser),
    ]