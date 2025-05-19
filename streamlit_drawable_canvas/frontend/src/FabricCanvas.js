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
  }, [initialObjects, canvasRef])

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
  }, [canvasRef, onChange])

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
  }, [canvasRef, rawSendBack])

  // Вспомогательная функция: восстановить состояние из snapshot
  const restoreSnapshot = useCallback((snapshot) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Убираем с холста ВСЕ объекты (но фон остаётся)
    canvas.getObjects().forEach(o => canvas.remove(o));

    // enlivenObjects(snapshot, callback)
    fabric.util.enlivenObjects(
      snapshot,                 // массив JSON-объектов, полученных через o.toObject([...])
      enlivedObjects => {
        enlivedObjects.forEach(obj => {
          // Каждый obj уже имеет все свойства, в том числе objectId
          canvas.add(obj);
        });
        canvas.renderAll();
        rawSendBack();         // шлём обновлённый список в Streamlit
      }
      // <--- НЕ передаём сюда "objectId"!
    );
  }, [canvasRef, rawSendBack]);

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
  }, [canvasRef, sendBack])

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