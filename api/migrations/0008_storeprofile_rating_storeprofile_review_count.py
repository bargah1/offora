# Generated by Django 4.2.23 on 2025-07-19 17:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_storeprofile_logo_storeprofile_slug'),
    ]

    operations = [
        migrations.AddField(
            model_name='storeprofile',
            name='rating',
            field=models.FloatField(default=0.0),
        ),
        migrations.AddField(
            model_name='storeprofile',
            name='review_count',
            field=models.IntegerField(default=0),
        ),
    ]
