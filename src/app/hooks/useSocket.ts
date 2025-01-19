import { useEffect, useRef, useState } from "react";
import { SongsData, EmotionChangeData } from "@/src/interfaces/data.interfaces";
import io from "socket.io-client";


export function useSocket(setEmotion: (emotion: string) => void, songCount: number, setSongs: (songs: SongsData) => void){


    const socketRef = useRef<SocketIOClient.Socket | null>(null);
    useEffect(() => {
        socketRef.current = io('http://localhost:5000');
        
        socketRef.current.on("emotion_change", (data: EmotionChangeData) => {
            setEmotion(data['emotion'])
            setSongs(data["songs"])
        })

        return () => {
            disconnectClient()
        }
    }, [])

    const sendCameraFrame = (base64String: string) => {
        if(socketRef.current){
            const data = {
                "base64_string": base64String,
                "song_count": songCount
            }
            socketRef.current.emit('image_frame', data)
        }
    }

    const disconnectClient = () => {
        socketRef.current?.disconnect()
    }

    return {sendCameraFrame, disconnectClient}
}