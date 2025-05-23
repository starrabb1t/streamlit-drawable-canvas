import { useCallback } from "react"
import { fabric } from "fabric"

const ZOOM_FACTOR = 1.2
const MAX_Z     = 10
const MIN_Z     = 1

export default function useZoom(canvasRef, { width, height }) {
  const zoomIn = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const center = new fabric.Point(width/2, height/2)
    const z = canvas.getZoom() || 1
    canvas.zoomToPoint(center, Math.min(z * ZOOM_FACTOR, MAX_Z))
    canvas.requestRenderAll()
  }, [width, height])

  const zoomOut = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const center = new fabric.Point(width/2, height/2)
    const z = canvas.getZoom() || 1
    canvas.zoomToPoint(center, Math.max(z / ZOOM_FACTOR, MIN_Z))
    canvas.requestRenderAll()
  }, [width, height])

  const zoomReset = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Сброс панинга и зума
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])
    canvas.requestRenderAll()
  }, [])

  return { zoomIn, zoomReset, zoomOut }
}