import React from 'react'
import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';

interface CameraStreamProps {
  cameraActivated: boolean
}

export const CameraStream: React.FC<CameraStreamProps> = ({cameraActivated}) => {
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const {sendCameraFrame, userMood, disconnectClient} = useSocket();
    useEffect(() => {
      if(cameraActivated){
        const startCamera = async () => {
          try{
            const stream = await navigator.mediaDevices.getUserMedia({video: true});
            setMediaStream(stream)
            const videoTrack = stream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(videoTrack)
            const sendFrame = async () => {
              const photo = await imageCapture.takePhoto();
              const reader = new FileReader();
              reader.onloadend = () => {
                const frameData = reader.result as string;
                sendCameraFrame(frameData)
              }
    
              reader.readAsDataURL(photo)
              setTimeout(sendFrame, 10000)
            }
            sendFrame()
          } catch (error){
            console.error('Error accessing webcam', error)
          }
        }
        startCamera()
      } else {
        disconnectClient();
        if(videoRef.current){
          videoRef.current = null
        }
      }
    }, [cameraActivated])

    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play();
        }
    }, [mediaStream]);

  return (
    <div>
        <video ref={videoRef} className='scale-x scale-x-[-1]' autoPlay={true} />
    </div>
  )
}

