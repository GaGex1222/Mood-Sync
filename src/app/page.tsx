'use client'
import { useEffect, useRef, useState } from "react";
import { CameraStream } from "./components/CameraStream";

export default function Home() {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef(null);
  useEffect(() => {
    const startCamera = async () => {
      try{
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack)
        setMediaStream(stream)
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
      startCamera()
    }
  }, [])
  return (
    <div className="h-full flex items-center justify-center bg-cover bg-center flex-col">
      <div className="text-center text-white p-10 bg-opacity-60 bg-gray-900 rounded-lg">
        <h1 className="text-4xl font-bold mb-4">Welcome to MoodSync</h1>
        <p className="text-xl">Your emotion-driven music player.</p>
      </div>
      <div className="border-2 border-black mt-2 rounded-md">
        <CameraStream/>
      </div>
    </div>
  );
}
