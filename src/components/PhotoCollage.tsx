/**
 * 智能照片拼贴组件
 * 支持拖拽排序、独立图片变换控制和多种模板风格
 */

import { useEffect, useImperativeHandle, forwardRef, useState, useCallback } from 'react'
import { CollageTemplate } from '../pages/Home'

interface PhotoCollageProps {
  images: string[]
  template: CollageTemplate
  aspectRatio: string
  resolution: number
  filter: string
  onImageOrderChange: (newOrder: string[]) => void
}

interface ImageTransform {
  x: number
  y: number
  scale: number
}

/**
 * 计算输出尺寸
 */
const calculateOutputSize = (aspectRatio: string, resolution: number) => {
  const [w, h] = aspectRatio.split(':').map(Number)
  
  if (w >= h) {
    const width = resolution
    const height = Math.round((resolution * h) / w)
    return { width, height }
  } else {
    const height = resolution
    const width = Math.round((resolution * w) / h)
    return { width, height }
  }
}

/**
 * 获取滤镜CSS属性
 */
const getFilterCSS = (filterId: string): string => {
  const filterMap: Record<string, string> = {
    'none': 'none',
    'vintage': 'sepia(0.5) contrast(1.2) brightness(1.1)',
    'blackwhite': 'grayscale(1) contrast(1.1)',
    'warm': 'hue-rotate(10deg) saturate(1.2) brightness(1.1)',
    'cool': 'hue-rotate(-10deg) saturate(1.1) brightness(0.95)',
    'dramatic': 'contrast(1.5) saturate(1.3) brightness(0.9)',
    'soft': 'brightness(1.1) saturate(0.8) blur(0.5px)',
    'vivid': 'saturate(1.5) contrast(1.2)'
  }
  return filterMap[filterId] || 'none'
}

const PhotoCollage = forwardRef<HTMLCanvasElement, PhotoCollageProps>(
  ({ images, template, aspectRatio, resolution, filter, onImageOrderChange }, ref) => {
    const canvasRef = ref as React.RefObject<HTMLCanvasElement>
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [dropIndex, setDropIndex] = useState<number | null>(null)
    const [imageTransforms, setImageTransforms] = useState<ImageTransform[]>([])
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

    // 初始化图片变换状态 - 智能处理图片数量变化
    useEffect(() => {
      setImageTransforms(prevTransforms => {
        const newTransforms = images.map((_, index) => {
          // 如果之前有这个位置的变换状态，保留它
          if (prevTransforms[index]) {
            return prevTransforms[index]
          }
          // 新图片使用默认变换
          return { x: 0, y: 0, scale: 1 }
        })
        return newTransforms
      })
      
      // 如果选中的图片索引超出了新的图片范围，取消选择
      if (selectedImageIndex !== null && selectedImageIndex >= images.length) {
        setSelectedImageIndex(null)
      }
    }, [images.length, selectedImageIndex])

    /**
     * 加载图片
     */
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })
    }

    /**
     * 根据模板风格绘制不同效果
     */
    const drawWithStyle = (
      ctx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      x: number,
      y: number,
      width: number,
      height: number,
      style: string,
      filterId: string,
      transform: ImageTransform
    ) => {
      ctx.save()

      // 应用滤镜
      ctx.filter = getFilterCSS(filterId)

      switch (style) {
        case 'polaroid':
          // 拍立得风格：白色边框 + 阴影
          const borderSize = Math.min(width, height) * 0.1
          const photoWidth = width - borderSize * 2
          const photoHeight = height - borderSize * 2
          
          // 绘制阴影
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
          ctx.shadowBlur = 10
          ctx.shadowOffsetX = 5
          ctx.shadowOffsetY = 5
          
          // 绘制白色边框
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(x, y, width, height)
          
          // 重置阴影
          ctx.shadowColor = 'transparent'
          
          // 绘制图片
          ctx.beginPath()
          ctx.rect(x + borderSize, y + borderSize, photoWidth, photoHeight)
          ctx.clip()
          
          const polaroidScale = Math.max(photoWidth / img.width, photoHeight / img.height) * transform.scale
          const polaroidScaledWidth = img.width * polaroidScale
          const polaroidScaledHeight = img.height * polaroidScale
          const polaroidOffsetX = (photoWidth - polaroidScaledWidth) / 2 + transform.x
          const polaroidOffsetY = (photoHeight - polaroidScaledHeight) / 2 + transform.y
          
          ctx.drawImage(
            img,
            x + borderSize + polaroidOffsetX,
            y + borderSize + polaroidOffsetY,
            polaroidScaledWidth,
            polaroidScaledHeight
          )
          break

        case 'magazine':
          // 杂志风格：不规则裁剪 + 渐变遮罩
          ctx.beginPath()
          ctx.rect(x, y, width, height)
          ctx.clip()
          
          const magazineScale = Math.max(width / img.width, height / img.height) * transform.scale
          const magazineScaledWidth = img.width * magazineScale
          const magazineScaledHeight = img.height * magazineScale
          const magazineOffsetX = (width - magazineScaledWidth) / 2 + transform.x
          const magazineOffsetY = (height - magazineScaledHeight) / 2 + transform.y
          
          ctx.drawImage(
            img,
            x + magazineOffsetX,
            y + magazineOffsetY,
            magazineScaledWidth,
            magazineScaledHeight
          )
          
          // 添加渐变遮罩
          const gradient = ctx.createLinearGradient(x, y, x + width, y + height)
          gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)')
          ctx.fillStyle = gradient
          ctx.fillRect(x, y, width, height)
          break

        case 'creative':
          // 创意风格：圆角 + 特殊效果
          ctx.beginPath()
          ctx.roundRect(x, y, width, height, Math.min(width, height) * 0.1)
          ctx.clip()
          
          const creativeScale = Math.max(width / img.width, height / img.height) * transform.scale
          const creativeScaledWidth = img.width * creativeScale
          const creativeScaledHeight = img.height * creativeScale
          const creativeOffsetX = (width - creativeScaledWidth) / 2 + transform.x
          const creativeOffsetY = (height - creativeScaledHeight) / 2 + transform.y
          
          ctx.drawImage(
            img,
            x + creativeOffsetX,
            y + creativeOffsetY,
            creativeScaledWidth,
            creativeScaledHeight
          )
          break

        default:
          // 标准网格风格
          ctx.beginPath()
          ctx.roundRect(x, y, width, height, 8)
          ctx.clip()
          
          const scale = Math.max(width / img.width, height / img.height) * transform.scale
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale
          const offsetX = (width - scaledWidth) / 2 + transform.x
          const offsetY = (height - scaledHeight) / 2 + transform.y
          
          ctx.drawImage(
            img,
            x + offsetX,
            y + offsetY,
            scaledWidth,
            scaledHeight
          )
      }

      ctx.restore()
    }

    /**
     * 智能绘制拼贴图片
     */
    const drawCollage = async () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const outputSize = calculateOutputSize(aspectRatio, resolution)
      
      // 设置画布尺寸
      canvas.width = outputSize.width
      canvas.height = outputSize.height

      // 清空画布，使用渐变背景
      const gradient = ctx.createLinearGradient(0, 0, outputSize.width, outputSize.height)
      gradient.addColorStop(0, '#f8fafc')
      gradient.addColorStop(1, '#e2e8f0')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, outputSize.width, outputSize.height)

      // 计算网格尺寸和间距
      const padding = Math.min(outputSize.width, outputSize.height) * 0.02
      const gap = template.style === 'polaroid' ? padding * 2 : padding * 0.5
      
      const availableWidth = outputSize.width - (padding * 2) - (gap * (template.cols - 1))
      const availableHeight = outputSize.height - (padding * 2) - (gap * (template.rows - 1))
      
      const cellWidth = availableWidth / template.cols
      const cellHeight = availableHeight / template.rows

      const totalSlots = template.rows * template.cols

      // 加载所有图片
      const loadedImages: HTMLImageElement[] = []
      for (let i = 0; i < Math.min(images.length, totalSlots); i++) {
        try {
          const img = await loadImage(images[i])
          loadedImages.push(img)
        } catch (error) {
          console.error(`Failed to load image ${i}:`, error)
        }
      }

      // 绘制图片到网格
      for (let row = 0; row < template.rows; row++) {
        for (let col = 0; col < template.cols; col++) {
          const index = row * template.cols + col
          let x = padding + col * (cellWidth + gap)
          let y = padding + row * (cellHeight + gap)

          // 拍立得风格的随机偏移
          if (template.style === 'polaroid' && index < loadedImages.length) {
            x += (Math.random() - 0.5) * padding
            y += (Math.random() - 0.5) * padding
          }

          if (index < loadedImages.length && imageTransforms[index]) {
            const img = loadedImages[index]
            const transform = imageTransforms[index]
            drawWithStyle(ctx, img, x, y, cellWidth, cellHeight, template.style || 'grid', filter, transform)
            
            // 选中图片的高亮边框
            if (selectedImageIndex === index) {
              ctx.save()
              ctx.beginPath()
              ctx.roundRect(x, y, cellWidth, cellHeight, 8)
              ctx.strokeStyle = '#3b82f6'
              ctx.lineWidth = 4
              ctx.stroke()
              ctx.restore()
            }
          } else {
            // 空白格子 - 绘制占位符
            ctx.save()
            ctx.beginPath()
            ctx.roundRect(x, y, cellWidth, cellHeight, 8)
            ctx.fillStyle = 'rgba(148, 163, 184, 0.2)'
            ctx.fill()
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'
            ctx.lineWidth = 2
            ctx.setLineDash([10, 10])
            ctx.stroke()

            // 绘制占位符文字
            ctx.fillStyle = 'rgba(100, 116, 139, 0.6)'
            ctx.font = `${Math.min(cellWidth, cellHeight) / 8}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(
              `图片 ${index + 1}`,
              x + cellWidth / 2,
              y + cellHeight / 2
            )
            
            ctx.restore()
          }
        }
      }

      // 绘制水印
      if (loadedImages.length > 0) {
        ctx.save()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.font = `${outputSize.width / 80}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
        ctx.textAlign = 'right'
        ctx.textBaseline = 'bottom'
        ctx.fillText(
          '智能拼图工具制作',
          outputSize.width - padding,
          outputSize.height - padding / 2
        )
        ctx.restore()
      }
    }

    /**
     * 处理拖拽开始
     */
    const handleDragStart = useCallback((index: number) => {
      setDragIndex(index)
    }, [])

    /**
     * 处理拖拽结束
     */
    const handleDragEnd = useCallback(() => {
      if (dragIndex !== null && dropIndex !== null && dragIndex !== dropIndex) {
        const newImages = [...images]
        const [draggedImage] = newImages.splice(dragIndex, 1)
        newImages.splice(dropIndex, 0, draggedImage)
        onImageOrderChange(newImages)
        
        // 同时调整变换状态
        const newTransforms = [...imageTransforms]
        const [draggedTransform] = newTransforms.splice(dragIndex, 1)
        newTransforms.splice(dropIndex, 0, draggedTransform)
        setImageTransforms(newTransforms)
      }
      setDragIndex(null)
      setDropIndex(null)
    }, [dragIndex, dropIndex, images, imageTransforms, onImageOrderChange])

    /**
     * 更新图片变换
     */
    const updateImageTransform = useCallback((index: number, transform: Partial<ImageTransform>) => {
      setImageTransforms(prev => prev.map((t, i) => 
        i === index ? { ...t, ...transform } : t
      ))
    }, [])

    /**
     * 重置图片变换
     */
    const resetImageTransform = useCallback((index: number) => {
      updateImageTransform(index, { x: 0, y: 0, scale: 1 })
    }, [updateImageTransform])

    // 当依赖项改变时重新绘制
    useEffect(() => {
      drawCollage()
    }, [images, template, aspectRatio, resolution, filter, imageTransforms])

    const outputSize = calculateOutputSize(aspectRatio, resolution)
    const totalSlots = template.rows * template.cols

    return (
      <div className="flex flex-col items-center space-y-4">
        {/* 画布容器 - 调整最大尺寸 */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="max-w-full border-2 border-white/20 rounded-lg shadow-lg bg-white/5"
            style={{ 
              width: 'auto',
              height: 'auto',
              maxWidth: '300px',  // 减小最大宽度
              maxHeight: '350px'  // 减小最大高度
            }}
          />
          
          {/* 加载提示 */}
          {images.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
              <div className="text-center text-white">
                <div className="text-3xl mb-2">📸</div>
                <p className="text-base font-medium">开始上传图片</p>
                <p className="text-xs opacity-80">创造属于你的拼贴作品</p>
              </div>
            </div>
          )}
        </div>

        {/* 可拖拽的图片预览区域 */}
        {images.length > 0 && (
          <div className="w-full max-w-sm">
            <h4 className="text-white/80 text-sm mb-2 text-center">🖱️ 拖拽调整图片顺序</h4>
            <div className="grid grid-cols-4 gap-2 p-3 bg-white/10 rounded-lg">
              {images.slice(0, totalSlots).map((image, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => setDropIndex(index)}
                  onClick={() => setSelectedImageIndex(selectedImageIndex === index ? null : index)}
                  className={`
                    relative cursor-move rounded-lg overflow-hidden transition-all duration-200
                    ${dragIndex === index ? 'opacity-50 scale-95' : 'hover:scale-105'}
                    ${dropIndex === index ? 'ring-2 ring-blue-400' : ''}
                    ${selectedImageIndex === index ? 'ring-2 ring-yellow-400' : ''}
                  `}
                >
                  <img 
                    src={image} 
                    alt={`图片 ${index + 1}`}
                    className="w-full h-14 object-cover"
                    style={{ filter: getFilterCSS(filter) }}
                  />
                  <div className="absolute top-1 left-1">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 选中图片的变换控制 */}
        {selectedImageIndex !== null && imageTransforms[selectedImageIndex] && (
          <div className="w-full max-w-sm p-3 bg-white/10 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white/80 text-sm font-medium">
                📷 图片 {selectedImageIndex + 1} 调整
              </h4>
              <button
                onClick={() => resetImageTransform(selectedImageIndex)}
                className="text-xs text-white/60 hover:text-white/80 underline"
              >
                重置
              </button>
            </div>
            
            <div className="space-y-3">
              {/* 位置控制 */}
              <div>
                <label className="text-white/70 text-xs block mb-1">位置</label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={imageTransforms[selectedImageIndex].x}
                    onChange={(e) => updateImageTransform(selectedImageIndex, { x: Number(e.target.value) })}
                    className="flex-1 h-2 bg-white/20 rounded-lg"
                  />
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={imageTransforms[selectedImageIndex].y}
                    onChange={(e) => updateImageTransform(selectedImageIndex, { y: Number(e.target.value) })}
                    className="flex-1 h-2 bg-white/20 rounded-lg"
                  />
                </div>
                <div className="flex justify-between text-xs text-white/50 mt-1">
                  <span>左右</span>
                  <span>上下</span>
                </div>
              </div>
              
              {/* 缩放控制 */}
              <div>
                <label className="text-white/70 text-xs block mb-1">
                  缩放 ({Math.round(imageTransforms[selectedImageIndex].scale * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={imageTransforms[selectedImageIndex].scale}
                  onChange={(e) => updateImageTransform(selectedImageIndex, { scale: Number(e.target.value) })}
                  className="w-full h-2 bg-white/20 rounded-lg"
                />
                <div className="flex justify-between text-xs text-white/50 mt-1">
                  <span>50%</span>
                  <span>200%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 信息显示 - 简化 */}
        <div className="text-center max-w-sm">
          <div className="flex justify-center gap-3 text-xs text-white/70">
            <span>📐 {outputSize.width}×{outputSize.height}</span>
            <span>🖼️ {Math.min(images.length, totalSlots)}/{totalSlots}</span>
          </div>
          
          {selectedImageIndex !== null && (
            <p className="text-yellow-200 text-xs mt-2">
              💡 点击其他图片或空白区域取消选择
            </p>
          )}
        </div>
      </div>
    )
  }
)

PhotoCollage.displayName = 'PhotoCollage'

export default PhotoCollage