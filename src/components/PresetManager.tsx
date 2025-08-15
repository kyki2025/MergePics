/**
 * 配置预设管理组件
 * 支持保存和加载常用配置
 */

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Save, Download, Trash2, Star, Check } from 'lucide-react'
import { CollageTemplate } from '../pages/Home'

interface ConfigPreset {
  id: string
  name: string
  template: CollageTemplate
  aspectRatio: string
  resolution: number
  filter: string
  createdAt: string
}

interface PresetManagerProps {
  currentConfig: {
    template: CollageTemplate
    aspectRatio: string
    resolution: number
    filter: string
  }
  onLoadPreset: (preset: ConfigPreset) => void
}

export default function PresetManager({ currentConfig, onLoadPreset }: PresetManagerProps) {
  const [presets, setPresets] = useState<ConfigPreset[]>(() => {
    const saved = localStorage.getItem('collage-presets')
    return saved ? JSON.parse(saved) : []
  })
  const [presetName, setPresetName] = useState('')
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null)
  const [successPresetId, setSuccessPresetId] = useState<string | null>(null)

  /**
   * 保存当前配置为预设
   */
  const savePreset = () => {
    if (!presetName.trim()) return

    const newPreset: ConfigPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      template: { ...currentConfig.template },
      aspectRatio: currentConfig.aspectRatio,
      resolution: currentConfig.resolution,
      filter: currentConfig.filter,
      createdAt: new Date().toISOString()
    }

    const updatedPresets = [...presets, newPreset]
    setPresets(updatedPresets)
    localStorage.setItem('collage-presets', JSON.stringify(updatedPresets))
    
    setPresetName('')
    setShowSaveForm(false)
    
    // 显示保存成功
    setSuccessPresetId(newPreset.id)
    setTimeout(() => setSuccessPresetId(null), 2000)
  }

  /**
   * 删除预设
   */
  const deletePreset = (id: string) => {
    const updatedPresets = presets.filter(p => p.id !== id)
    setPresets(updatedPresets)
    localStorage.setItem('collage-presets', JSON.stringify(updatedPresets))
  }

  /**
   * 加载预设
   */
  const loadPreset = (preset: ConfigPreset) => {
    console.log('🚀 开始加载预设:', preset.name)
    setLoadingPresetId(preset.id)
    
    // 立即调用父组件的加载函数
    onLoadPreset(preset)
    
    // 显示加载状态
    setTimeout(() => {
      setLoadingPresetId(null)
      setSuccessPresetId(preset.id)
      console.log('✅ 预设加载成功:', preset.name)
      
      // 2秒后清除成功状态
      setTimeout(() => setSuccessPresetId(null), 2000)
    }, 200)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium flex items-center gap-2">
          ⚙️ 配置预设
        </h4>
        <Button
          onClick={() => setShowSaveForm(!showSaveForm)}
          size="sm"
          className="bg-green-500/20 border-green-400/30 text-green-200 hover:bg-green-500/30"
          variant="outline"
        >
          <Save className="w-4 h-4 mr-1" />
          保存
        </Button>
      </div>

      {/* 保存表单 */}
      {showSaveForm && (
        <div className="p-3 bg-white/10 rounded-lg space-y-3">
          <Input
            placeholder="输入预设名称..."
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && presetName.trim() && savePreset()}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            autoFocus
          />
          <div className="text-white/60 text-xs">
            当前配置: {currentConfig.template.name} | {currentConfig.aspectRatio} | {currentConfig.resolution}p | {currentConfig.filter}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={savePreset}
              disabled={!presetName.trim()}
              size="sm"
              className="bg-green-500 hover:bg-green-600 text-white flex-1"
            >
              确认保存
            </Button>
            <Button
              onClick={() => {
                setShowSaveForm(false)
                setPresetName('')
              }}
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
            >
              取消
            </Button>
          </div>
        </div>
      )}

      {/* 预设列表 */}
      {presets.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {presets.map((preset) => {
            const isLoading = loadingPresetId === preset.id
            const isSuccess = successPresetId === preset.id
            
            return (
              <div
                key={preset.id}
                className={`
                  p-3 border rounded-lg transition-all duration-300
                  ${isSuccess
                    ? 'bg-blue-500/10 border-blue-400/30'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isSuccess ? (
                        <Check className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Star className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className={`font-medium ${
                        isSuccess ? 'text-blue-200' : 'text-white'
                      }`}>
                        {preset.name}
                      </span>
                      {isSuccess && (
                        <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                          已应用
                        </span>
                      )}
                    </div>
                    <div className="text-white/60 text-xs">
                      {preset.template.name} · {preset.aspectRatio} · {preset.resolution}p · {preset.filter}
                    </div>
                    <div className="text-white/40 text-xs mt-1">
                      {new Date(preset.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      onClick={() => {
                        console.log('🎯 点击应用预设:', preset.name)
                        loadPreset(preset)
                      }}
                      disabled={isLoading}
                      size="sm"
                      className={`
                        transition-all duration-300
                        ${isSuccess
                          ? 'bg-blue-500/20 border-blue-400/30 text-blue-200'
                          : 'bg-blue-500/20 border-blue-400/30 text-blue-200 hover:bg-blue-500/30'
                        }
                        ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
                      `}
                      variant="outline"
                    >
                      {isLoading ? (
                        <div className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                      ) : isSuccess ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                    </Button>
                    <Button
                      onClick={() => deletePreset(preset.id)}
                      size="sm"
                      variant="outline"
                      className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-6 text-white/60">
          <Save className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无保存的预设</p>
          <p className="text-xs mt-1">保存常用配置，快速复用</p>
        </div>
      )}
    </div>
  )
}

export { type ConfigPreset }
