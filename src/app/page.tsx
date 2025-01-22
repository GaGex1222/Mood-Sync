'use client'
import { useEffect, useRef, useState } from "react";
import { Search, Ban, Smile } from "lucide-react";
import { emotionPhrases } from "../utils/emotionPhrases";
import {SongCountSlider} from "./components/SongCountSlider";
import { MoodButton } from "./components/MoodButton";
import { SongsData } from "../interfaces/data.interfaces";
import { AudioWaveform, MoveRight } from "lucide-react";
import { useSocket } from "./hooks/useSocket";
import { signIn, useSession } from "next-auth/react";

export default function Home() {
  const [cameraActivated, setCameraActivated] = useState<boolean>(false);
  const [userEmotion, setUserEmotion] = useState<string | null>(null);
  const [songsData, SetSongsData] = useState<SongsData>({});
  const [songCount, setSongCount] = useState(10);
  const {data: session} = useSession();
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const {sendCameraFrame, disconnectClient, createUserPlaylist} = useSocket(setUserEmotion, songCount, SetSongsData, cameraActivated);
  const frameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  

  useEffect(() => {
    console.log(cameraActivated)
    let isProcessing = false;

    const cleanup = () => {
      disconnectClient(); 
      if (videoRef.current) {
        videoRef.current.srcObject = null; 
      }
      if (frameTimeoutRef.current) {
        clearTimeout(frameTimeoutRef.current); 
        frameTimeoutRef.current = null;
      }
      console.log("Now cleaned");
    };

    if(!cameraActivated){
      cleanup()
      console.log("Now cleaned")
      return;
    }

    if(cameraActivated){
      const startCamera = async () => {
        try{
          const stream = await navigator.mediaDevices.getUserMedia({video: true});
          setMediaStream(stream)
          const videoTrack = stream.getVideoTracks()[0];
          const imageCapture = new ImageCapture(videoTrack)
          const sendFrame = async () => {
            if(!cameraActivated || isProcessing) return;
            isProcessing = true
            const photo = await imageCapture.takePhoto();
            const reader = new FileReader();
            reader.onloadend = () => {
              const frameData = reader.result as string;
              sendCameraFrame(frameData)
              console.log("Now sent camera")
            }
  
            reader.readAsDataURL(photo)
            isProcessing = false;
            frameTimeoutRef.current = setTimeout(sendFrame, 1000)
          }
          setTimeout(sendFrame, 1000)
        } catch (error){
          console.error('Error accessing webcam', error)
        }
      }
      startCamera()
    }
  }, [cameraActivated])

  useEffect(() => {
      if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
      }
  }, [mediaStream]);

  const handleCreatePlaylist = () => {
    if(!session){
      signIn('spotify')
    } 
    if(session?.accessToken){
      console.log(session.accessToken)
    }
  }

  const handleOpenPlaylist = () => {
    if(playlistUrl){
      window.open(playlistUrl)
    }
  }



  
  return (
    <div className="min-h-screen flex flex-col items-center bg-cover bg-center relative overflow-y-auto px-4">
      <div className="text-center text-[#00B786] p-10 rounded-lg w-full md:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto my-5">
        <h1 className="text-4xl font-bold mb-4">Welcome to MoodSync</h1>
        <p className="text-xl">Your emotion-driven music player.</p>
      </div>

      {cameraActivated && (
        <>
          <div className="border-2 border-[#00B786]">
              {cameraActivated && !videoRef.current ? (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="animate-spin rounded-full border-t-2 border-[#00B786] w-32 h-32 border-solid"></div>
                </div>
              ): ('')}
              <video ref={videoRef} className='scale-x scale-x-[-1]' autoPlay={true} />
          </div>
        </>
      )}

      <div className="mt-4">
        <MoodButton
          cameraActivated={cameraActivated}
          setCameraActivated={setCameraActivated}
        />
      </div>

      {!cameraActivated && (
        <div className="mt-4">
          <SongCountSlider songCount={songCount} setSongCount={setSongCount} />
        </div>
      )}

      {Object.keys(songsData).length > 0 && userEmotion && (
        <div className="fixed top-1/2 right-5 transform -translate-y-1/2 w-full max-w-sm lg:max-w-md transition-transform duration-1000 ease-out opacity-0 animate-fadeIn z-20">
          <div className="bg-[#00B786] p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {emotionPhrases[userEmotion]}
            </h2>

            <div className="space-y-4 overflow-y-auto max-h-[24rem] no-scrollbar">
              {Object.keys(songsData).map((song, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 bg-[#019F6C] rounded-md p-2 hover:shadow-md transition-shadow"
                >
                  <img
                    src={songsData[song]["image"]}
                    alt={`Cover art for ${song}`}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <p className="text-white font-medium truncate">{song}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              {playlistUrl ? (
                <button onClick={handleOpenPlaylist} className="flex items-center px-4 duration-300 py-2 bg-white text-[#00B786] font-semibold rounded-lg shadow-md hover:shadow-lg transition active:translate-y-0 hover:-translate-y-1 hover:bg-gray-200">
                  Open spotify playlist
                  <span className="ml-2">
                    <MoveRight className="w-5 h-5" />
                  </span>
                </button>
              ): (
                <button onClick={handleCreatePlaylist} className="flex items-center px-4 duration-300 py-2 bg-white text-[#00B786] font-semibold rounded-lg shadow-md hover:shadow-lg transition active:translate-y-0 hover:-translate-y-1 hover:bg-gray-200">
                  Create spotify playlist
                  <span className="ml-2">
                    <AudioWaveform className="w-5 h-5" />
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-5 w-full text-center mt-10">
        <small className="text-gray-500">Mood analysis may not always be perfect.</small>
      </div>
    </div>
  );
}