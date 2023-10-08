"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from myapp.views import (
    DownloadSubtitle,
    GetMovieDetails,
    SearchMovies,
    search_by_text_direct,
    chat_gpt,
)  # Notice search_by_text instead of SearchByText

urlpatterns = [
    path("api/movie/<int:movie_id>/", GetMovieDetails.as_view(), name="movie_details"),
    path("api/search/<str:title>/", SearchMovies.as_view(), name="search_movies"),
    path("analyse_subtitle/", DownloadSubtitle.as_view(), name="analyse_subtitle"),
    path("api/openai_movie_titles/", search_by_text_direct, name="openai_movie_titles"),
    path("api/chat_gpt/", chat_gpt, name="chat_gpt"),
]
