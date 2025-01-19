import { SongCountSliderProps } from "@/src/interfaces/props.interfaces";
import React, { useState } from "react";

export const SongCountSlider: React.FC<SongCountSliderProps> = ({setSongCount, songCount}) => {

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setSongCount(value)
  };

  return (
    <div className="flex flex-col items-center mt-3">
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Song Count {songCount}</label>
      <input onChange={handleSliderChange} id="default-range" max={50} type="range" value={songCount} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"/>
    </div>
  );
}