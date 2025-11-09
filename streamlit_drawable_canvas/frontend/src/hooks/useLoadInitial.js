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

    // если initialObjects пуст или уже грузили — выходим
    if (canvas._initialLoaded) return

    // ставим флаг, чтобы больше не перезатирать сцену
    canvas._initialLoaded = true

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
          left:         o.left - 1, // компенсируем половину strokeWidth
          top:          o.top  - 1,
          originX:      "left",
          originY:      "top",
          width:        o.width,
          height:       o.height,
          fill:         "transparent",
          stroke:       o.stroke,
          strokeWidth:  2,
          selectable:   true,
          strokeUniform: true,
          noScaleCache: false,
          lockRotation: true,
          hasRotatingPoint: false,
          objectId:   o.objectId,
          figureId:   o.figureId,
          classId:    o.classId
        })
      }
      else if (o.type === "circle") {
        const strokeW = 3;
        const radius = pointRadius || 5; // фиксированный радиус в пикселях

        inst = new fabric.Circle({
          left:         o.left - strokeW / 2,
          top:          o.top  - strokeW / 2,
          originX:      "left",
          originY:      "top",
          radius:       radius,
          fill:         "transparent",
          stroke:       o.stroke,
          strokeWidth:  strokeW,
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
