from django.shortcuts import render
from pages.models import *

def index(request):
    context = {
        'pages': Page.objects.all()
    }
    return render(request, 'pages/index.html', context)

def page(request, pk):
    page = Page.objects.get(pk=pk)
    context = {
        'page': page
    }
    return render(request, 'pages/page.html', context)
