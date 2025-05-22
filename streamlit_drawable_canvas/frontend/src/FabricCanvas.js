// src/FabricCanvas.js
import React, { useRef, useEffect, useCallback } from "react"
import { fabric }     from "fabric"
import useCanvasInit  from "./hooks/useCanvasInit"
import useLoadInitial from "./hooks/useLoadInitial"
import useDrawingMode from "./hooks/useDrawingMode"
import useZoom        from "./hooks/useZoom"
import Toolbar        from "./Toolbar"

export default function FabricCanvas({
  width, height,
  backgroundImageURL,
  mode, color,
  initialObjects, pointRadius,
  onChange,
}) {

  console.log('FabricCanvas', mode)

  const mountRef  = useRef(null)
  const canvasRef = useCanvasInit(mountRef, { width, height, backgroundImageURL })
  const idCounter = useRef(0)

  // история: массив снимков объектов, текущий индекс и флаг
  const historyRef      = useRef([])
  const historyIndexRef = useRef(-1)
  const skipHistoryRef  = useRef(false)

  // 1) после первой загрузки initialObjects создаём initial state истории
  useEffect(() => {

    const canvas = canvasRef.current
    if (!canvas) return
    // делаем снимок всех объектов (без фона)
    const snapshot = canvas.getObjects().map(o => o.toObject(["objectId"]))
    historyRef.current = [snapshot]
    historyIndexRef.current = 0
    skipHistoryRef.current = false
  }, [initialObjects])

  // “сырая” отправка в Streamlit (без истории)
  const rawSendBack = useCallback(() => {

    const canvas = canvasRef.current
    if (!canvas) return
    const active = canvas.getActiveObjects()
    const objs = canvas.getObjects().map(o => ({
      id:          o.objectId,
      type:        o.type,
      left:        o.left,
      top:         o.top,
      width:       o.width * (o.scaleX  || 1),
      height:      o.height * (o.scaleY || 1),
      stroke:      o.stroke,
      is_selected: active.includes(o),
    }))
    onChange(objs)
  }, [onChange])

  // отправка + пуш в историю (если нужно)
  const sendBack = useCallback(() => {

    const canvas = canvasRef.current
    if (!canvas) return

    if (!skipHistoryRef.current) {
      // если мы не в режиме undo/redo, то пушим новый снимок
      if (historyIndexRef.current < historyRef.current.length - 1) {
        // обрезаем «будущие» после undo
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
      }
      const snapshot = canvas.getObjects().map(o => o.toObject(["objectId"]))
      historyRef.current.push(snapshot)
      historyIndexRef.current++
    }
    skipHistoryRef.current = false

    rawSendBack()
  }, [rawSendBack])

  // Вспомогательная функция: восстановить состояние из snapshot
  // Старый код удалить, а вместо него вставить следующее:

const restoreSnapshot = useCallback((snapshot) => {
  const canvas = canvasRef.current
  if (!canvas) return

  // 1) Сохраняем фон и текущее состояние вьюпорта
  const bg = canvas.backgroundImage
  const prevViewport = canvas.viewportTransform.concat()

  // 2) Обновляем idCounter по максимуму в snapshot
  idCounter.current = snapshot.reduce(
    (mx, obj) => Math.max(mx, obj.objectId || 0),
    0
  )

  // 3) Готовим JSON только с объектами
  const json = { objects: snapshot }

  // 4) Полностью сбрасываем всё и грузим заново
  canvas.clear()
  canvas.loadFromJSON(json, () => {
    // 5) Ставим фон обратно без перезагрузки
    if (bg) {
      canvas.setBackgroundImage(
        bg,
        canvas.requestRenderAll.bind(canvas)
      )
    }

    // 6) Восстанавливаем пан/зум
    canvas.setViewportTransform(prevViewport)

    // 7) Переключаем selectable/controls по текущему режиму
    canvas.getObjects().forEach(o => {
      if (mode !== "transform") {
        o.set({ selectable: false })
      }
      else if (o.type === "rect") {
        o.set({
          selectable: true,
          hasControls: true,
          lockScalingX: false,
          lockScalingY: false,
          lockRotation: false,
        })
      }
      else if (o.type === "circle") {
        o.set({
          selectable: true,
          hasControls: false,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
        })
      }
    })

    canvas.discardActiveObject()
    canvas.requestRenderAll()

    // 8) шлём обновлённый список обратно в Streamlit
    rawSendBack()
  })
}, [rawSendBack, mode])

  // undo
  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current--
    skipHistoryRef.current = true
    const prev = historyRef.current[historyIndexRef.current]
    restoreSnapshot(prev)
  }, [restoreSnapshot])

  // redo
  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current++
    skipHistoryRef.current = true
    const next = historyRef.current[historyIndexRef.current]
    restoreSnapshot(next)
  }, [restoreSnapshot])

  // reset (к первому состоянию)
  const reset = useCallback(() => {
    if (historyRef.current.length === 0) return
    historyIndexRef.current = 0
    skipHistoryRef.current = true
    const first = historyRef.current[0]
    restoreSnapshot(first)
  }, [restoreSnapshot])

  // ставим initialObjects и прочую логику рисования
  useLoadInitial(canvasRef, initialObjects, idCounter, pointRadius, sendBack)
  useDrawingMode(canvasRef, { mode, color, pointRadius, idCounter, sendBack })
  const { zoomIn, zoomOut } = useZoom(canvasRef, { width, height })

  // кнопка Delete
  const deleteSelected = useCallback(() => {
    const c = canvasRef.current
    if (!c) return
    c.getActiveObjects().forEach(o => c.remove(o))
    c.discardActiveObject()
    c.requestRenderAll()
    sendBack()
  }, [sendBack])

  return (
    <>
      <canvas
        ref={mountRef}
        width={width}
        height={height}
        style={{ border: "1px solid #888" }}
      />
      <Toolbar
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        deleteSelected={deleteSelected}
        undo={undo}
        redo={redo}
        reset={reset}
      />
    </>
  )
}