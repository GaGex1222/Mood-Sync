import { useEffect, useRef, useState } from "react";
import { SongsData, EmotionChangeData } from "@/src/interfaces/data.interfaces";
import io from "socket.io-client";


export function useSocket(setEmotion: (emotion: string) => void, songCount: number, setSongs: (songs: SongsData) => void, cameraActivated: boolean){


    const socketRef = useRef<SocketIOClient.Socket | null>(null);
    useEffect(() => {
        if(cameraActivated)
            socketRef.current = io('http://localhost:5000');
            
            if(socketRef.current){
                socketRef.current.on("emotion_change", (data: EmotionChangeData) => {
                    setEmotion(data['emotion'])
                    setSongs(data["songs"])
                })
            }

        return () => {
            disconnectClient()
        }
    }, [cameraActivated])

    const sendCameraFrame = (base64String: string) => {
        if(socketRef.current){
            const data = {
                "base64_string": base64String,
                "song_count": songCount
            }

            socketRef.current.emit('image_frame', data)
        }
    }

    const createUserPlaylist = (accessToken: string, songs: string[]) => {
        if(socketRef.current){
            const data = {
                "access_token": accessToken,
                "songs": songs,
            }

            socketRef.current.emit('create_playlist', data)
        }
    }

    const disconnectClient = () => {
        socketRef.current?.disconnect()
    }

    return {sendCameraFrame, disconnectClient, createUserPlaylist}
}