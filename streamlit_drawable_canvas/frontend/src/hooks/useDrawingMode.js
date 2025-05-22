// src/hooks/useDrawingMode.js
import { useEffect } from "react"
import { fabric }    from "fabric"

const MIN_SIDE = 10

export default function useDrawingMode(
  canvasRef,
  { mode, classColor, keypointColor, pointRadius, figureIdCounter, sendBack, objectId, classId, keypointName }
) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 0) общий сброс селекта при выходе из трансформа
    if (mode !== "transform") {
      canvas.discardActiveObject()
      canvas.forEachObject(o => o.set({ selectable: false }))
      canvas.requestRenderAll()
    }

    // Обработчики из разных режимов
    const handlers = {}

    if (mode === "rect") {
      canvas.selection = false
      canvas.defaultCursor = "crosshair"

      let rect = null
      let isDown = false
      let startX = 0, startY = 0

      handlers.mouseDown = opt => {
        isDown = true
        const p = canvas.getPointer(opt.e)
        startX = p.x; startY = p.y
        rect = new fabric.Rect({
          left:         startX,
          top:          startY,
          originX:      "left",
          originY:      "top",
          width:        0,
          height:       0,
          fill:         "transparent",
          stroke:       classColor,
          strokeWidth:  2,
          selectable:   false,
          strokeUniform: true,
          lockRotation: true,
          hasRotatingPoint: false
        })
        rect.figureId  = ++figureIdCounter.current      // старый идентификатор фигуры
        rect.objectId = objectId                  // идентификатор «object»
        rect.classId  = classId             // класс объекта
        canvas.add(rect)
      }

      handlers.mouseMove = opt => {
        if (!isDown || !rect) return
        const p = canvas.getPointer(opt.e)
        const w = p.x - startX
        const h = p.y - startY

        rect.set({
          left:   w < 0 ? p.x : startX,
          top:    h < 0 ? p.y : startY,
          width:  Math.abs(w),
          height: Math.abs(h),
        })
        rect.setCoords()
        canvas.requestRenderAll()
      }

      handlers.mouseUp = () => {
        if (!isDown) return
        isDown = false
        if (rect.width < MIN_SIDE || rect.height < MIN_SIDE) {
          canvas.remove(rect)
        } else {
          sendBack()
        }
      }

      canvas.on("mouse:down", handlers.mouseDown)
      canvas.on("mouse:move", handlers.mouseMove)
      canvas.on("mouse:up",   handlers.mouseUp)
    }
    else if (mode === "point" && keypointName) {
      canvas.selection = false
      canvas.defaultCursor = "pointer"

      handlers.mouseDown = opt => {
        const p = canvas.getPointer(opt.e)
        const c = new fabric.Circle({
          left:         p.x,
          top:          p.y,
          originX:      "center",
          originY:      "center",
          radius:       pointRadius,
          fill:         "transparent",
          stroke:       keypointColor,
          strokeWidth:  3,
          selectable:   false,
          lockRotation: true,
          hasRotatingPoint: false,
          lockScalingX: true,
          lockScalingY: true
        })
        c.figureId  = ++figureIdCounter.current
        c.objectId = objectId
        c.classId  = classId
        c.keypointName = keypointName
        canvas.add(c)
        canvas.requestRenderAll()
        sendBack()
      }

      canvas.on("mouse:down", handlers.mouseDown)
    }
    else if (mode === "transform") {
      canvas.selection = true
      canvas.defaultCursor = "move"

      // выставим атрибуты на всех объектах
      canvas.getObjects().forEach(o => {
        if (o.type === "rect") {
          o.set({
            selectable:   true,
            hasControls:  true,
            lockRotation: false,
            lockScalingX: false,
            lockScalingY: false,
          })
        } else if (o.type === "circle") {
          o.set({
            selectable:   true,
            hasControls:  false,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
          })
        }
      })

      // подписываемся на события трансформации
      handlers.objectModified     = () => sendBack()
      handlers.selectionCreated   = () => sendBack()
      handlers.selectionUpdated   = () => sendBack()
      handlers.selectionCleared   = () => sendBack()

      canvas.on("object:modified",   handlers.objectModified)
      canvas.on("selection:created", handlers.selectionCreated)
      canvas.on("selection:updated", handlers.selectionUpdated)
      canvas.on("selection:cleared", handlers.selectionCleared)
    }
    else {
      canvas.selection = false
      canvas.defaultCursor = "default"
    }

    // Cleanup: снимаем ВСЕ навешанные выше обработчики
    return () => {
      if (handlers.mouseDown)        canvas.off("mouse:down",         handlers.mouseDown)
      if (handlers.mouseMove)        canvas.off("mouse:move",         handlers.mouseMove)
      if (handlers.mouseUp)          canvas.off("mouse:up",           handlers.mouseUp)

      if (handlers.objectModified)   canvas.off("object:modified",    handlers.objectModified)
      if (handlers.selectionCreated) canvas.off("selection:created",  handlers.selectionCreated)
      if (handlers.selectionUpdated) canvas.off("selection:updated",  handlers.selectionUpdated)
      if (handlers.selectionCleared) canvas.off("selection:cleared",  handlers.selectionCleared)
    }
  }, [mode, classColor, keypointColor, pointRadius, sendBack, figureIdCounter, objectId, classId, keypointName])
}