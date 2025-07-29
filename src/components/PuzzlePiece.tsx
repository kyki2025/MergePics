/**
 * 拼图块组件
 * 单个拼图片段，支持拖拽和放置
 */

interface PuzzlePieceData {
  id: number
  correctPosition: number
  currentPosition: number
  imageUrl: string
}

interface PuzzlePieceProps {
  piece?: PuzzlePieceData
  position: number
  isCorrect: boolean
  isDragging: boolean
  backgroundPosition: string
  backgroundSize: string
  onDragStart: (pieceId: number) => void
  onDragEnd: () => void
  onDrop: (position: number) => void
}

export default function PuzzlePiece({
  piece,
  position,
  isCorrect,
  isDragging,
  backgroundPosition,
  backgroundSize,
  onDragStart,
  onDragEnd,
  onDrop
}: PuzzlePieceProps) {
  /**
   * 处理拖拽开始
   */
  const handleDragStart = (e: React.DragEvent) => {
    if (piece) {
      onDragStart(piece.id)
      e.dataTransfer.effectAllowed = 'move'
    }
  }

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = () => {
    onDragEnd()
  }

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  /**
   * 处理放置
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop(position)
  }

  return (
    <div
      className={`
        aspect-square rounded-lg overflow-hidden cursor-move transition-all duration-200 border-2
        ${piece ? 'bg-cover bg-center' : 'bg-white/10 border-dashed border-white/30'}
        ${isCorrect 
          ? 'border-green-400 ring-2 ring-green-400/30' 
          : piece 
            ? 'border-white/40 hover:border-white/60' 
            : 'border-white/20'
        }
        ${isDragging ? 'opacity-50 scale-95 shadow-lg' : 'hover:scale-105'}
      `}
      draggable={!!piece}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={piece ? {
        backgroundImage: `url(${piece.imageUrl})`,
        backgroundPosition,
        backgroundSize
      } : undefined}
    >
      {!piece && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-dashed border-white/30 rounded-full" />
        </div>
      )}
      
      {isCorrect && (
        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-sm">✓</span>
          </div>
        </div>
      )}
    </div>
  )
}