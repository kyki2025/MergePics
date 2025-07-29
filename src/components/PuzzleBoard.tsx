/**
 * 拼图游戏面板组件
 * 负责拼图逻辑、拖拽交互和游戏状态管理
 */

import { useState, useEffect, useCallback } from 'react'
import PuzzlePiece from './PuzzlePiece'
import { Card, CardContent } from './ui/card'

interface PuzzleBoardProps {
  image: string
  size: number
  onComplete: () => void
}

interface PuzzlePieceData {
  id: number
  correctPosition: number
  currentPosition: number
  imageUrl: string
}

export default function PuzzleBoard({ image, size, onComplete }: PuzzleBoardProps) {
  const [pieces, setPieces] = useState<PuzzlePieceData[]>([])
  const [completedPieces, setCompletedPieces] = useState<Set<number>>(new Set())
  const [draggedPiece, setDraggedPiece] = useState<number | null>(null)
  const [gameCompleted, setGameCompleted] = useState(false)

  /**
   * 初始化拼图块
   */
  const initializePuzzle = useCallback(() => {
    const totalPieces = size * size
    const newPieces: PuzzlePieceData[] = []

    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        correctPosition: i,
        currentPosition: i,
        imageUrl: image
      })
    }

    // 打乱拼图块位置
    const shuffledPositions = [...Array(totalPieces).keys()]
    for (let i = shuffledPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPositions[i], shuffledPositions[j]] = [shuffledPositions[j], shuffledPositions[i]]
    }

    newPieces.forEach((piece, index) => {
      piece.currentPosition = shuffledPositions[index]
    })

    setPieces(newPieces)
    setCompletedPieces(new Set())
    setGameCompleted(false)
  }, [image, size])

  /**
   * 检查拼图是否完成
   */
  const checkCompletion = useCallback((currentPieces: PuzzlePieceData[]) => {
    const completed = new Set<number>()
    let allCorrect = true

    currentPieces.forEach((piece) => {
      if (piece.correctPosition === piece.currentPosition) {
        completed.add(piece.id)
      } else {
        allCorrect = false
      }
    })

    setCompletedPieces(completed)

    if (allCorrect && !gameCompleted) {
      setGameCompleted(true)
      setTimeout(() => {
        onComplete()
      }, 500)
    }
  }, [gameCompleted, onComplete])

  /**
   * 处理拖拽开始
   */
  const handleDragStart = (pieceId: number) => {
    setDraggedPiece(pieceId)
  }

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = () => {
    setDraggedPiece(null)
  }

  /**
   * 处理放置
   */
  const handleDrop = (targetPosition: number) => {
    if (draggedPiece === null) return

    setPieces(currentPieces => {
      const newPieces = [...currentPieces]
      const draggedIndex = newPieces.findIndex(p => p.id === draggedPiece)
      const targetIndex = newPieces.findIndex(p => p.currentPosition === targetPosition)

      if (draggedIndex !== -1 && targetIndex !== -1) {
        // 交换位置
        const temp = newPieces[draggedIndex].currentPosition
        newPieces[draggedIndex].currentPosition = newPieces[targetIndex].currentPosition
        newPieces[targetIndex].currentPosition = temp
      }

      checkCompletion(newPieces)
      return newPieces
    })
  }

  /**
   * 计算拼图块的背景位置
   */
  const getBackgroundPosition = (pieceId: number) => {
    const row = Math.floor(pieceId / size)
    const col = pieceId % size
    const percentX = (col / (size - 1)) * 100
    const percentY = (row / (size - 1)) * 100
    return `${percentX}% ${percentY}%`
  }

  /**
   * 计算拼图块的背景尺寸
   */
  const getBackgroundSize = () => {
    return `${size * 100}% ${size * 100}%`
  }

  // 初始化拼图
  useEffect(() => {
    initializePuzzle()
  }, [initializePuzzle])

  const progress = Math.round((completedPieces.size / pieces.length) * 100)

  return (
    <div className="space-y-6">
      {/* 进度显示 */}
      <Card className="backdrop-blur-sm bg-white/10 border-white/20">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">完成进度</span>
            <span className="text-white font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/60 text-sm mt-2">
            {completedPieces.size} / {pieces.length} 个拼图块已正确放置
          </p>
        </CardContent>
      </Card>

      {/* 拼图区域 */}
      <Card className="backdrop-blur-sm bg-white/10 border-white/20">
        <CardContent className="p-6">
          <div 
            className="grid gap-1 mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${size}, 1fr)`,
              maxWidth: '500px',
              aspectRatio: '1'
            }}
          >
            {Array.from({ length: size * size }).map((_, position) => {
              const piece = pieces.find(p => p.currentPosition === position)
              const isCorrect = piece && completedPieces.has(piece.id)
              
              return (
                <PuzzlePiece
                  key={position}
                  piece={piece}
                  position={position}
                  isCorrect={isCorrect || false}
                  isDragging={piece?.id === draggedPiece}
                  backgroundPosition={piece ? getBackgroundPosition(piece.id) : '0% 0%'}
                  backgroundSize={getBackgroundSize()}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                />
              )
            })}
          </div>
        </CardContent>
      </Card>

      {gameCompleted && (
        <Card className="backdrop-blur-sm bg-green-500/20 border-green-400/30">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">恭喜完成拼图！</h2>
            <p className="text-white/80">您成功完成了 {size}×{size} 的拼图挑战！</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}