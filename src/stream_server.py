from flask import Flask
from flask_socketio import SocketIO
from flask import session
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
allowed_emotions = ["fear", "happy", "sad", "angry", "neutral"]
spotify_token_expired_time = 3600


def is_spotify_token_expired():
    print(session['access_token'], "HERE")
    print(session['emotion'])
    if not session['token_expired_at'] or time.time() > session['token_expired_at']:
        print("TOKEN IS EXPIRED GETTING NEW ONE")
        get_spotify_access_token()

def get_spotify_user_id():
    is_spotify_token_expired()
    url = "https://api.spotify.com/v1/me"
    headers = {
        'Authorization': f'Bearer {session['access_token']}'
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    user_data = response.json()
    session['spotify_user_id'] = user_data['id']
    session['spotify_username'] = user_data['display_name']

def create_empty_playlist(playlist_name, playlist_description):
    is_spotify_token_expired()
    request_body = {
        "name": playlist_name,
        "description": playlist_description,
        "public": True
    }
    headers = {
        "Authorization": f"Bearer {session['access_token']}",
        "Content-Type": "application/json",
    }

    response = requests.post("https://api.spotify.com/v1/users/{user_id}/playlists", headers=headers, json=request_body)



def get_spotify_access_token():

    session['token_expired_at'] = time.time() + spotify_token_expired_time

    client_credentials = f"{spotify_client_id}:{spotify_client_secret}"

    client_credentials_base64 = base64.b64encode(client_credentials.encode()).decode()

    headers = {
        "Authorization": f"Basic {client_credentials_base64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {"grant_type": "client_credentials"}
    print("Now doing access token req")
    response = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)
    response.raise_for_status()

    session['access_token'] = response.json()['access_token']

def get_emotion_tracks(emotion, song_count):
    is_spotify_token_expired()
    random_genre = random.choice(emotion_genres[emotion])
    headers = {
        'Authorization': f'Bearer {session['access_token']}'
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
    session['emotion'] = None
    session['access_token'] = None
    session['token_expired_at'] = None
    session['spotify_user_id'] = None
    session['spotify_username'] = None
    print("Client connected")

@socketio.on("disconnect")
def handle_disconnect():
    session.clear()
    print("Client disconnected")

@socketio.on("create_playlist")
def create_user_playlist(data):
    if not session['spotify_user_id']:
        get_spotify_user_id()
    
    



@socketio.on("image_frame")
def image_frame_handler(data):
    emotion = session['emotion']
    base64_string = data['base64_string']
    song_count = data['song_count']

    img = stringToImage(base64_string)
    coloredImage = toRGB(img)
    new_emotion = DeepFace.analyze(coloredImage, ['emotion'])[0]['dominant_emotion']

    if(emotion != new_emotion and new_emotion in allowed_emotions):
        emotion = new_emotion
        songs = get_emotion_tracks(emotion, song_count)
        if(songs):
            data_for_client = {
                "songs": songs,
                "emotion": emotion
            }
            socketio.emit("emotion_change", data_for_client)
    





socketio.run(app, "localhost", 5000)