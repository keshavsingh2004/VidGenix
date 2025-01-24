import React, { useState, useEffect } from 'react'
import { motion } from "framer-motion"

const AnimatedLoadingWait = () => {
    const [foodIndex, setFoodIndex] = useState(0)

    const foodItems = ["🎥", "🎬", "🖥️", "🎶", "🎙️", "🖼️","🚀","📸","🖌️","🎧","🎨"]

    useEffect(() => {
        const interval = setInterval(() => {
            setFoodIndex((prevIndex) => (prevIndex + 1) % foodItems.length)
        }, 2000)

        return () => clearInterval(interval)
    }, [foodItems.length])

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px] md:min-h-[300px] p-4 sm:p-8 md:p-12 overflow-hidden">
            {/* Background soft gradient */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-b from-blue-900 rounded-lg md:rounded-xl"
            />

            {/* Food Emoji */}
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl filter drop-shadow-sm z-10 mb-4 sm:mb-6 md:mb-8 text-white"
            >
                {foodItems[foodIndex]}
            </motion.div>

            {/* Loading Text and Progress */}
            <motion.div className="flex flex-col items-center gap-2 sm:gap-3">
                <motion.p
                    animate={{
                        opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="text-lg sm:text-xl md:text-2xl font-semibold text-white tracking-wide text-center px-4"
                >
                    Creating a cinematic masterpiece...
                </motion.p>

                {/*  Progress Bar */}
                <motion.div className="relative w-36 sm:w-40 md:w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        className="absolute inset-0 bg-blue-500 rounded-full"
                        animate={{
                            x: ["-100%", "100%"]
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </motion.div>
            </motion.div>
        </div>
    )
}

export default AnimatedLoadingWait
