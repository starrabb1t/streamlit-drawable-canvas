import React, { useEffect, useRef, useLayoutEffect } from "react"
import { Streamlit, withStreamlitConnection } from "streamlit-component-lib"
import { fabric } from "fabric"
import Toolbar from "./Toolbar"

// Параметры зума
const ZOOM_FACTOR = 1.2
const MAX_ZOOM    = 10
const MIN_ZOOM    = 1

function App({ args }) {
  const {
    backgroundImageURL,
    color,
    drawingMode,
    canvasWidth,
    canvasHeight,
    initialObjects = [],     // <-- аргумент от Python
    pointRadius
  } = args

  const mountRef   = useRef(null)
  const canvasRef  = useRef(null)
  const idCounter  = useRef(0)
  const initialLoaded = useRef(false)

  //
  // 1) Инициализация Fabric.Canvas + фон + паннинг
  //
  useEffect(() => {
    const canvas = new fabric.Canvas(mountRef.current, {
      selection: false,
      preserveObjectStacking: true,
    })
    canvasRef.current = canvas

    // фоновое изображение
    if (backgroundImageURL) {
      fabric.Image.fromURL(
        backgroundImageURL,
        img => {
          img.set({ originX: "left", originY: "top", selectable: false })
          img.scaleToWidth(canvasWidth)
          img.scaleToHeight(canvasHeight)
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas))
        },
        { crossOrigin: "anonymous" }
      )
    }

    // паннинг: ловим чистые DOM-события на верхнем canvas-элементе
    const el = canvas.upperCanvasEl
    let isPanning = false
    let lastX = 0, lastY = 0
 
    const startPan = e => {
      // средняя кнопка — button===1
      if (e.button === 1) {
        isPanning = true
        lastX = e.clientX
        lastY = e.clientY
        // чтобы браузер не скроллил страницу
        e.preventDefault()
      }
    }
    const doPan = e => {
      if (!isPanning) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      canvas.relativePan({ x: dx, y: dy })
      lastX = e.clientX
      lastY = e.clientY

      // --- clamp панинга в границах видимой области ---
      const vpt = canvas.viewportTransform
      const zoom = vpt[0]  // scaleX == scaleY == zoom
      // после зума масштабированная ширина/высота холста
      const scaledW = canvasWidth * zoom
      const scaledH = canvasHeight * zoom
      // максимально допустимый сдвиг (отрицательное)
      const minX = canvasWidth - scaledW
      const minY = canvasHeight - scaledH
      // переводим в диапазон [minX..0], [minY..0]
      vpt[4] = Math.max(minX, Math.min(vpt[4], 0))
      vpt[5] = Math.max(minY, Math.min(vpt[5], 0))
      canvas.setViewportTransform(vpt)
    }
    const stopPan = e => {
      if (e.button === 1) {
        isPanning = false
      }
    }
 
    el.addEventListener("mousedown", startPan)
    el.addEventListener("mousemove", doPan)
    el.addEventListener("mouseup", stopPan)
    // и блокируем контекстное меню на всякий случай
    el.addEventListener("contextmenu", e => e.preventDefault())
 
    // cleanup
    return () => {
      el.removeEventListener("mousedown", startPan)
      el.removeEventListener("mousemove", doPan)
      el.removeEventListener("mouseup", stopPan)
      el.removeEventListener("contextmenu", e => e.preventDefault())
      canvas.dispose()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // если мы уже импортировали initialObjects ранее — ничего не делаем
    if (initialLoaded.current) {
      return
    }
    initialLoaded.current = true

    // Сохраним фон, потому что clear() его сбросит
    const bg = canvas.backgroundImage
    canvas.clear()
    if (bg) canvas.setBackgroundImage(bg, canvas.renderAll.bind(canvas))

    // Сбросим счётчик ID
    idCounter.current = 0

    // Добавляем объекты из initialObjects
    initialObjects.forEach(o => {
      let inst = null
      if (o.type === "rect") {
        inst = new fabric.Rect({
          left: o.left, top: o.top,
          originX: "left", originY: "top",
          width: o.width, height: o.height,
          fill: "transparent",
          stroke: o.stroke, strokeWidth: 2,
          selectable: false,
        })
      } else if (o.type === "circle") {
        inst = new fabric.Circle({
          left: o.left, top: o.top,
          originX: "center", originY: "center",
          radius: pointRadius,
          fill: "transparent",
          stroke: o.stroke, strokeWidth: 3,
          selectable: false,
        })
      }
      if (inst) {
        inst.objectId = ++idCounter.current
        canvas.add(inst)
      }
    })
    canvas.renderAll()

    // И сразу шлём обратно, чтобы Python узнал новые ID
    sendBack()
  }, [initialObjects])

  //
  // 2) Функции зума
  //
  const handleZoomIn = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const center = new fabric.Point(canvasWidth / 2, canvasHeight / 2)
    const zoom = canvas.getZoom() || 1
    const newZoom = Math.min(zoom * ZOOM_FACTOR, MAX_ZOOM)
    canvas.zoomToPoint(center, newZoom)
    canvas.requestRenderAll()
  }

  const handleZoomOut = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const center = new fabric.Point(canvasWidth / 2, canvasHeight / 2)
    const zoom = canvas.getZoom() || 1
    const newZoom = Math.max(zoom / ZOOM_FACTOR, MIN_ZOOM)
    canvas.zoomToPoint(center, newZoom)
    canvas.requestRenderAll()
  }

  //
  // 3) sendBack: собирает объекты и пересчитывает рамку iframe
  //
  const sendBack = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const active = canvas.getActiveObjects()
    const objs = canvas
      .getObjects()
      .map(o => {
        const w = o.width * (o.scaleX || 1)
        const h = o.height * (o.scaleY || 1)
        return {
          id:          o.objectId,
          type:        o.type,
          left:        o.left,
          top:         o.top,
          width:       w,
          height:      h,
          stroke:      o.stroke,
          is_selected: active.includes(o),
        }
      })
    Streamlit.setComponentValue(objs)

    // фиксированный запас под тулбар
    const TOOLBAR_HEIGHT = 30
    Streamlit.setFrameHeight(canvasHeight + TOOLBAR_HEIGHT)
  }

  //
  // 4) Основная логика рисования / трансформации
  //
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // отписаться от старых
    canvas.off("mouse:down")
    canvas.off("mouse:move")
    canvas.off("mouse:up")
    canvas.off("object:modified")
    canvas.off("selection:created")
    canvas.off("selection:updated")
    canvas.off("selection:cleared")

    if (drawingMode !== "transform") {
       canvas.discardActiveObject()
       canvas.forEachObject(o => o.set({ selectable: false }))
       canvas.requestRenderAll()
    }

    if (drawingMode === "rect") {
      canvas.selection = false
      canvas.defaultCursor = "crosshair"
      let rect, isDown, sx, sy

      canvas.on("mouse:down", opt => {
        isDown = true
        const p = canvas.getPointer(opt.e)
        sx = p.x; sy = p.y
        rect = new fabric.Rect({
          left: sx,
          top: sy,
          originX: "left",
          originY: "top",
          width: 0,
          height: 0,
          fill: "transparent",
          stroke: color,
          strokeWidth: 2,
          selectable: false,
        })
        rect.objectId = ++idCounter.current
        canvas.add(rect)
      })
      canvas.on("mouse:move", opt => {
        if (!isDown || !rect) return
        const p = canvas.getPointer(opt.e)
        const w = p.x - sx, h = p.y - sy
        rect.set({
          left:  w < 0 ? p.x : sx,
          top:   h < 0 ? p.y : sy,
          width:  Math.abs(w),
          height: Math.abs(h),
        })
        rect.setCoords()
        canvas.renderAll()
      })
      canvas.on("mouse:up", () => {
        if (!isDown) return
        isDown = false
        sendBack()
      })
    }
    else if (drawingMode === "point") {
      canvas.selection = false
      canvas.defaultCursor = "pointer"
      //const R = 0

      canvas.on("mouse:down", opt => {
        const p = canvas.getPointer(opt.e)
        const c = new fabric.Circle({
          left: p.x,
          top: p.y,
          radius: pointRadius,
          fill: "red",
          stroke: color,
          strokeWidth: 3,
          originX: "center",
          originY: "center",
          selectable: false,
        })
        c.objectId = ++idCounter.current
        canvas.add(c)
        canvas.renderAll()
        sendBack()
      })
    }
    else if (drawingMode === "transform") {
      canvas.selection = true
      canvas.defaultCursor = "move"
      canvas.forEachObject(o => {
        if (o.type === "rect") {
          o.set({
            selectable: true,
            lockRotation: false,
            lockScalingX: false,
            lockScalingY: false,
            hasControls: true,
          })
        }
        else if (o.type === "circle") {
          o.set({
            selectable: true,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            hasControls: false,
          })
        }
      })
      canvas.on("object:modified", opt => {
        const o = opt.target
        if (o.type === "rect") {
          const w = o.width * o.scaleX
          const h = o.height * o.scaleY
          o.set({ width: w, height: h, scaleX: 1, scaleY: 1 })
          o.setCoords()
        }
        sendBack()
      })
      canvas.on("selection:created", sendBack)
      canvas.on("selection:updated", sendBack)
      canvas.on("selection:cleared", sendBack)
    }
    else {
      canvas.selection = false
      canvas.defaultCursor = "default"
    }
  }, [drawingMode, color])

  //
  // 5) При любом рендере ещё подстраиваем iframe
  //
  useLayoutEffect(() => {
    const TOOLBAR_HEIGHT = 40
    Streamlit.setFrameHeight(canvasHeight + TOOLBAR_HEIGHT)
  })

  //
  // 6) JSX
  //
  return (
    <div style={{ display: "inline-block" }}>
      <canvas
        ref={mountRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ border: "1px solid #888" }}
      />
      <Toolbar
        canvas={canvasRef.current}
        sendBack={sendBack}
        zoomIn={handleZoomIn}
        zoomOut={handleZoomOut}
      />
    </div>
  )
}

export default withStreamlitConnection(App)