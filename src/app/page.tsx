'use client'
import { useRouter } from "next/navigation";
import LogInButton from "./components/LogInButton";
import { Smile, Music, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { generateString } from "../utils/helperFunctions";

export default function LandingPage() {
  const router = useRouter();
  const {data: session} = useSession();

  const handleGetStarted = () => {
    const randomSocketId = generateString(10)
    router.push(`/home/${randomSocketId}`); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-700 to-green-400 text-white relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-teal-900 opacity-30 pointer-events-none"></div>

      <div className="absolute top-4 left-4">
        <LogInButton session={session} />
      </div>

      <div className="text-center relative z-10">
        <h1 className="text-5xl font-bold mb-6 drop-shadow-lg">
          Welcome to <span className="text-yellow-300">MoodSync</span>
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
          Discover your mood through music. Analyze your emotions and let MoodSync
          craft the perfect Spotify playlist just for you.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            className="bg-white text-teal-700 px-6 py-3 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-transform duration-300 hover:-translate-y-1 flex items-center space-x-2"
            onClick={handleGetStarted}
          >
            <Smile className="w-5 h-5" />
            <span>Get Started</span>
          </button>

          <button
            className="bg-transparent border-2 border-white text-white px-6 py-3 font-bold rounded-lg shadow-lg hover:bg-white hover:text-teal-700 transition-transform duration-300 hover:-translate-y-1 flex items-center space-x-2"
            onClick={() => router.push("/about")}
          >
            <Music className="w-5 h-5" />
            <span>Learn More</span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-10 w-full text-center">
        <p className="text-sm text-gray-200">
          Experience personalized music like never before. Powered by AI and Spotify.
        </p>
      </div>
    </div>
  );
}