from flask import Flask
from flask_socketio import SocketIO
import io
import cv2
import base64 
from dotenv import load_dotenv
import numpy as np
from PIL import Image
import requests
import os
from deepface import DeepFace
import time
import random


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3000"])
load_dotenv()

emotion_genres = {
    "happy": ['Pop', 'Dance', 'Indie Pop', 'Reggae', 'Electronic (EDM)'],
    "surprised": ['Pop', 'Dance', 'Indie Pop', 'Reggae', 'Electronic (EDM)'],
    "sad": ['Blues', 'Acoustic', 'Folk', 'Classical (Slow Movements)', 'Indie Rock'],
    "neutral": ['Ambient', 'Jazz', 'Instrumental', 'Soft Pop', 'Chillwave'],
    "angry": ['Hard Rock', 'Metal', 'Punk', 'Industrial', 'Grunge'],
    "fear": ['Dark Ambient', 'Horror Soundtracks', 'Industrial', 'Post-Punk', 'Noise']
}
spotify_client_id = os.getenv("AUTH_SPOTIFY_ID")
spotify_client_secret = os.getenv("AUTH_SPOTIFY_SECRET")
print(spotify_client_id)
print(spotify_client_secret)
spotify_access_token = ""
spotify_token_expired_time = 3600
expires_at = None


def is_spotify_token_expired():
    if not expires_at or time.time() > expires_at:
        print("TOKEN IS EXPIRED GETTING NEW ONE")
        get_spotify_access_token()

# def create_spotify_playlist(playlist_name, playlist_description):
#     is_spotify_token_expired()
#     request_body = {
#         "name": playlist_name,
#         "description": playlist_description,
#         "public": True
#     }
#     headers = {
#         "Authorization": f"Bearer {spotify_access_token}",
#         "Content-Type": "application/json",
#     }
#     response = requests.post("https://api.spotify.com/v1/users/{user_id}/playlists", headers=headers, json=request_body)

def get_spotify_access_token():
    global expires_at
    global spotify_access_token

    expires_at = time.time() + spotify_token_expired_time

    # Create the client credentials string
    client_credentials = f"{spotify_client_id}:{spotify_client_secret}"

    # Encode the credentials as bytes and then Base64 encode them
    client_credentials_base64 = base64.b64encode(client_credentials.encode()).decode()  # Default is UTF-8

    # Add the Base64-encoded string to the Authorization header
    headers = {
        "Authorization": f"Basic {client_credentials_base64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    # Request body
    data = {"grant_type": "client_credentials"}

    # Make the POST request
    response = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)
    print("Request Headers:", headers)
    print("Request Data:", data)
    print("Response Status Code:", response.status_code)
    print("Response Content:", response.text)
    response.raise_for_status()

    # Parse and store the access token
    spotify_access_token = response.json()["access_token"]

def get_emotion_spotify_playlist(emotion, song_count):
    is_spotify_token_expired()
    random_genre = random.choice(emotion_genres[emotion])
    headers = {
        'Authorization': f'Bearer {spotify_access_token}'
    }
    params = {
        'q': f'genre:"{random_genre}"',
        'type': 'track', 
        'limit': song_count 
    }
    response = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)
    response.raise_for_status()
    songs_dict = {}
    for item in response.json()['tracks']['items']:
        spotify_song_name = item['name']
        spotify_image_url = item['album']['images'][0]['url']
        songs_dict[spotify_song_name] = {"image": spotify_image_url}
    return songs_dict


def stringToImage(base64_string):
    imgdata = base64.b64decode(base64_string.split(',')[1])
    return Image.open(io.BytesIO(imgdata))

def toRGB(image):
    return cv2.cvtColor(np.array(image), cv2.COLOR_BGR2RGB)

@socketio.on("connect")
def handle_connect():
    print("Client connected")

@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")

@socketio.on("image_frame")
def image_frame_handler(data):
    base64_string = data['base64_string']
    song_count = data['song_count']
    img = stringToImage(base64_string)
    coloredImage = toRGB(img)
    emotion = DeepFace.analyze(coloredImage, ['emotion'])[0]['dominant_emotion']
    print(emotion)
    if(emotion):
        songs = get_emotion_spotify_playlist(emotion, song_count)
        data_for_client = {
            "songs": songs,
            "emotion": emotion
        }
        socketio.emit("emotion_change", data_for_client)
    else:
        print("Could not find face")





socketio.run(app, "localhost", 5000)