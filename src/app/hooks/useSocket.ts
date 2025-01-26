import { useEffect, useRef, useState } from "react";
import { SongsData, EmotionChangeData, PlaylistUrlChange } from "@/src/interfaces/data.interfaces";
import io from "socket.io-client";


export function useSocket(setEmotion: (emotion: string) => void, songCount: number, setSongs: (songs: SongsData) => void, cameraActivated: boolean, setPlaylistUrl: (url: string) => void){


    const socketRef = useRef<SocketIOClient.Socket | null>(null);

    useEffect(() => {
        if(cameraActivated)
            if(!socketRef.current){
                socketRef.current = io('http://localhost:5000');
            }

            if(socketRef.current){
                socketRef.current.on("emotion_change", (data: EmotionChangeData) => {
                    const currentSessionId = sessionStorage.getItem("sessionId");
                    if (data['session_id'] === currentSessionId) {
                        setEmotion(data.emotion);
                        setSongs(data.songs);
                    }
                })

                socketRef.current.on("playlist_url", (data: PlaylistUrlChange) => {
                    const currentSessionId = sessionStorage.getItem("sessionId");
                    if(data.session_id === currentSessionId){
                        setPlaylistUrl(data.playlistUrl)
                    }
                })
            }
    }, [cameraActivated])
    

    const sendCameraFrame = (base64String: string, access_token: string) => {
        if(socketRef.current){
            const currentSessionId = sessionStorage.getItem("sessionId");
            const data = {
                "base64_string": base64String,
                "song_count": songCount,
                "access_token": access_token,
                "session_id": currentSessionId
            }

            socketRef.current.emit('image_frame', data)
        }
    }

    const createUserPlaylist = (accessToken: string, tracksUrls: string[]) => {
        if(socketRef.current){
            const currentSessionId = sessionStorage.getItem("sessionId");
            const data = {
                "access_token": accessToken,
                "songs": tracksUrls,
                "session_id": currentSessionId
            }

            socketRef.current.emit('create_playlist', data)
        }
    }


    return {sendCameraFrame, createUserPlaylist}
}