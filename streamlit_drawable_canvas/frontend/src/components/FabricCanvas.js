// src/FabricCanvas.js
import React, { useRef, useEffect, useCallback } from "react"
import useCanvasInit    from "../hooks/useCanvasInit"
import useLoadInitial   from "../hooks/useLoadInitial"
import useDrawingMode   from "../hooks/useDrawingMode"
import useZoom          from "../hooks/useZoom"
import useObjectHistory from "../hooks/useObjectHistory"
import Toolbar          from "./Toolbar"

export default function FabricCanvas({
  width,
  height,
  backgroundImageURL,
  mode,
  classColor,
  keypointColor,
  classId, 
  objectId,
  keypointName,
  initialObjects,
  pointRadius,
  onChange,
  filterById
}) {
  // Ссылка на <canvas> и объект Fabric
  const mountRef  = useRef(null)
  const canvasRef = useCanvasInit(mountRef, { width, height, backgroundImageURL })

  // Счётчик для выдачи objectId новым фигурам
  const figureIdCounter = useRef(0)

  // Подгоняем все объекты к новым размерам канвы
  // храним предыдущие размеры
  const prevSize = useRef({ w: width, h: height })
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { w: prevW, h: prevH } = prevSize.current
    // если это первый рендер или размеры не изменились — выходим
    if (prevW === width && prevH === height) return

    const scaleX = width  / prevW
    const scaleY = height / prevH

    canvas.getObjects().forEach(o => {
      // масштабируем позиции
      o.left *= scaleX
      o.top  *= scaleY
      // масштабируем размеры/масштаб
      o.scaleX = (o.scaleX || 1) * scaleX
      o.scaleY = (o.scaleY || 1) * scaleY
      o.setCoords()
    })

    // обновляем stored размер
    prevSize.current = { w: width, h: height }

    // пересоздаём размеры холста
    canvas.setWidth(width)
    canvas.setHeight(height)
    // не трогаем фон, useCanvasInit второй эффект уже подгонит backgroundImage
    canvas.requestRenderAll()
  }, [width, height])

  // Хук истории: sendBack, undo, redo, reset
  const { sendBack, undo, redo, reset } = useObjectHistory(
    canvasRef,
    { initialObjects, onChange, mode, figureIdCounter }
  )

  // Загрузка initialObjects на канву
  useLoadInitial(canvasRef, initialObjects, figureIdCounter, sendBack, pointRadius)

  // Логика рисования в разных режимах
  useDrawingMode(canvasRef, { mode, classColor, keypointColor, pointRadius, figureIdCounter, sendBack, objectId, classId, keypointName })

  // Зум + пэннинг
  const { zoomIn, zoomReset, zoomOut } = useZoom(canvasRef, { width, height })

  // Удаление выбранных фигур
  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getActiveObjects().forEach(o => canvas.remove(o))
    canvas.discardActiveObject()
    canvas.requestRenderAll()
    sendBack()
  }, [sendBack])

  // Эффект «спрятать все объекты кроме выбранного objectId»
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.getObjects().forEach(o => {
      // применяем прозрачность ко всем фигурам (rect/circle),
      // у которых object_id !== выбранному
      if (o.type === "rect" || o.type === "circle") {
        if (filterById && o.objectId !== objectId) {
          o.set({
            opacity: 0.1,
            selectable: false,
          })
        } else {
           o.set({ opacity: 1 })
          // восстановить selectability: только в Transform-режиме
          if (mode === "transform") {
            o.set({ selectable: true })
          }
        }
      }
    })
    canvas.requestRenderAll()
  }, [filterById, objectId])

  return (
    <div>
      <canvas
        ref={mountRef}
        width={width}
        height={height}
        style={{ border: "1px solid #888" }}
      />
      <Toolbar
        zoomIn={zoomIn}
        zoomReset={zoomReset}
        zoomOut={zoomOut}
        deleteSelected={deleteSelected}
        undo={undo}
        redo={redo}
        reset={reset}
      />
    </div>
  )
}