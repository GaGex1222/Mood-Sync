import { LogInButtonProps } from '@/src/interfaces/props.interfaces'
import React from 'react'
import { LogOut, AudioWaveform } from 'lucide-react'
import { signIn, signOut } from 'next-auth/react'

const LogInButton: React.FC<LogInButtonProps> = ({session}) => {
  return (
    session ? (
        <button onClick={() => signOut()} className='mt-11 ml-11 flex p-3 px-4 duration-300 py-2 bg-white text-red-600 justify-center items-center font-semibold rounded-lg shadow-md hover:shadow-lg transition active:translate-y-0 hover:-translate-y-1 hover:bg-gray-200'>Log Out<span><LogOut className='w-5 ml-2 h-5'/></span></button>
    ) : (
        <button onClick={() => signIn('spotify')} className='justify-center items-center flex mt-11 ml-11 p-3 px-4 duration-300 py-2 bg-white text-[#00B786] font-semibold rounded-lg shadow-md hover:shadow-lg transition active:translate-y-0 hover:-translate-y-1 hover:bg-gray-200'>Log In<span><AudioWaveform className='w-5 ml-2 h-5'/></span></button>
    )
  )
}

export default LogInButton
