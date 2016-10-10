from django.conf.urls import url

from . import views



urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'page/(?P<pk>[0-9]+)/$', views.page, name='page')
]
