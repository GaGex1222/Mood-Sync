'use client'
import { useEffect, useRef, useState } from "react";
import { CameraStream } from "./components/CameraStream";
import { Search, Ban, Smile } from "lucide-react";
import { emotionPhrases } from "../utils/emotionPhrases";
import {SongCountSlider} from "./components/SongCountSlider";
import { MoodButton } from "./components/MoodButton";
import { SongsData } from "../interfaces/data.interfaces";
import Image from "next/image";

export default function Home() {
  const [cameraActivated, setCameraActivated] = useState<boolean>(false);
  const [userEmotion, setUserEmotion] = useState<string | null>(null);
  const [songsData, SetSongsData] = useState<SongsData>({});
  const [songCount, setSongCount] = useState(10);

  useEffect(() => {
    console.log(songsData)
  }, [songsData])
  
  return (
    <div className="min-h-screen flex flex-col items-center bg-cover bg-center relative overflow-y-auto">
      <div className="text-center text-[#00B786] p-10 rounded-lg w-full md:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto my-5">
        <h1 className="text-4xl font-bold mb-4">Welcome to MoodSync</h1>
        <p className="text-xl">Your emotion-driven music player.</p>
      </div>

      {cameraActivated && (
        <div className="border-2 border-[#00B786] mt-5 w-full md:w-2/3 lg:w-1/2 xl:w-1/3 mx-auto rounded-md">
          <CameraStream
            cameraActivated={cameraActivated}
            setSongs={SetSongsData}
            setEmotion={setUserEmotion}
            songCount={songCount}
          />
        </div>
      )}

      <MoodButton
        cameraActivated={cameraActivated}
        setCameraActivated={setCameraActivated}
      />

      {!cameraActivated && (
        <SongCountSlider songCount={songCount} setSongCount={setSongCount} />
      )}

      <div className="absolute bottom-5 w-full text-center">
        <small className="text-gray-500">Mood analysis may not always be perfect.</small>
      </div>

      {Object.keys(songsData).length > 0 && userEmotion && (
        <div className="mt-3 w-1/4">
          <div className="bg-[#00B786] p-5 rounded-lg">
            <h2 className="text-2xl font-bold text-white mb-4">{emotionPhrases[userEmotion]}</h2>
            <div className="space-y-4 overflow-y-auto h-auto max-h-[24rem]">
              {Object.keys(songsData).map((song, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <img
                    src={songsData[song]["image"]}
                    alt={"song image"}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                  <p className="text-white">{song}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
