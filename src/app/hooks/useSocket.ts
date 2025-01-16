import { useEffect, useRef } from "react";
import io from "socket.io-client";

export function useSocket(){
    const socketRef = useRef<SocketIOClient.Socket | null>(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:5000');

        return () => {
            socketRef.current?.disconnect()
        }
    }, [])

    const videoFrameHandler = (base64String: string) => {
        if(socketRef.current){
            socketRef.current.emit('image_frame')
        }
    }
}