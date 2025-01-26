from flask import Flask, request
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

allowed_emotions = ["fear", "happy", "sad", "angry", "neutral"]
spotify_token_expired_time = 3600



def get_spotify_user_id(access_token):
    url = "https://api.spotify.com/v1/me"
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    user_data = response.json()
    session['spotify_user_id'] = user_data['id']
    session['spotify_username'] = user_data['display_name']

def add_tracks_to_playlist(track_uris, playlist_id, access_token):
    url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"

    request_body = {
        "uris": track_uris
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    response = requests.post(url, headers=headers, json=request_body)
    response.raise_for_status()




def create_empty_playlist(track_uris, access_token, session_id):
    request_body = {
        "name": f"{session['spotify_username']} {session['emotion']} playlist!",
        "description": f"Playlist that was created for {session['spotify_username']} when he is feeling {session['emotion']}",
        "public": True
    }
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }

    response = requests.post(f"https://api.spotify.com/v1/users/{session['spotify_user_id']}/playlists", headers=headers, json=request_body)
    response.raise_for_status()

    data = response.json()
    playlist_id = data['id']
    playlist_url = data['external_urls']['spotify']
    add_tracks_to_playlist(track_uris, playlist_id, access_token, playlist_url)
    data = {
        "playlist_url": playlist_url,
        "session_id": session_id
    }
    socketio.emit('playlist_url', data)
    





def get_emotion_tracks(emotion, song_count, access_token):
    random_genre = random.choice(emotion_genres[emotion])

    headers = {
        'Authorization': f'Bearer {access_token}'
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
    session['spotify_user_id'] = None
    session['spotify_username'] = None
    print(request.sid)
    print("Client connected")

@socketio.on("disconnect")
def handle_disconnect():
    session.clear()
    print("Client disconnected")

@socketio.on("create_playlist")
def create_user_playlist(data):
    access_token = data['access_token']
    if not session['spotify_user_id']:
         get_spotify_user_id(access_token)
    tracks_uris = data['songs']
    session_id = data['session_id']
    create_empty_playlist(tracks_uris, access_token)
    
    



@socketio.on("image_frame")
def image_frame_handler(data):
    base64_string = data['base64_string']
    session_id = data['session_id']
    img = stringToImage(base64_string)
    coloredImage = toRGB(img)
    new_emotion = DeepFace.analyze(coloredImage, ['emotion'])[0]['dominant_emotion']

    if(session['emotion'] != new_emotion and new_emotion in allowed_emotions):
        session['emotion'] = new_emotion
        print(session['emotion'])
        print(new_emotion)
        song_count = data['song_count']
        user_access_token = data['access_token']
        songs = get_emotion_tracks(session['emotion'], song_count, user_access_token)

        if(songs):
            data_for_client = {
                "songs": songs,
                "emotion": session['emotion'],
                "session_id": session_id
            }
            print(data_for_client)
            socketio.emit("emotion_change", data_for_client)
    

socketio.run(app, "localhost", 5000)