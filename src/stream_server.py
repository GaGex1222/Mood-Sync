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
    "sad": ['Blues', 'Acoustic', 'Folk', 'Classical (Slow Movements)', 'Indie Rock'],
    "neutral": ['Ambient', 'Jazz', 'Instrumental', 'Soft Pop', 'Chillwave'],
    "angry": ['Hard Rock', 'Metal', 'Punk', 'Industrial', 'Grunge'],
    "fear": ['Dark Ambient', 'Horror Soundtracks', 'Industrial', 'Post-Punk', 'Noise']
}
spotify_client_id = os.getenv("SPOTIFY_CLIENT_ID")
spotify_client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
spotify_access_token = ""
spotify_token_expired_time = 3600
expires_at = None


def is_spotify_token_expired():
    if not expires_at or time.time() > expires_at:
        get_spotify_access_token()

def get_spotify_access_token():
    global expires_at
    global spotify_access_token

    expires_at = time.time() + spotify_token_expired_time
    data = {
        "grant_type": "client_credentials",
        "client_id": spotify_client_id,
        "client_secret": spotify_client_secret
    }
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)
    response.raise_for_status()
    spotify_access_token = response.json()["access_token"]

def get_emotion_spotify_playlist(emotion):
    is_spotify_token_expired()
    random_genre = random.choice(emotion_genres[emotion])
    headers = {
        'Authorization': f'Bearer {spotify_access_token}'
    }
    params = {
        'q': f'genre:"{random_genre}"',
        'type': 'track', 
        'limit': 10 
    }
    response = requests.get("https://api.spotify.com/v1/search", headers=headers, params=params)
    response.raise_for_status()
    for item in response.json()['tracks']['items']:
        print(item['external_urls']['spotify'])

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
def image_frame_handler(base64_string):
    print("HAHAHA")
    img = stringToImage(base64_string)
    coloredImage = toRGB(img)
    emotion = DeepFace.analyze(coloredImage, ['emotion'])[0]['dominant_emotion']
    if(emotion):
        print(emotion)
        get_emotion_spotify_playlist(emotion=emotion)
    else:
        print("Could not find face")





socketio.run(app, "localhost", 5000)