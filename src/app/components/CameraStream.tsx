import React from 'react'
import { useEffect, useState, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { CameraStreamProps } from '@/src/interfaces/props.interfaces';

export const CameraStream: React.FC<CameraStreamProps> = ({cameraActivated, setEmotion, songCount, setSongs}) => {
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const {sendCameraFrame, disconnectClient} = useSocket(setEmotion, songCount, setSongs);
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
        {cameraActivated && !videoRef.current ? (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="animate-spin rounded-full border-t-2 border-[#00B786] w-32 h-32 border-solid"></div>
          </div>
        ): ('')}
        <video ref={videoRef} className='scale-x scale-x-[-1]' autoPlay={true} />
    </div>
    
  )
}

