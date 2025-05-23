import { useEffect } from "react"
import { fabric } from "fabric"

export default function useLoadInitial(
  canvasRef,
  initialObjects,
  figureIdCounter,
  sendBack,
  pointRadius
) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 1) очистим всё, сохраняя только фон
    const bg = canvas.backgroundImage
    canvas.clear()

    if (bg) {
      // восстановим фон
      canvas.setBackgroundImage(
        bg,
        canvas.requestRenderAll.bind(canvas)
      )
    }

    // 2) сброс счетчика ID
    figureIdCounter.current = 0

    // 3) сброс вьюпорта (убрать паны/зумы, если нужно)
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0])

    // 4) добавим новые initialObjects
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
          selectable:   true,
          strokeUniform: true,
          lockRotation: true,
          hasRotatingPoint: false,
          objectId:   o.objectId,
          figureId:   o.figureId,
          classId:    o.classId
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
          selectable:   true,
          controls: false,
          lockRotation: true,
          hasRotatingPoint: false,
          lockScalingX: true,
          lockScalingY: true,
          objectId:   o.objectId,
          figureId:   o.figureId,
          classId:    o.classId,
          keypointName: o.keypointName
        })
      }

      if (inst) {
        inst.figureId = ++figureIdCounter.current
        canvas.add(inst)
      }
    })

    // 5) рендерим и отдаем состояние назад
    canvas.requestRenderAll()
    sendBack()

    // эффект должен реагировать на смену initialObjects
  }, [initialObjects])
}