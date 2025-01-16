import React from 'react'
import { useEffect, useState, useRef } from 'react';

export const CameraStream = () => {
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
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
                console.log(frameData)
              }
    
              reader.readAsDataURL(photo)
              setTimeout(sendFrame, 1000)
            }
            sendFrame()
          } catch (error){
            console.error('Error accessing webcam', error)
          }
        }
        startCamera()
    }, [])

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

