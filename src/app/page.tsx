'use client'
import { useEffect, useRef, useState } from "react";
import { CameraStream } from "./components/CameraStream";
import { Search, Ban } from "lucide-react";

export default function Home() {
  const [cameraActivated, setCameraActivated] = useState(false);
  return (
    <div className="h-full flex items-center justify-center bg-cover bg-center flex-col">
      <div className="text-center  text-[#00B786] p-10 rounded-lg">
        <h1 className="text-4xl font-bold mb-4">Welcome to MoodSync</h1>
        <p className="text-xl">Your emotion-driven music player.</p>
      </div>
      {cameraActivated && (
        <div className="border-2 border-[#00B786] mt-2 rounded-md">
          <CameraStream cameraActivated={cameraActivated}/>
        </div>
      )}
      <button onClick={() => setCameraActivated(!cameraActivated)} className="rounded-md flex justify-center hover:shadow-md bg-[#00B786] transition-all hover:-translate-y-1 hover:bg-[#00956A] active:translate-y-1 duration-300 p-3 mt-10">{!cameraActivated ? <>Find your playlist<span><Search className="w-5 ml-2 h-5"/></span></> : <>Stop checking mood<span><Ban className="w-5 ml-2 h-5"/></span></>}</button>
    </div>
  );
}
