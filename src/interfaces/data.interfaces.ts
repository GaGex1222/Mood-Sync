export interface SongsData {
    [song_name: string]: {image: string} 
}


export interface EmotionChangeData {
    emotion: string,
    songs: SongsData
}