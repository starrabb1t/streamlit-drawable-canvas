// src/utils/canvasUtils.js
import { fabric } from "fabric"

export function showCanvasMessage(
  canvas,
  text,
  {
    left = 10,
    bottomOffset = 10,
    fill = "red",
    backgroundColor = "#ccc",
    fontFamily = "Arial",
    fontSize = 12,
    duration = 2000,
  } = {}
) {
  if (!canvas) return null

  const msg = new fabric.Text(text, {
    left,
    top: canvas.getHeight() - bottomOffset,
    fill,
    backgroundColor,
    fontFamily,
    fontSize,
    selectable: false,
    evented:    false,
  })
  msg.set("originY", "bottom")

  canvas.add(msg)
  canvas.requestRenderAll()

  // планируем удаление
  const timer = setTimeout(() => {
    // только если msg всё ещё на canvas
    if (msg.canvas) {
      try {
        canvas.remove(msg)
        canvas.requestRenderAll()
      }
      catch (_err) {
        // подавляем все ошибки при удалении
      }
    }
  }, duration)

  return
}