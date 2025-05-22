// src/hooks/useCanvasInit.js
import { useEffect, useRef } from "react"
import { fabric } from "fabric"

export default function useCanvasInit(mountRef, { width, height, backgroundImageURL }) {
  const canvasRef = useRef(null)

  // -- 1) Создание канвы и пэннинг: только один раз на маунте
  useEffect(() => {
    const canvas = new fabric.Canvas(mountRef.current, {
      selection: false,
      preserveObjectStacking: true,
    })
    canvasRef.current = canvas

    // Паннинг на среднюю кнопку
    const el = canvas.upperCanvasEl
    let isPanning = false, lastX = 0, lastY = 0

    const onDown = e => {
      if (e.button === 1) {
        isPanning = true
        lastX = e.clientX; lastY = e.clientY
        e.preventDefault()
      }
    }
    const onMove = e => {
      if (!isPanning) return
      const dx = e.clientX - lastX, dy = e.clientY - lastY
      canvas.relativePan({ x: dx, y: dy })
      lastX = e.clientX; lastY = e.clientY

      // Ограничитель панинга, чтобы фон не ушёл в пустоту
      const vpt = canvas.viewportTransform
      const zoom = vpt[0]
      const sw = width * zoom, sh = height * zoom
      const minX = width - sw, minY = height - sh
      vpt[4] = Math.max(minX, Math.min(vpt[4], 0))
      vpt[5] = Math.max(minY, Math.min(vpt[5], 0))
      canvas.setViewportTransform(vpt)
    }
    const onUp = e => {
      if (e.button === 1) isPanning = false
    }
    const onContext = e => e.preventDefault()

    el.addEventListener("mousedown", onDown)
    el.addEventListener("mousemove", onMove)
    el.addEventListener("mouseup",   onUp)
    el.addEventListener("contextmenu", onContext)

    return () => {
      el.removeEventListener("mousedown", onDown)
      el.removeEventListener("mousemove", onMove)
      el.removeEventListener("mouseup",   onUp)
      el.removeEventListener("contextmenu", onContext)
      canvas.dispose()
    }
  }, [])

  // -- 2) Реакция на изменение размеров или URL фона
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 2.1) Обновляем размеры холста
    canvas.setWidth(width)
    canvas.setHeight(height)

    // 2.2) Обновляем фон
    if (backgroundImageURL) {
      const bg = canvas.backgroundImage

      // Если URL не изменился, просто рескейлим
      if (bg && bg._element?.src === backgroundImageURL) {
        bg.scaleToWidth(width)
        bg.scaleToHeight(height)
        canvas.requestRenderAll()
      }
      else {
        // Загружаем новый фон
        fabric.Image.fromURL(
          backgroundImageURL,
          img => {
            img.set({ originX: "left", originY: "top", selectable: false })
            img.scaleToWidth(width)
            img.scaleToHeight(height)
            canvas.setBackgroundImage(
              img,
              canvas.requestRenderAll.bind(canvas)
            )
          },
          { crossOrigin: "anonymous" }
        )
      }
    }
    else {
      // Сбрасываем фон
      canvas.setBackgroundImage(null, canvas.requestRenderAll.bind(canvas))
    }
  }, [width, height, backgroundImageURL])

  return canvasRef
}