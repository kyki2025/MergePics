/**
 * 图片滤镜选择组件
 * 提供多种创意滤镜效果
 */

interface FilterSelectorProps {
  selectedFilter: string
  onFilterChange: (filter: string) => void
}

interface FilterOption {
  id: string
  name: string
  description: string
  cssFilter: string
  icon: string
}

const filterOptions: FilterOption[] = [
  {
    id: 'none',
    name: '原图',
    description: '保持原始色彩',
    cssFilter: 'none',
    icon: '🖼️'
  },
  {
    id: 'vintage',
    name: '复古',
    description: '温暖怀旧感',
    cssFilter: 'sepia(0.5) contrast(1.2) brightness(1.1)',
    icon: '📸'
  },
  {
    id: 'blackwhite',
    name: '黑白',
    description: '经典黑白效果',
    cssFilter: 'grayscale(1) contrast(1.1)',
    icon: '⚫'
  },
  {
    id: 'warm',
    name: '暖色调',
    description: '温暖舒适感',
    cssFilter: 'hue-rotate(10deg) saturate(1.2) brightness(1.1)',
    icon: '🌅'
  },
  {
    id: 'cool',
    name: '冷色调',
    description: '清新冷静感',
    cssFilter: 'hue-rotate(-10deg) saturate(1.1) brightness(0.95)',
    icon: '❄️'
  },
  {
    id: 'dramatic',
    name: '戏剧化',
    description: '高对比度效果',
    cssFilter: 'contrast(1.5) saturate(1.3) brightness(0.9)',
    icon: '🎭'
  },
  {
    id: 'soft',
    name: '柔和',
    description: '梦幻柔美效果',
    cssFilter: 'brightness(1.1) saturate(0.8) blur(0.5px)',
    icon: '🌸'
  },
  {
    id: 'vivid',
    name: '鲜艳',
    description: '高饱和度效果',
    cssFilter: 'saturate(1.5) contrast(1.2)',
    icon: '🌈'
  }
]

export default function FilterSelector({ selectedFilter, onFilterChange }: FilterSelectorProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-white font-medium flex items-center gap-2">
        ✨ 图片滤镜
      </h4>
      
      <div className="grid grid-cols-2 gap-2">
        {filterOptions.map((filter) => (
          <div
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              p-3 rounded-lg cursor-pointer transition-all duration-200 border text-center
              ${selectedFilter === filter.id
                ? 'bg-white/20 border-white/40 ring-2 ring-white/30'
                : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
              }
            `}
          >
            <div className="text-2xl mb-1">{filter.icon}</div>
            <div className="text-white font-medium text-sm">{filter.name}</div>
            <div className="text-white/60 text-xs mt-1">{filter.description}</div>
          </div>
        ))}
      </div>
      
      <div className="p-3 bg-white/10 rounded-lg">
        <p className="text-white/80 text-sm text-center">
          当前滤镜: <span className="font-bold text-white">
            {filterOptions.find(f => f.id === selectedFilter)?.name}
          </span>
        </p>
      </div>
    </div>
  )
}

export { filterOptions }
export type { FilterOption }
