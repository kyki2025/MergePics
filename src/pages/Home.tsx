/**
 * 智能图片拼贴工具主页面
 * 支持多图上传、智能布局推荐、创意模板、滤镜效果、配置预设
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import ImageUploader from '../components/ImageUploader'
import TemplateSelector from '../components/TemplateSelector'
import SizeSelector from '../components/SizeSelector'
import FilterSelector from '../components/FilterSelector'
import PresetManager, { ConfigPreset } from '../components/PresetManager'
import PhotoCollage from '../components/PhotoCollage'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Download, Image, Settings } from 'lucide-react'

export interface CollageTemplate {
  id: string
  name: string
  rows: number
  cols: number
  description: string
  style?: string
}

export default function Home() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<CollageTemplate>({
    id: '1x1',
    name: '单图展示',
    rows: 1,
    cols: 1,
    description: '完整展示单张图片',
    style: 'grid'
  })
  const [aspectRatio, setAspectRatio] = useState<string>('1:1')
  const [resolution, setResolution] = useState<number>(1080)
  const [selectedFilter, setSelectedFilter] = useState<string>('none')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /**
   * 当图片数量变化时，智能推荐最佳模板
   */
  useEffect(() => {
    if (uploadedImages.length > 0) {
      // 获取当前图片数量的推荐模板
      const getRecommendedTemplate = (count: number) => {
        const templates = {
          1: { id: '1x1', name: '单图展示', rows: 1, cols: 1, description: '完整展示单张图片', style: 'grid' },
          2: { id: '2x1', name: '横向双图', rows: 1, cols: 2, description: '水平并排，适合对比展示', style: 'grid' },
          3: { id: '3x1', name: '横向三图', rows: 1, cols: 3, description: '一行展示，简洁清晰', style: 'grid' },
          4: { id: '2x2', name: '经典四宫格', rows: 2, cols: 2, description: '最经典的四图布局', style: 'grid' },
          6: { id: '3x2', name: '3×2网格', rows: 2, cols: 3, description: '经典六图布局', style: 'grid' },
          9: { id: '3x3', name: '九宫格', rows: 3, cols: 3, description: 'Instagram经典九宫格', style: 'grid' }
        }
        
        // 如果有精确匹配，使用精确匹配
        if (templates[count as keyof typeof templates]) {
          return templates[count as keyof typeof templates]
        }
        
        // 否则找到能容纳所有图片的最小模板
        const sortedTemplates = Object.entries(templates).sort(([a], [b]) => Number(a) - Number(b))
        for (const [templateCount, template] of sortedTemplates) {
          if (Number(templateCount) >= count) {
            return template
          }
        }
        
        // 如果图片超过9张，使用九宫格
        return templates[9]
      }
      
      const recommendedTemplate = getRecommendedTemplate(uploadedImages.length)
      const currentSlots = selectedTemplate.rows * selectedTemplate.cols
      
      // 如果当前模板无法容纳所有图片，自动切换到推荐模板
      if (uploadedImages.length > currentSlots) {
        setSelectedTemplate(recommendedTemplate)
      }
    }
  }, [uploadedImages.length, selectedTemplate])

  /**
   * 处理图片顺序变化
   */
  const handleImageOrderChange = useCallback((newOrder: string[]) => {
    setUploadedImages(newOrder)
  }, [])

  /**
   * 加载预设配置
   */
  const handleLoadPreset = useCallback((preset: ConfigPreset) => {
    setSelectedTemplate(preset.template)
    setAspectRatio(preset.aspectRatio)
    setResolution(preset.resolution)
    setSelectedFilter(preset.filter)
  }, [])

  /**
   * 下载拼接后的图片
   */
  const handleDownload = () => {
    const canvas = canvasRef.current
    if (canvas && uploadedImages.length > 0) {
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().slice(0, 10)
      const filterSuffix = selectedFilter !== 'none' ? `-${selectedFilter}` : ''
      link.download = `photo-collage-${selectedTemplate.name}-${aspectRatio.replace(':', 'x')}-${timestamp}${filterSuffix}.png`
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    }
  }

  const totalSlots = selectedTemplate.rows * selectedTemplate.cols
  const hasEnoughImages = uploadedImages.length >= totalSlots

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-6">
        {/* 页面标题 */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">🎨 智能拼图工具</h1>
          <p className="text-white/80 text-sm">上传图片，智能推荐布局，创意模板，滤镜美化，一键生成多平台适配的拼贴作品</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {/* 左侧：图片上传 */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Image className="w-4 h-4" />
                  图片上传
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ImageUploader 
                  onImagesUpload={setUploadedImages}
                  uploadedImages={uploadedImages}
                />
                <div className="mt-3 p-2 bg-white/10 rounded-lg">
                  <p className="text-white/80 text-xs text-center">
                    📊 已上传: <span className="font-bold text-white">{uploadedImages.length}</span> 张图片
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 中间：设置面板 */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Settings className="w-4 h-4" />
                  创意设置
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs defaultValue="template" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-white/10 h-8">
                    <TabsTrigger value="template" className="text-xs h-6">布局</TabsTrigger>
                    <TabsTrigger value="size" className="text-xs h-6">尺寸</TabsTrigger>
                    <TabsTrigger value="filter" className="text-xs h-6">滤镜</TabsTrigger>
                    <TabsTrigger value="preset" className="text-xs h-6">预设</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="template" className="mt-3">
                    <TemplateSelector 
                      onTemplateSelect={setSelectedTemplate}
                      selectedTemplate={selectedTemplate}
                      imageCount={uploadedImages.length}
                    />
                  </TabsContent>
                  
                  <TabsContent value="size" className="mt-3">
                    <SizeSelector 
                      aspectRatio={aspectRatio}
                      resolution={resolution}
                      onAspectRatioChange={setAspectRatio}
                      onResolutionChange={setResolution}
                    />
                  </TabsContent>
                  
                  <TabsContent value="filter" className="mt-3">
                    <FilterSelector
                      selectedFilter={selectedFilter}
                      onFilterChange={setSelectedFilter}
                    />
                  </TabsContent>
                  
                  <TabsContent value="preset" className="mt-3">
                    <PresetManager
                      currentConfig={{
                        template: selectedTemplate,
                        aspectRatio,
                        resolution,
                        filter: selectedFilter
                      }}
                      onLoadPreset={handleLoadPreset}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* 下载按钮 */}
            <Button 
              onClick={handleDownload}
              disabled={!hasEnoughImages}
              className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4 mr-2" />
              {hasEnoughImages ? '下载拼贴作品' : '等待图片上传'}
            </Button>
            
            <div className="text-center">
              {!hasEnoughImages && uploadedImages.length > 0 && (
                <p className="text-yellow-200 text-sm">
                  还需要 {totalSlots - uploadedImages.length} 张图片才能完成拼贴
                </p>
              )}
              
              {selectedFilter !== 'none' && (
                <div className="mt-2 p-2 bg-purple-500/20 rounded-lg">
                  <p className="text-purple-200 text-sm">
                    ✨ 已应用 <span className="font-bold">{selectedFilter}</span> 滤镜
                  </p>
                </div>
              )}
              
              {/* 当前配置状态显示 */}
              <div className="mt-2 p-2 bg-white/10 rounded-lg">
                <p className="text-white/70 text-xs text-center">
                  当前: {selectedTemplate.name} | {aspectRatio} | {resolution}p | {selectedFilter}
                </p>
              </div>
            </div>
          </div>

          {/* 右侧：实时预览 */}
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-sm bg-white/10 border-white/20 h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-center text-base">🖼️ 实时预览</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3">
                <PhotoCollage
                  ref={canvasRef}
                  images={uploadedImages}
                  template={selectedTemplate}
                  aspectRatio={aspectRatio}
                  resolution={resolution}
                  filter={selectedFilter}
                  onImageOrderChange={handleImageOrderChange}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部使用说明 - 简化 */}
        <div className="mt-8 text-center">
          <div className="max-w-4xl mx-auto grid md:grid-cols-6 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xl mb-1">📤</div>
              <h3 className="text-white font-medium text-sm mb-1">批量上传</h3>
              <p className="text-white/60 text-xs">多选拖拽，快速上传</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xl mb-1">🤖</div>
              <h3 className="text-white font-medium text-sm mb-1">智能推荐</h3>
              <p className="text-white/60 text-xs">AI推荐最佳布局</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xl mb-1">🎨</div>
              <h3 className="text-white font-medium text-sm mb-1">创意模板</h3>
              <p className="text-white/60 text-xs">拍立得、杂志风格</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xl mb-1">✨</div>
              <h3 className="text-white font-medium text-sm mb-1">滤镜美化</h3>
              <p className="text-white/60 text-xs">8种专业滤镜</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xl mb-1">🖱️</div>
              <h3 className="text-white font-medium text-sm mb-1">精细调整</h3>
              <p className="text-white/60 text-xs">位置缩放控制</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-xl mb-1">💾</div>
              <h3 className="text-white font-medium text-sm mb-1">一键导出</h3>
              <p className="text-white/60 text-xs">高质量PNG下载</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}