from __future__ import unicode_literals

from django.utils import timezone

from django.db import models

# Create your models here.

class Page(models.Model):
    js_link = models.CharField(max_length=200)
    date = models.DateTimeField(default=timezone.now)
    created = models.DateTimeField(default=timezone.now)
