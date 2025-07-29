/**
 * 智能模板选择组件
 * 根据图片数量动态推荐最佳布局方案，支持创意模板
 */

import { CollageTemplate } from '../pages/Home'

interface TemplateSelectorProps {
  onTemplateSelect: (template: CollageTemplate) => void
  selectedTemplate: CollageTemplate
  imageCount: number
}

/**
 * 根据图片数量生成推荐模板
 */
const generateTemplatesForCount = (count: number): CollageTemplate[] => {
  if (count === 0) return []
  
  const templates: CollageTemplate[] = []
  
  if (count === 1) {
    templates.push(
      {
        id: '1x1',
        name: '单图展示',
        rows: 1,
        cols: 1,
        description: '完整展示单张图片',
        style: 'grid'
      },
      {
        id: 'polaroid-1',
        name: '拍立得风格',
        rows: 1,
        cols: 1,
        description: '复古拍立得相框效果',
        style: 'polaroid'
      }
    )
  }
  
  if (count === 2) {
    templates.push(
      {
        id: '2x1',
        name: '横向双图',
        rows: 1,
        cols: 2,
        description: '水平并排，适合对比展示',
        style: 'grid'
      },
      {
        id: '1x2',
        name: '竖向双图',
        rows: 2,
        cols: 1,
        description: '垂直排列，适合故事展示',
        style: 'grid'
      },
      {
        id: 'magazine-2',
        name: '杂志双图',
        rows: 1,
        cols: 2,
        description: '时尚杂志风格排版',
        style: 'magazine'
      }
    )
  }
  
  if (count === 3) {
    templates.push(
      {
        id: '3x1',
        name: '横向三图',
        rows: 1,
        cols: 3,
        description: '一行展示，简洁清晰',
        style: 'grid'
      },
      {
        id: '1x3',
        name: '竖向三图',
        rows: 3,
        cols: 1,
        description: '垂直排列，时间线效果',
        style: 'grid'
      },
      {
        id: 'triangle-3',
        name: '三角构图',
        rows: 2,
        cols: 2,
        description: '艺术三角排列',
        style: 'creative'
      },
      {
        id: 'polaroid-3',
        name: '拍立得散落',
        rows: 2,
        cols: 2,
        description: '随意散落的拍立得效果',
        style: 'polaroid'
      }
    )
  }
  
  if (count === 4) {
    templates.push(
      {
        id: '2x2',
        name: '经典四宫格',
        rows: 2,
        cols: 2,
        description: '最经典的四图布局',
        style: 'grid'
      },
      {
        id: '4x1',
        name: '横向四图',
        rows: 1,
        cols: 4,
        description: '全景展示，适合风景',
        style: 'grid'
      },
      {
        id: 'magazine-4',
        name: '杂志四图',
        rows: 2,
        cols: 2,
        description: '时尚杂志大片风格',
        style: 'magazine'
      },
      {
        id: 'collage-4',
        name: '艺术拼贴',
        rows: 2,
        cols: 2,
        description: '不规则艺术排列',
        style: 'creative'
      }
    )
  }
  
  if (count === 6) {
    templates.push(
      {
        id: '3x2',
        name: '3×2网格',
        rows: 2,
        cols: 3,
        description: '经典六图布局',
        style: 'grid'
      },
      {
        id: '2x3',
        name: '2×3网格',
        rows: 3,
        cols: 2,
        description: '竖版六图布局',
        style: 'grid'
      },
      {
        id: 'magazine-6',
        name: '杂志六图',
        rows: 2,
        cols: 3,
        description: '时尚杂志排版风格',
        style: 'magazine'
      }
    )
  }
  
  if (count === 9) {
    templates.push(
      {
        id: '3x3',
        name: '九宫格',
        rows: 3,
        cols: 3,
        description: 'Instagram经典九宫格',
        style: 'grid'
      },
      {
        id: 'polaroid-9',
        name: '拍立得墙',
        rows: 3,
        cols: 3,
        description: '复古拍立得照片墙',
        style: 'polaroid'
      }
    )
  }
  
  return templates
}

const getStyleIcon = (style: string) => {
  switch (style) {
    case 'polaroid': return '📸'
    case 'magazine': return '📰'
    case 'creative': return '🎨'
    default: return '📋'
  }
}

const getStyleColor = (style: string) => {
  switch (style) {
    case 'polaroid': return 'bg-amber-500/20 text-amber-200'
    case 'magazine': return 'bg-purple-500/20 text-purple-200'
    case 'creative': return 'bg-pink-500/20 text-pink-200'
    default: return 'bg-blue-500/20 text-blue-200'
  }
}

export default function TemplateSelector({ onTemplateSelect, selectedTemplate, imageCount }: TemplateSelectorProps) {
  const templates = generateTemplatesForCount(imageCount)
  
  /**
   * 渲染模板预览网格
   */
  const renderTemplatePreview = (template: CollageTemplate) => {
    const cells = []
    const totalCells = template.rows * template.cols
    const filledCells = Math.min(imageCount, totalCells)
    
    for (let i = 0; i < totalCells; i++) {
      const isFilled = i < filledCells
      cells.push(
        <div
          key={i}
          className={`rounded-sm border ${
            isFilled 
              ? 'bg-blue-400/60 border-blue-300/40' 
              : 'bg-white/20 border-white/30'
          }`}
        />
      )
    }

    return (
      <div 
        className="grid gap-0.5 w-16 h-12"
        style={{ 
          gridTemplateColumns: `repeat(${template.cols}, 1fr)`,
          gridTemplateRows: `repeat(${template.rows}, 1fr)`
        }}
      >
        {cells}
      </div>
    )
  }

  if (imageCount === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-white/60 text-lg mb-2">📤</div>
        <p className="text-white/60">请先上传图片</p>
        <p className="text-white/40 text-sm">我会根据图片数量推荐最佳布局</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center p-3 bg-white/10 rounded-lg">
        <p className="text-white/80 text-sm">
          🎯 为您的 <span className="font-bold text-white">{imageCount}</span> 张图片推荐以下布局
        </p>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {templates.map((template, index) => (
          <div
            key={template.id}
            onClick={() => onTemplateSelect(template)}
            className={`
              relative p-4 rounded-lg cursor-pointer transition-all duration-200 border flex items-center gap-4
              ${selectedTemplate.id === template.id
                ? 'bg-white/20 border-white/40 ring-2 ring-white/30'
                : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
              }
            `}
          >
            {/* 推荐标签 */}
            {index === 0 && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
                推荐
              </div>
            )}
            
            {/* 模板预览 */}
            <div className="flex-shrink-0">
              {renderTemplatePreview(template)}
            </div>
            
            {/* 模板信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{getStyleIcon(template.style)}</span>
                <span className="text-white font-medium">{template.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${getStyleColor(template.style)}`}>
                  {template.style}
                </span>
              </div>
              <p className="text-white/60 text-sm">{template.description}</p>
            </div>
            
            {/* 选中指示器 */}
            <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
              ${selectedTemplate.id === template.id 
                ? 'border-white bg-white' 
                : 'border-white/40'
              }
            `}>
              {selectedTemplate.id === template.id && (
                <div className="w-2 h-2 bg-blue-600 rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
