# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-05-22 21:26
from __future__ import unicode_literals

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Page',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('js_link', models.TextField()),
                ('date', models.DateTimeField(default=datetime.datetime(2016, 5, 22, 21, 26, 20, 96142, tzinfo=utc))),
                ('created', models.DateTimeField(default=datetime.datetime(2016, 5, 22, 21, 26, 20, 96279, tzinfo=utc))),
            ],
        ),
    ]
