import { useEffect } from "react"
import { fabric } from "fabric"

export default function useLoadInitial(
  canvasRef,
  initialObjects,
  idCounterRef,
  pointRadius,
  sendBack
) {
  useEffect(() => {
    if (!canvasRef.current || initialObjects.length === 0) return

    const canvas = canvasRef.current
    // флаг, чтобы не загружать повторно
    if (canvas._initialLoaded) return
    canvas._initialLoaded = true

    // сохраним фон, очистим всё, вернём фон
    const bg = canvas.backgroundImage
    canvas.clear()
    if (bg) canvas.setBackgroundImage(bg, canvas.renderAll.bind(canvas))

    idCounterRef.current = 0

    initialObjects.forEach(o => {
      let inst = null
      if (o.type === "rect") {
        inst = new fabric.Rect({
          left:         o.left,
          top:          o.top,
          originX:      "left",
          originY:      "top",
          width:        o.width,
          height:       o.height,
          fill:         "transparent",
          stroke:       o.stroke,
          strokeWidth:  2,
          selectable:   false,
          strokeUniform: true,
        })
      }
      else if (o.type === "circle") {
        inst = new fabric.Circle({
          left:         o.left,
          top:          o.top,
          originX:      "center",
          originY:      "center",
          radius:       pointRadius,
          fill:         "transparent",
          stroke:       o.stroke,
          strokeWidth:  3,
          selectable:   false,
        })
      }
      if (inst) {
        inst.objectId = ++idCounterRef.current
        canvas.add(inst)
      }
    })

    canvas.renderAll()
    sendBack()
  }, [canvasRef, initialObjects, pointRadius, sendBack, idCounterRef])
}