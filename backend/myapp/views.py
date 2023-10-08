from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json
import requests
from django.shortcuts import redirect
from textblob import TextBlob
import matplotlib.pyplot as plt
from django.http import HttpResponse
import re
import os
import openai
import matplotlib.pyplot as plt
from collections import defaultdict
from decouple import config

API_KEY = config("API_KEY")
USERNAME = config("USERNAME")
PASSWORD = config("PASSWORD")
THEMOVIEDB_KEY = config("THEMOVIEDB_KEY")
OPENAI_API_KEY = config("OPENAI_API_KEY")

LOGIN_URL = "https://api.opensubtitles.com/api/v1/login"
DOWNLOAD_URL = "https://api.opensubtitles.com/api/v1/download"
SEARCH_URL = "https://api.opensubtitles.com/api/v1/subtitles"
TMDB_SEARCH_URL = "https://api.themoviedb.org/3/search/movie"
OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"


print("OpenAI API Key:", OPENAI_API_KEY)


@csrf_exempt
def chat_gpt(request):
    if request.method == "POST":
        data = json.loads(request.body)

        # Define available functions
        functions = [
            {
                "name": "search_by_text",
                "description": "Search for a movie by text",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "searchValue": {
                            "type": "string",
                            "description": "The text to search by",
                        }
                    },
                    "required": ["searchValue"],
                },
            },
            {
                "name": "SearchMovies",
                "description": "Search for a movie by title",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "The title of the movie",
                        }
                    },
                    "required": ["title"],
                },
            },
            {
                "name": "MovieRecommendation",
                "description": "Recommend movies based on a title",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "searchValue": {
                            "type": "string",
                            "description": "The title of the movie for which recommendations are needed",
                        }
                    },
                    "required": ["searchValue"],
                },
            },
        ]

        # Call GPT with the user query and the available functions
        payload = {
            "model": "gpt-3.5-turbo-0613",
            "messages": data["messages"],
            "functions": functions,
            "function_call": "auto",
        }

        response = requests.post(
            OPENAI_API_URL,
            headers={
                "Authorization": "Bearer " + OPENAI_API_KEY,
                "Content-Type": "application/json",
            },
            json=payload,
        )
        print(response.status_code)
        print(response.json())

        response_data = response.json()
        response_message = response_data["choices"][0]["message"]

        # Check if GPT wanted to call a function
        if response_message.get("function_call"):
            function_name = response_message["function_call"]["name"]
            print("Calling function: " + function_name)
            function_args = json.loads(response_message["function_call"]["arguments"])
            print("Function arguments: " + str(function_args))
            if function_name == "search_by_text":
                function_response = search_by_text_direct(function_args["searchValue"])
            elif function_name == "SearchMovies":
                search_movies_instance = SearchMovies()
                function_response = search_movies_instance.get(
                    request, title=function_args["title"]
                )
            elif function_name == "MovieRecommendation":
                function_response = MovieRecommendation(function_args["searchValue"])

            # Send the info on the function call and function response to GPT
            messages = data["messages"]
            messages.append(response_message)
            messages.append(
                {
                    "role": "function",
                    "name": function_name,
                    "content": json.dumps(function_response),
                }
            )
            print(messages)

            # Call GPT again to generate a user-friendly message
            second_response = requests.post(
                OPENAI_API_URL,
                headers={
                    "Authorization": "Bearer " + OPENAI_API_KEY,
                    "Content-Type": "application/json",
                },
                json={"model": "gpt-3.5-turbo-0613", "messages": messages},
            )
            print(second_response.status_code)
            print(second_response.json())

            second_response_data = second_response.json()

            # Extracting function response from the previous messages
            function_response_content = json.loads(data["messages"][-1]["content"])
            movie_details = function_response_content.get("movie_details", [])

            return JsonResponse(
                {
                    "message": second_response_data["choices"][0]["message"]["content"],
                    "movie_details": movie_details,
                }
            )

        # If no function was called by GPT, return the message directly
        print(
            "Returning message (when no function was called): "
            + response_message["content"]
        )

        return JsonResponse({"message": response_message["content"]})

    return JsonResponse({"error": "Only POST requests are allowed"}, status=405)


def MovieRecommendation(search_value):
    try:
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "When recommending movies, please enclose each movie title within {}. For example: {Titanic}, {The Notebook}, etc.",
                },
                {
                    "role": "user",
                    "content": f"Recommend movies similar to {search_value}?",
                },
            ],
        }

        response = requests.post(OPENAI_API_URL, headers=headers, json=data)
        openai_results = (
            response.json().get("choices", [{}])[0].get("message", {}).get("content")
        )
        print(f"OpenAI response: {openai_results}")
        movie_titles = re.findall(r"\{(.*?)\}", openai_results)

        print(f"Movie titles: {movie_titles}")

        if not movie_titles:
            return {"error": "No titles found in OpenAI response."}

        all_movie_details = []
        # Loop through each movie title
        for title in movie_titles:
            title_cleaned = title.replace("{{", "").replace("}}", "").strip()
            tmdb_response_data = search_in_tmdb(title_cleaned)
            print(f"TMDB Response for {title_cleaned}: {tmdb_response_data}")

            if tmdb_response_data.get("results"):
                movie_detail = tmdb_response_data["results"][0]
                all_movie_details.append(movie_detail)

        return {"openaiResults": openai_results, "movie_details": all_movie_details}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": str(e)}


@csrf_exempt
def search_by_text_direct(search_value):
    try:
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }

        data = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant."},
                {
                    "role": "user",
                    "content": f"Which movies feature the following: {search_value}?",
                },
            ],
        }

        response = requests.post(OPENAI_API_URL, headers=headers, json=data)
        openai_results = (
            response.json().get("choices", [{}])[0].get("message", {}).get("content")
        )

        # Search TheMovieDB based on the top result from GPT
        movie_titles = re.findall(r"\"(.*?)\"", openai_results)

        print(f"Movie titles: {movie_titles}")

        if not movie_titles:
            return {"error": "No titles found in OpenAI response."}

        # Using the first movie title to search in TheMovieDB
        title = movie_titles[0].replace("{{", "").replace("}}", "").strip()
        tmdb_response_data = search_in_tmdb(title)

        print(f"TMDB Response: {tmdb_response_data}")
        movie_details = []

        # Extract the top movie from the tmdb_response
        if tmdb_response_data.get("results"):
            top_movie_detail = tmdb_response_data["results"][0]
            movie_details.append(top_movie_detail)
            print(f"Movie Detail: {top_movie_detail}")

        return {"openaiResults": openai_results, "movie_details": movie_details}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": str(e)}


class SearchMovies(View):
    def get(self, request, *args, **kwargs):
        title = self.kwargs["title"]
        try:
            response_data = search_in_tmdb(title)
            return JsonResponse(response_data)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


def search_in_tmdb(title):
    try:
        query_params = {
            "api_key": THEMOVIEDB_KEY,
            "query": title,
            "language": "en-US",
        }
        response = requests.get(TMDB_SEARCH_URL, params=query_params)
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as http_err:
        raise Exception(f"HTTP error occurred: {http_err}")
    except Exception as err:
        raise Exception(f"An error occurred: {err}")


class GetMovieDetails(View):
    def get(self, request, *args, **kwargs):
        movie_id = self.kwargs["movie_id"]
        print(f"Inside get_movie_details function. {movie_id}")

        headers = {"accept": "application/json"}

        # Fetch movie details
        try:
            movie_details_url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={THEMOVIEDB_KEY}&language=en-US"
            response_movie = requests.get(movie_details_url, headers=headers)
            response_movie.raise_for_status()
            movie_data = response_movie.json()
        except requests.HTTPError as http_err:
            return JsonResponse(
                {
                    "error": f"HTTP error occurred while fetching movie details: {http_err}"
                },
                status=500,
            )
        except Exception as err:
            return JsonResponse(
                {"error": f"An error occurred while fetching movie details: {err}"},
                status=500,
            )

        # Fetch movie credits
        try:
            credits_url = f"https://api.themoviedb.org/3/movie/{movie_id}/credits?api_key={THEMOVIEDB_KEY}"
            response_credits = requests.get(credits_url, headers=headers)
            response_credits.raise_for_status()
            credits_data = response_credits.json()
            actors = credits_data.get("cast", [])[:8]  # Get top 8 actors
        except requests.HTTPError as http_err:
            return JsonResponse(
                {"error": f"HTTP error occurred while fetching credits: {http_err}"},
                status=500,
            )
        except Exception as err:
            return JsonResponse(
                {"error": f"An error occurred while fetching credits: {err}"},
                status=500,
            )

        # Aggregate data and return as a single response
        aggregated_data = {"movie_details": movie_data, "actors": actors}
        return JsonResponse(aggregated_data)


def login():
    headers = {
        "Api-Key": API_KEY,
        "Content-Type": "application/json",
        "User-Agent": "YourAppName vYourAppVersion",
    }
    data = {"username": USERNAME, "password": PASSWORD}
    response = requests.post(LOGIN_URL, headers=headers, json=data)
    if response.status_code == 200:
        return response.json().get("token")
    else:
        print(f"Error: Unable to login. Status Code: {response.status_code}")
        print(f"Message: {response.text}")
        exit()


class DownloadSubtitle(View):
    def get(self, request, *args, **kwargs):
        try:
            tmdb_id = request.GET.get("tmdb_id")
            if not tmdb_id:
                return JsonResponse({"error": "tmdb_id is required"}, status=400)
            # First, send a request to get the feature_id
            headers = {
                "Api-Key": API_KEY,
                "User-Agent": "YourAppName vYourAppVersion",
            }
            params = {"tmdb_id": tmdb_id}
            response = requests.get(SEARCH_URL, params=params, headers=headers)
            if response.status_code != 200:
                return JsonResponse(
                    {"error": "Error fetching subtitles."}, status=response.status_code
                )
            response_data = response.json()
            files = (
                response_data.get("data", [{}])[0]
                .get("attributes", {})
                .get("files", [{}])
            )
            if files:
                file_id = files[0].get("file_id")
                file_id = str(file_id)
            else:
                return JsonResponse({"error": "No file_id found."}, status=404)

            # Proceed to download the subtitle
            token = login()
            if not token:
                return JsonResponse({"error": "Unable to login."}, status=401)

            download_headers = {
                "Api-Key": API_KEY,
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "User-Agent": "YourAppName vYourAppVersion",
            }
            body = {"file_id": file_id}
            download_response = requests.post(
                DOWNLOAD_URL, headers=download_headers, json=body
            )
            if download_response.status_code == 200:
                download_link = download_response.json().get("link")
                subtitle_response = requests.get(download_link)
                if subtitle_response.status_code == 200:
                    file_name = download_response.json().get("file_name")
                    with open(file_name, "wb") as f:
                        f.write(subtitle_response.content)
                    return JsonResponse({"file_path": file_name})
                else:
                    return JsonResponse(
                        {"error": "Error downloading subtitle."},
                        status=subtitle_response.status_code,
                    )
            else:
                return JsonResponse(
                    {"error": "Error getting download link."},
                    status=download_response.status_code,
                )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)


def get_movie_details(request, tmdb_id):
    try:
        # Fetch actors using the MovieDB API
        actor_response = requests.get(
            f"https://api.themoviedb.org/3/movie/{tmdb_id}/credits?api_key={THEMOVIEDB_KEY}"
        )
        actors = actor_response.json().get("cast", [])[:8]

        # Generate a story using OpenAI
        story_response = requests.post(
            "https://api.openai.com/v1/engines/text-davinci-002/completions",
            json={
                "prompt": f"Write a story about {movie.title} movie, which was released in {movie.release_date}",
                "temperature": 0.9,
                "max_tokens": 500,
            },
            headers={
                "Authorization": f"Bearer {OPENAI_KEY}",
                "Content-Type": "application/json",
            },
        )
        story = story_response.json().get("choices", [{}])[0].get("text", "")

        return JsonResponse({"actors": actors, "story": story})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
