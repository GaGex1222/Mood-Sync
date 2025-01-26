import React from 'react'
import { Ban, Smile, Check, RotateCcwIcon } from 'lucide-react'
import { ButtonProps } from '@/src/interfaces/props.interfaces'
import { handleErrorToast } from '@/src/toastFunctions'

export const MoodButton: React.FC<ButtonProps> = ({setCameraActivated, cameraActivated, session, playlistUrl, handleMoodRetry}) => {

  const handleMoodClick = () => {
    if(session){
      setCameraActivated(!cameraActivated)
    } else {
      handleErrorToast("You have to be logged in!")
      return
    }
  }

  return (
    playlistUrl ? (<button onClick={handleMoodRetry} className="flex justify-center p-3 mt-10 px-4 duration-300 py-2 bg-white text-[#00B786] font-semibold rounded-lg shadow-md hover:shadow-lg transition active:translate-y-0 hover:-translate-y-1 hover:bg-gray-200">Make another playlist?<span><RotateCcwIcon className="w-5 ml-2 h-5"/></span></button>) : (
      <button onClick={handleMoodClick} className="flex justify-center p-3 mt-10 px-4 duration-300 py-2 bg-white text-[#00B786] font-semibold rounded-lg shadow-md hover:shadow-lg transition active:translate-y-0 hover:-translate-y-1 hover:bg-gray-200">{!cameraActivated ? <>Check my mood<span><Check className="w-6 ml-2 "/></span></> : <>Stop checking my mood<span><Ban className="w-5 ml-2 h-5"/></span></>}</button>
    )

  )
}
