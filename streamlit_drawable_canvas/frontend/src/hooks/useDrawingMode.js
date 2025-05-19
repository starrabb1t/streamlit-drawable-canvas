import { useEffect } from "react"
import { fabric } from "fabric"

export default function useDrawingMode(
  canvasRef,
  { mode, color, pointRadius, idCounter, sendBack }
) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // сбросим старые слушатели
    canvas.off("mouse:down"); canvas.off("mouse:move"); canvas.off("mouse:up")
    canvas.off("object:modified")
    canvas.off("selection:created"); canvas.off("selection:updated"); canvas.off("selection:cleared")

    // очистим выбор если не трансформируем
    if (mode !== "transform") {
      canvas.discardActiveObject()
      canvas.forEachObject(o => o.set({ selectable: false }))
      canvas.requestRenderAll()
    }

    if (mode === "rect") {
      canvas.selection = false
      canvas.defaultCursor = "crosshair"
      let rect, isDown = false, sx = 0, sy = 0

      canvas.on("mouse:down", opt => {
        isDown = true
        const p = canvas.getPointer(opt.e)
        sx = p.x; sy = p.y
        rect = new fabric.Rect({
          left:         sx, top: sy,
          originX:      "left", originY: "top",
          width:        0, height: 0,
          fill:         "transparent",
          stroke:       color, strokeWidth: 2,
          selectable:   false,
        })
        rect.objectId = ++idCounter.current
        canvas.add(rect)
      })
      canvas.on("mouse:move", opt => {
        if (!isDown || !rect) return
        const p = canvas.getPointer(opt.e)
        const w = p.x - sx, h = p.y - sy
        rect.set({
          left:   w < 0 ? p.x : sx,
          top:    h < 0 ? p.y : sy,
          width:  Math.abs(w),
          height: Math.abs(h),
        })
        rect.setCoords()
        canvas.renderAll()
      })
      canvas.on("mouse:up", () => {
        if (!isDown) return
        isDown = false
        const MIN_SIDE = 10
        if (rect.width < MIN_SIDE || rect.height < MIN_SIDE) {
          canvas.remove(rect)
        } else {
          sendBack()
        }
      })
    }
    else if (mode === "point") {
      canvas.selection = false
      canvas.defaultCursor = "pointer"

      canvas.on("mouse:down", opt => {
        const p = canvas.getPointer(opt.e)
        const c = new fabric.Circle({
          left:         p.x, top: p.y,
          originX:      "center", originY: "center",
          radius:       pointRadius,
          fill:         "transparent",
          stroke:       color, strokeWidth: 3,
          selectable:   false,
        })
        c.objectId = ++idCounter.current
        canvas.add(c)
        canvas.renderAll()
        sendBack()
      })
    }
    else if (mode === "transform") {
      canvas.selection = true
      canvas.defaultCursor = "move"
      canvas.forEachObject(o => {
        if (o.type === "rect") {
          o.set({ selectable: true, lockRotation: false, lockScalingX: false, lockScalingY: false, hasControls: true })
        }
        else if (o.type === "circle") {
          o.set({ selectable: true, lockRotation: true, lockScalingX: true, lockScalingY: true, hasControls: false })
        }
      })
      canvas.on("object:modified", sendBack)
      canvas.on("selection:created", sendBack)
      canvas.on("selection:updated", sendBack)
      canvas.on("selection:cleared", sendBack)
    }
    else {
      canvas.selection = false
      canvas.defaultCursor = "default"
    }
  }, [canvasRef, mode, color, pointRadius, idCounter, sendBack])
}