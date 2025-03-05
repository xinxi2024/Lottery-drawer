"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Trash2, Plus, Timer, List, Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Particle[] = []
    const particleCount = 150

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 10 + 5,
        color: `hsl(${Math.random() * 360}, 100%, 70%)`,
        speedY: Math.random() * 3 + 1,
        speedX: Math.random() * 2 - 1,
        spin: Math.random() * 0.2 - 0.1,
        angle: Math.random() * Math.PI * 2,
      })
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.angle)

        ctx.fillStyle = particle.color
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)

        ctx.restore()

        particle.y += particle.speedY
        particle.x += particle.speedX
        particle.angle += particle.spin

        if (particle.y > canvas.height) {
          particle.y = -particle.size
          particle.x = Math.random() * canvas.width
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      // Cleanup if needed
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

type Particle = {
  x: number
  y: number
  size: number
  color: string
  speedY: number
  speedX: number
  spin: number
  angle: number
}

export default function LotteryApp() {
  const [items, setItems] = useState<string[]>([])
  const [newItem, setNewItem] = useState("")
  const [drawingTime, setDrawingTime] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [result, setResult] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleAddItem = () => {
    if (newItem.trim() !== "") {
      setItems([...items, newItem.trim()])
      setNewItem("")
    }
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddItem()
    }
  }

  const startDrawing = () => {
    if (items.length < 2) return

    setIsDrawing(true)
    setShowResult(false)
    setResult(null)
    setShowConfetti(false)

    // Calculate how many iterations we need based on drawing time
    // We'll update every 50ms for smoother animation
    const iterations = drawingTime * 20
    let currentIteration = 0

    intervalRef.current = setInterval(() => {
      currentIteration++

      // Randomly select an index
      const randomIndex = Math.floor(Math.random() * items.length)
      setCurrentIndex(randomIndex)

      // If we've reached the end of our iterations
      if (currentIteration >= iterations) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setResult(items[randomIndex])
        setIsDrawing(false)
        setShowResult(true)
        setShowConfetti(true)

        // Hide confetti after 3 seconds
        setTimeout(() => {
          setShowConfetti(false)
        }, 3000)
      }
    }, 50)
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <Confetti />
        </div>
      )}

      <Card className="w-full max-w-2xl shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-center text-3xl font-bold">✨ 抽签器 ✨</CardTitle>
          <CardDescription className="text-center text-white/80">添加选项并开始抽签</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="flex space-x-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入选项..."
              disabled={isDrawing}
              className="border-2 focus-visible:ring-indigo-500"
            />
            <Button
              onClick={handleAddItem}
              disabled={isDrawing || newItem.trim() === ""}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-1" /> 添加
            </Button>
          </div>

          <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium flex items-center text-gray-700">
              <Timer className="h-4 w-4 mr-1" /> 抽签时间（秒）
            </div>
            <div className="flex items-center space-x-4">
              <Slider
                value={[drawingTime]}
                onValueChange={(value) => setDrawingTime(value[0])}
                min={0.5}
                max={10}
                step={0.5}
                disabled={isDrawing}
                className="text-indigo-600"
              />
              <span className="w-12 text-center font-mono bg-indigo-100 rounded-md py-1 px-2">
                {drawingTime.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center text-gray-700">
              <List className="h-4 w-4 mr-1" /> 选项列表 ({items.length})
            </div>
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed">
                请添加至少两个选项开始抽签
              </div>
            ) : (
              <div className="border-2 rounded-lg overflow-hidden">
                <div className="max-h-48 overflow-y-auto p-1">
                  <AnimatePresence>
                    {items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "flex justify-between items-center p-3 rounded-md mb-1 transition-all duration-200",
                          isDrawing && index === currentIndex ? "bg-indigo-100 scale-105" : "bg-white",
                          showResult && result === item
                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                            : "",
                        )}
                      >
                        <span className="truncate font-medium">{item}</span>
                        {!isDrawing && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-indigo-200 text-center space-y-2"
              >
                <div className="text-sm font-medium flex items-center justify-center text-indigo-700">
                  <Award className="h-5 w-5 mr-1" /> 抽签结果
                </div>
                <div className="text-2xl font-bold text-indigo-800 py-2">{result}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button
            className="w-full h-12 text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md"
            onClick={startDrawing}
            disabled={isDrawing || items.length < 2}
          >
            {isDrawing ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                抽签中...
              </span>
            ) : (
              "开始抽签"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

