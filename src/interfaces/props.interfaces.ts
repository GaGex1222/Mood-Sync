import { Session } from "next-auth"
import { SongsData } from "./data.interfaces"

export interface CameraStreamProps {
    cameraActivated: boolean,
    setEmotion: (emotion: string) => void
    songCount: number
    setSongs: (songs: SongsData) => void
}

export interface ButtonProps {
    setCameraActivated: (prev: boolean) => void
    cameraActivated: boolean
    session: Session | null
    playlistUrl: string | null
    handleMoodRetry: () => void
}

export interface SongCountSliderProps {
    setSongCount: (count: number) => void
    songCount: number
}

export interface CreatePlaylistButtonProps {
    onClick: () => void
    text: string 
}

export interface LogInButtonProps {
    session: Session | null
}
