import { useRef, useCallback, useEffect } from "react"
import { fabric } from "fabric"

export default function useObjectHistory(
  canvasRef,
  { initialObjects, onChange, mode, figureIdCounter }
) {
  // история снапшотов
  const historyRef      = useRef([])
  const historyIndexRef = useRef(-1)
  const skipHistoryRef  = useRef(false)

  // «сырая» отправка в Python
  const rawSendBack = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const active = canvas.getActiveObjects()
    const objs = canvas.getObjects().map(o => ({
      objectId:   o.objectId,
      figureId:   o.figureId,
      classId:    o.classId,
      keypointName: o.keypointName,
      type:        o.type,
      left:        o.left,
      top:         o.top,
      width:       o.width  * (o.scaleX  || 1),
      height:      o.height * (o.scaleY || 1),
      stroke:      o.stroke,
      is_selected: active.includes(o),
    }))
    onChange(objs)
  }, [onChange])

  // «отправка+пуш в историю»
  const sendBack = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (!skipHistoryRef.current) {
      // если мы откатились — обрезаем «будущее»
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(
          0,
          historyIndexRef.current + 1
        )
      }
      // пушим новый снимок
      //const prev = historyRef.current[historyIndexRef.current]
      const snapshot = canvas
        .getObjects()
        .map(o => o.toObject(["figureId", "objectId", "classId", "keypointName"]))

      /*if (prev !== snapshot) {
        historyRef.current.push(snapshot)
        historyIndexRef.current++
      }*/
     
      historyRef.current.push(snapshot)
      historyIndexRef.current++
    }
    skipHistoryRef.current = false
    rawSendBack()
  }, [rawSendBack])

  // при смене initialObjects — сбрасываем историю
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const snapshot = canvas
      .getObjects()
      .map(o => o.toObject(["figureId", "objectId", "classId", "keypointName"]))

    historyRef.current      = [snapshot]
    historyIndexRef.current = 0
    skipHistoryRef.current  = false
  }, [initialObjects])

  // восстановить состояние из снапшота
  const restoreSnapshot = useCallback(
    snapshot => {
      const canvas = canvasRef.current
      if (!canvas) return

      // 1) убираем все объекты (фон остаётся)
      canvas.getObjects().forEach(o => canvas.remove(o))

      // 2) обновляем счётчик ID до максимума из снапшота
      figureIdCounter.current = snapshot.reduce(
        (mx, o) => Math.max(mx, o.figureId || 0),
        0
      )

      // 3) «оживляем» объекты
      fabric.util.enlivenObjects(
        snapshot,
        enlived => {
          enlived.forEach(o => {
            const isT = mode === "transform"
            let inst = null

            if (o.type === "rect") {
              inst = new fabric.Rect({
                left:          o.left,
                top:           o.top,
                originX:       "left",
                originY:       "top",
                width:         o.width,
                height:        o.height,
                fill:          "transparent",
                stroke:        o.stroke,
                strokeWidth:   2,
                selectable:    isT,
                strokeUniform: true,
                figureId:      o.figureId,
                objectId:      o.objectId,
                classId:       o.classId,
                lockRotation: true,
                hasRotatingPoint: false
              })
            }
            else if (o.type === "circle") {
              inst = new fabric.Circle({
                left:          o.left,
                top:           o.top,
                originX:       "center",
                originY:       "center",
                radius:        o.radius,
                fill:          "transparent",
                stroke:        o.stroke,
                strokeWidth:   3,
                selectable:    isT,
                hasControls:   isT,
                figureId:      o.figureId,
                objectId:      o.objectId,
                classId:       o.classId,
                keypointName: o.keypointName,
                lockRotation: true,
                hasRotatingPoint: false,
                lockScalingX: true,
                lockScalingY: true
              })
            }

            if (inst) canvas.add(inst)
          })

          canvas.discardActiveObject()
          canvas.requestRenderAll()
          rawSendBack()
        }
      )
    },
    [rawSendBack, mode, figureIdCounter]
  )

  // undo / redo / reset
  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current--
    skipHistoryRef.current = true
    restoreSnapshot(historyRef.current[historyIndexRef.current])
  }, [restoreSnapshot])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current++
    skipHistoryRef.current = true
    restoreSnapshot(historyRef.current[historyIndexRef.current])
  }, [restoreSnapshot])

  const reset = useCallback(() => {
    if (!historyRef.current.length) return
    historyIndexRef.current = 0
    skipHistoryRef.current  = true
    restoreSnapshot(historyRef.current[0])
  }, [restoreSnapshot])

  return { rawSendBack, sendBack, undo, redo, reset }
}