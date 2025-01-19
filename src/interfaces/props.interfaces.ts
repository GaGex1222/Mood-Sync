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
}

export interface SongCountSliderProps {
    setSongCount: (count: number) => void
    songCount: number
}