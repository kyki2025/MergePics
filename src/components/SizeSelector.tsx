/**
 * 平台尺寸选择组件
 * 支持不同社交平台的输出比例
 */

interface SizeSelectorProps {
  aspectRatio: string
  resolution: number
  onAspectRatioChange: (ratio: string) => void
  onResolutionChange: (resolution: number) => void
}

interface AspectRatioOption {
  id: string
  name: string
  ratio: string
  description: string
  platform: string
  color: string
}

interface ResolutionOption {
  value: number
  label: string
  description: string
}

const aspectRatioOptions: AspectRatioOption[] = [
  {
    id: '1:1',
    name: '正方形',
    ratio: '1:1',
    description: 'Instagram 帖子、微信朋友圈',
    platform: '📷 社交通用',
    color: 'bg-pink-500/20 text-pink-200'
  },
  {
    id: '3:4',
    name: '竖屏',
    ratio: '3:4',
    description: '小红书、Pinterest',
    platform: '📱 竖屏平台',
    color: 'bg-red-500/20 text-red-200'
  },
  {
    id: '4:3',
    name: '横屏',
    ratio: '4:3',
    description: '传统相机比例、PPT展示',
    platform: '💻 横屏展示',
    color: 'bg-blue-500/20 text-blue-200'
  },
  {
    id: '9:16',
    name: '手机竖屏',
    ratio: '9:16',
    description: 'TikTok、抖音、Instagram Story',
    platform: '📱 短视频',
    color: 'bg-purple-500/20 text-purple-200'
  },
  {
    id: '16:9',
    name: '宽屏',
    ratio: '16:9',
    description: 'YouTube封面、网页横幅',
    platform: '🖥️ 宽屏内容',
    color: 'bg-green-500/20 text-green-200'
  },
  {
    id: '2:3',
    name: '海报',
    ratio: '2:3',
    description: '电影海报、印刷品',
    platform: '🎬 海报设计',
    color: 'bg-yellow-500/20 text-yellow-200'
  }
]

const resolutionOptions: ResolutionOption[] = [
  { value: 720, label: '720p', description: '快速分享，文件小' },
  { value: 1080, label: '1080p', description: '高清质量，推荐' },
  { value: 1440, label: '2K', description: '超清质量，适合打印' },
  { value: 2048, label: '4K', description: '最高质量，专业用途' }
]

/**
 * 计算实际输出尺寸
 */
const calculateSize = (aspectRatio: string, resolution: number) => {
  const [w, h] = aspectRatio.split(':').map(Number)
  
  if (w >= h) {
    // 横向或正方形，以宽度为准
    const width = resolution
    const height = Math.round((resolution * h) / w)
    return { width, height }
  } else {
    // 竖向，以高度为准
    const height = resolution
    const width = Math.round((resolution * w) / h)
    return { width, height }
  }
}

export default function SizeSelector({ 
  aspectRatio, 
  resolution, 
  onAspectRatioChange, 
  onResolutionChange 
}: SizeSelectorProps) {
  const currentSize = calculateSize(aspectRatio, resolution)
  
  return (
    <div className="space-y-6">
      {/* 比例选择 */}
      <div className="space-y-3">
        <h4 className="text-white font-medium flex items-center gap-2">
          📐 输出比例
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {aspectRatioOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => onAspectRatioChange(option.ratio)}
              className={`
                p-3 rounded-lg cursor-pointer transition-all duration-200 border
                ${aspectRatio === option.ratio
                  ? 'bg-white/20 border-white/40 ring-2 ring-white/30'
                  : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                }
              `}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{option.name}</span>
                    <span className="text-white/60 text-sm">({option.ratio})</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${option.color}`}>
                      {option.platform}
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">{option.description}</p>
                </div>
                
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${aspectRatio === option.ratio 
                    ? 'border-white bg-white' 
                    : 'border-white/40'
                  }
                `}>
                  {aspectRatio === option.ratio && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 分辨率选择 */}
      <div className="space-y-3">
        <h4 className="text-white font-medium flex items-center gap-2">
          🎯 输出质量
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {resolutionOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => onResolutionChange(option.value)}
              className={`
                p-3 rounded-lg cursor-pointer transition-all duration-200 border text-center
                ${resolution === option.value
                  ? 'bg-white/20 border-white/40 ring-2 ring-white/30'
                  : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
                }
              `}
            >
              <div className="text-white font-bold text-lg">{option.label}</div>
              <div className="text-white/60 text-xs mt-1">{option.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 输出信息显示 */}
      <div className="p-4 bg-white/10 rounded-lg">
        <div className="text-center">
          <div className="text-white font-bold text-lg mb-1">
            {currentSize.width} × {currentSize.height}
          </div>
          <div className="text-white/60 text-sm">
            比例: {aspectRatio} | 质量: {resolutionOptions.find(r => r.value === resolution)?.label}
          </div>
          <div className="text-white/40 text-xs mt-2">
            💾 预估文件大小: {Math.round((currentSize.width * currentSize.height) / 100000)}MB
          </div>
        </div>
      </div>
    </div>
  )
}