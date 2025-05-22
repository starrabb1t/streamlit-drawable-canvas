// src/FabricCanvas.js
import React, { useRef, useCallback } from "react"
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
  color,
  initialObjects = [],
  pointRadius,
  onChange,
}) {
  // Ссылка на <canvas> и объект Fabric
  const mountRef  = useRef(null)
  const canvasRef = useCanvasInit(mountRef, { width, height, backgroundImageURL })

  // Счётчик для выдачи objectId новым фигурам
  const idCounter = useRef(0)

  // Хук истории: sendBack, undo, redo, reset
  const { sendBack, undo, redo, reset } = useObjectHistory(
    canvasRef,
    { initialObjects, onChange, mode, pointRadius, idCounter }
  )

  // Загрузка initialObjects на канву
  useLoadInitial(canvasRef, initialObjects, idCounter, pointRadius, sendBack)

  // Логика рисования в разных режимах
  useDrawingMode(canvasRef, { mode, color, pointRadius, idCounter, sendBack })

  // Зум + пэннинг
  const { zoomIn, zoomOut } = useZoom(canvasRef, { width, height })

  // Удаление выбранных фигур
  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getActiveObjects().forEach(o => canvas.remove(o))
    canvas.discardActiveObject()
    canvas.requestRenderAll()
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