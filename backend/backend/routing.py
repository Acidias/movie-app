from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from myapp import consumers

websocket_urlpatterns = [
    path('ws/sentiment/', consumers.SentimentConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "websocket": URLRouter(websocket_urlpatterns),
})
