# Generated by Django 4.2.23 on 2025-07-24 10:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_favoriteshop'),
    ]

    operations = [
        migrations.AlterField(
            model_name='storeprofile',
            name='is_approved',
            field=models.BooleanField(default=True),
        ),
    ]
