# Generated by Django 4.2.23 on 2025-07-09 07:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_storeprofile_latitude_storeprofile_longitude_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='storeprofile',
            name='phone_number',
            field=models.CharField(blank=True, max_length=15),
        ),
    ]
