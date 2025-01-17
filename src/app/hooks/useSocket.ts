import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

export function useSocket(){
    const socketRef = useRef<SocketIOClient.Socket | null>(null);
    const [userMood, setUserMood] = useState<String>();
    const [message, setMessage] = useState()
    useEffect(() => {
        socketRef.current = io('http://localhost:5000');
        
        socketRef.current.on("moodChange", (mood: string) => {
            console.log("Current user mood: ", mood)
            setUserMood(mood)
        })

        return () => {
            disconnectClient()
        }
    }, [])

    const sendCameraFrame = (base64String: string) => {
        if(socketRef.current){
            socketRef.current.emit('image_frame', base64String)
        }
    }

    const disconnectClient = () => {
        socketRef.current?.disconnect()
    }

    return {sendCameraFrame, userMood, disconnectClient}
}