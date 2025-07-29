import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

/**
 * 处理请求的事件监听器
 */
addEventListener('fetch', event => {
  event.respondWith(handleEvent(event))
})

/**
 * 处理请求并返回响应
 * @param {FetchEvent} event
 */
async function handleEvent(event) {
  try {
    // 尝试从KV存储获取静态资产
    return await getAssetFromKV(event)
  } catch (e) {
    // 如果资产不存在，返回404页面或默认首页
    let notFoundResponse = new Response('资源未找到', { status: 404 })
    
    // 对于SPA应用，可以重定向所有路由到index.html
    if (event.request.url.endsWith('/') || !event.request.url.includes('.')) {
      try {
        return await getAssetFromKV(event, {
          mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/index.html`, req)
        })
      } catch (e) {
        // 如果仍然失败，返回404
        return notFoundResponse
      }
    }
    
    return notFoundResponse
  }
}