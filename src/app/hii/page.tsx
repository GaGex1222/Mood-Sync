'use client'
import React, { useState } from 'react'

const page = () => {
    const [count, setCount] = useState(0);
    const handleClick = () => {
        setCount(count + 1)
    }
  return (
    <div>
    <button onClick={handleClick}>Click</button>
      <h1>{count}</h1>
    </div>
  )
}

export default page
