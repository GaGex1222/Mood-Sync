import React from 'react'
import { Ban, Smile } from 'lucide-react'
import { ButtonProps } from '@/src/interfaces/props.interfaces'

export const MoodButton: React.FC<ButtonProps> = ({setCameraActivated, cameraActivated}) => {
  return (
    <button onClick={() => setCameraActivated(!cameraActivated)} className="rounded-md flex justify-center hover:shadow-md bg-[#00B786] transition-all hover:-translate-y-1 hover:bg-[#00956A] active:translate-y-1 duration-300 p-3 mt-10">{!cameraActivated ? <>Check my mood<span><Smile className="w-5 ml-2 "/></span></> : <>Stop checking my mood<span><Ban className="w-5 ml-2 h-5"/></span></>}</button>
  )
}
