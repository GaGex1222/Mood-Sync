import React from 'react'
import { Ban, Smile } from 'lucide-react'
import { ButtonProps } from '@/src/interfaces/props.interfaces'
import { handleErrorToast } from '@/src/toastFunctions'

export const MoodButton: React.FC<ButtonProps> = ({setCameraActivated, cameraActivated, session}) => {
  const handleClick = () => {
    if(session){
      setCameraActivated(!cameraActivated)
    } else {
      handleErrorToast("You have to be logged in!")
      return
    }
  }
  return (
    <button onClick={handleClick} className="flex justify-center p-3 mt-10 px-4 duration-300 py-2 bg-white text-[#00B786] font-semibold rounded-lg shadow-md hover:shadow-lg transition active:translate-y-0 hover:-translate-y-1 hover:bg-gray-200">{!cameraActivated ? <>Check my mood<span><Smile className="w-5 ml-2 "/></span></> : <>Stop checking my mood<span><Ban className="w-5 ml-2 h-5"/></span></>}</button>
  )
}
