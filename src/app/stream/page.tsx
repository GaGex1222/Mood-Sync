"use client";
import { useEffect, useRef, useState } from "react";
import { emotionPhrases } from "../../utils/emotionPhrases";
import { SongCountSlider } from "../components/SongCountSlider";
import { MoodButton } from "../components/MoodButton";
import { SongsData } from "../../interfaces/data.interfaces";
import { AudioWaveform, MoveRight, Check } from "lucide-react";
import { useSocket } from "../hooks/useSocket";
import { signIn, useSession } from "next-auth/react";
import LogInButton from "../components/LogInButton";

export default function Home() {
  const [cameraActivated, setCameraActivated] = useState<boolean>(false);
  const [userEmotion, setUserEmotion] = useState<string | null>(null);
  const [songsData, SetSongsData] = useState<SongsData>({});
  const [songCount, setSongCount] = useState(10);
  const { data: session } = useSession();
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { sendCameraFrame, createUserPlaylist } = useSocket(
    setUserEmotion,
    songCount,
    SetSongsData,
    cameraActivated,
    setPlaylistUrl
  );
  const frameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setButtonLoading(false);
    console.log(playlistUrl)
  }, [playlistUrl]);

  useEffect(() => {
    const sessionId = sessionStorage.getItem("sessionId") || Math.random().toString(36).substring(2);
        
    if (!sessionStorage.getItem("sessionId")) {
        sessionStorage.setItem("sessionId", sessionId);
    }

    let isProcessing = false;

    const cleanup = () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      if (frameTimeoutRef.current) {
        clearTimeout(frameTimeoutRef.current);
        frameTimeoutRef.current = null;
      }
    };

    if (!cameraActivated) {
      cleanup();
      return;
    }

    if (cameraActivated) {

      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          setMediaStream(stream);
          const videoTrack = stream.getVideoTracks()[0];
          const imageCapture = new ImageCapture(videoTrack);
          const sendFrame = async () => {
            if (!cameraActivated || isProcessing) return;
            console.log("camera", cameraActivated)
            console.log("proccess", isProcessing)
            isProcessing = true;
            const photo = await imageCapture.takePhoto();
            const reader = new FileReader();
            reader.onloadend = () => {
              const frameData = reader.result as string;
              if (session?.accessToken) {
                sendCameraFrame(frameData, session?.accessToken);
              }
              console.log("Now sent camera");
            };

            reader.readAsDataURL(photo);
            isProcessing = false;
            frameTimeoutRef.current = setTimeout(sendFrame, 1000);
          };

          setTimeout(sendFrame, 1000);
        } catch (error) {
          console.error("Error accessing webcam", error);
        }
      };
      startCamera();
    }
    return cleanup
  }, [cameraActivated]);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play();
    }
  }, [mediaStream]);

  const handleCreatePlaylist = () => {
    if (!session) {
      signIn("spotify");
    }

    if (session?.accessToken) {
      setCameraActivated(false);
      setButtonLoading(true);
      const tracksUrls: string[] = Object.values(songsData).map(
        (obj) => obj.url
      );
      createUserPlaylist(session.accessToken, tracksUrls);
    }
  };

  const handleOpenPlaylist = () => {
    if (playlistUrl) {
      window.open(playlistUrl);
    }
  };

  const handleMoodRetry = () => {
    SetSongsData({});
    setPlaylistUrl(null);
    setCameraActivated(true);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-teal-700 to-green-400 relative overflow-y-auto px-4">
        <div className="absolute top-4 left-4">
          <LogInButton session={session} />
        </div>

        <div className="text-center text-white p-8 rounded-lg w-full md:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto mt-10">
          <h1 className="text-5xl font-extrabold mb-6">Turn Emotions into Music.</h1>
          <p className="text-lg font-light">Your emotion-driven playlist creator powered by AI.</p>
        </div>


        {cameraActivated && (
          <div className="mt-10 border-4 border-white rounded-xl overflow-hidden">
            {cameraActivated && !videoRef.current && (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full border-t-4 border-white w-16 h-16"></div>
              </div>
            )}
            <video
              ref={videoRef}
              className="w-full h-auto object-cover scale-x-[-1]"
              autoPlay={true}
            />
          </div>
        )}

        <div className="mt-8">
          <MoodButton
            cameraActivated={cameraActivated}
            session={session}
            handleMoodRetry={handleMoodRetry}
            playlistUrl={playlistUrl}
            setCameraActivated={setCameraActivated}
          />
        </div>

        {!cameraActivated && (
          <div className="mt-6">
            <SongCountSlider songCount={songCount} setSongCount={setSongCount} />
          </div>
        )}

        {Object.keys(songsData).length > 0 && userEmotion && (
          <div className="fixed top-1/2 right-5 transform -translate-y-1/2 w-full max-w-sm lg:max-w-md transition-transform duration-1000 ease-out animate-fadeIn z-20">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-[#00B786] mb-6 text-center">
                {emotionPhrases[userEmotion]}
              </h2>

              <div className="space-y-4 overflow-y-auto max-h-[24rem] no-scrollbar">
                {Object.keys(songsData).map((song, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 bg-gradient-to-br from-teal-700 to-green-400 rounded-md p-3 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={songsData[song]["image"]}
                      alt={`Cover art for ${song}`}
                      className="w-14 h-14 object-cover rounded-md"
                    />
                    <p className="text-white font-medium truncate">{song}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-center">
                {playlistUrl ? (
                  <button
                    onClick={handleOpenPlaylist}
                    className="flex items-center px-6 py-3 bg-[#00B786] text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition active:translate-y-0 hover:-translate-y-1"
                  >
                    Open Spotify Playlist
                    <span className="ml-2">
                      <MoveRight className="w-5 h-5" />
                    </span>
                  </button>
                ) : (
                  <button
                    disabled={buttonLoading}
                    onClick={handleCreatePlaylist}
                    className="flex items-center px-6 py-3 bg-[#00B786] text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition active:translate-y-0 hover:-translate-y-1 disabled:opacity-50"
                  >
                    {buttonLoading ? (
                      <span className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="opacity-25"
                          />
                          <path
                            fill="none"
                            d="M22 12A10 10 0 1 1 2 12 10 10 0 0 1 22 12Z"
                            className="opacity-75"
                          />
                        </svg>
                        <span>Loading...</span>
                      </span>
                    ) : (
                      <>
                        Create Spotify Playlist
                        <span className="ml-2">
                          <AudioWaveform className="w-5 h-5" />
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-5 w-full text-center mt-10">
          <small className="text-white opacity-80">
            Mood analysis may not always be perfect.
          </small>
        </div>
      </div>
    </>
  );
}