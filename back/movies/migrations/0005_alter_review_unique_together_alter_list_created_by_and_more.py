# Generated by Django 5.1.7 on 2025-04-09 13:08

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('movies', '0004_merge_20250402_2126'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='review',
            unique_together=set(),
        ),
        migrations.AlterField(
            model_name='list',
            name='created_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='lists', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='list',
            name='movies',
            field=models.ManyToManyField(related_name='user_lists', through='movies.MovieInList', to='movies.movie'),
        ),
        migrations.AlterField(
            model_name='movie',
            name='created_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='movies_created', to=settings.AUTH_USER_MODEL),
        ),
    ]
