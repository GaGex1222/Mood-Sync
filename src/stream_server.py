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
emotion = None
allowed_emotions = ["fear", "happy", "sad", "angry", "neutral"]
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

    client_credentials = f"{spotify_client_id}:{spotify_client_secret}"

    client_credentials_base64 = base64.b64encode(client_credentials.encode()).decode()  # Default is UTF-8

    headers = {
        "Authorization": f"Basic {client_credentials_base64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}

    response = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)
    response.raise_for_status()

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
        print(item["uri"])
        spotify_song_name = item['name']
        spotify_image_url = item['album']['images'][0]['url']
        spotify_track_url = item['uri']
        songs_dict[spotify_song_name] = {"image": spotify_image_url, "url": spotify_track_url}
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
    global emotion
    base64_string = data['base64_string']
    song_count = data['song_count']
    img = stringToImage(base64_string)
    coloredImage = toRGB(img)
    new_emotion = DeepFace.analyze(coloredImage, ['emotion'])[0]['dominant_emotion']
    print(new_emotion)
    if(emotion != new_emotion and new_emotion in allowed_emotions):
        print("new emotion: ", new_emotion)
        emotion = new_emotion
        songs = get_emotion_spotify_playlist(new_emotion, song_count)
        print(len(songs))
        if(songs):
            data_for_client = {
                "songs": songs,
                "emotion": emotion
            }
            socketio.emit("emotion_change", data_for_client)
    





socketio.run(app, "localhost", 5000)