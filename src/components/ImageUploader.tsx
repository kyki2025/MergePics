/**
 * 多图上传组件
 * 支持拖拽上传、批量选择和图片管理
 */

import { useCallback, useState, useEffect } from 'react'
import { Upload, X, Plus, ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from './ui/button'

interface ImageUploaderProps {
  onImagesUpload: (images: string[]) => void
  uploadedImages: string[]
}

export default function ImageUploader({ onImagesUpload, uploadedImages }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState(0)

  // 监听图片数量变化，显示新增提示
  useEffect(() => {
    if (recentlyAdded > 0) {
      const timer = setTimeout(() => {
        setRecentlyAdded(0)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [recentlyAdded])

  /**
   * 处理多个文件上传
   */
  const handleFiles = useCallback((files: FileList) => {
    const newImages: string[] = []
    const fileArray = Array.from(files)
    
    let loadedCount = 0
    fileArray.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string
          newImages.push(imageUrl)
          loadedCount++
          
          if (loadedCount === fileArray.length) {
            onImagesUpload([...uploadedImages, ...newImages])
            setRecentlyAdded(newImages.length)
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }, [uploadedImages, onImagesUpload])

  /**
   * 处理拖拽事件
   */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files) {
      handleFiles(files)
    }
  }, [handleFiles])

  /**
   * 处理文件选择
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFiles(files)
    }
    e.target.value = ''
  }, [handleFiles])

  /**
   * 删除单张图片
   */
  const handleRemoveImage = useCallback((index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index)
    onImagesUpload(newImages)
  }, [uploadedImages, onImagesUpload])

  /**
   * 清空所有图片
   */
  const handleClearAll = useCallback(() => {
    onImagesUpload([])
    setRecentlyAdded(0)
  }, [onImagesUpload])

  return (
    <div className="space-y-4">
      {/* 新增图片提示 */}
      {recentlyAdded > 0 && (
        <div className="p-2 bg-green-500/20 border border-green-400/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-green-300" />
            <p className="text-green-200 text-sm">
              ✅ 新增 {recentlyAdded} 张图片，模板已自动调整
            </p>
          </div>
        </div>
      )}

      {/* 上传区域 */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${dragActive 
            ? 'border-white bg-white/20' 
            : 'border-white/40 hover:border-white/60 hover:bg-white/10'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Upload className="w-10 h-10 text-white/60" />
            <Plus className="w-4 h-4 text-white/80 absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5" />
          </div>
          <div>
            <p className="text-white/80 mb-1">拖拽图片到这里，或点击选择</p>
            <p className="text-white/60 text-sm">支持多选 · JPG、PNG、GIF 格式</p>
            {uploadedImages.length > 0 && (
              <p className="text-blue-200 text-xs mt-1">💡 可以追加更多图片</p>
            )}
          </div>
        </div>
      </div>

      {/* 图片展示区域 */}
      {uploadedImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-white/80" />
              <span className="text-white/80 text-sm font-medium">
                {uploadedImages.length} 张图片
              </span>
              {recentlyAdded > 0 && (
                <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full">
                  +{recentlyAdded} 新增
                </span>
              )}
            </div>
            <Button
              onClick={handleClearAll}
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white/80 hover:bg-white/20 text-xs"
            >
              清空全部
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className={`
                  relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-200 hover:scale-105
                  ${index >= uploadedImages.length - recentlyAdded ? 'ring-2 ring-green-400/50' : ''}
                `}
              >
                <img 
                  src={image} 
                  alt={`图片 ${index + 1}`}
                  className="w-full h-20 object-cover"
                />
                
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* 序号标识 */}
                <div className="absolute top-1 left-1">
                  <div className={`
                    w-5 h-5 rounded-full flex items-center justify-center
                    ${index >= uploadedImages.length - recentlyAdded 
                      ? 'bg-green-500' 
                      : 'bg-blue-500'
                    }
                  `}>
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                </div>
                
                {/* 新增标识 */}
                {index >= uploadedImages.length - recentlyAdded && (
                  <div className="absolute top-1 right-6">
                    <div className="bg-green-500 text-white text-xs px-1 rounded">
                      新
                    </div>
                  </div>
                )}
                
                {/* 删除按钮 */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveImage(index)
                  }}
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                ><X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          
          <p className="text-white/60 text-xs text-center">
            图片将按上传顺序排列到模板中
          </p>
        </div>
      )}
    </div>
  )
}
