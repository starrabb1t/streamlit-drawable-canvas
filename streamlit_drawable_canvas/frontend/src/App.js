// src/App.js
import React, { useState, useMemo, useEffect, useRef } from "react"
import { withStreamlitConnection, Streamlit } from "streamlit-component-lib"
import ClassSelector from "./components/ClassSelector"
import KeypointSelector from "./components/KeypointSelector"
import ModeSelector  from "./components/ModeSelector"
import FabricCanvas  from "./components/FabricCanvas"
import ObjectIdInput from "./components/ObjectIdInput"
import debounce from "lodash.debounce"

const STREAMLIT_FRAME_PADDING = 250

function App({ args }) {
  const {
    annotationSchema,
    backgroundImageURL,
    canvasWidth,
    canvasHeight,
    initialObjects,
    pointRadius,
  } = args

  // 1) выбираем класс (по умолчанию первый)
  const [classId, setClassId] = useState(annotationSchema[0].bbox)
  const [classColor,   setClassColor]   = useState(annotationSchema[0].color)
  const handleClassSelect = cls => {
    setClassId(cls)
    const item = annotationSchema.find(x => x.bbox === cls)
    setClassColor(item.color)
  }
  const [filterById, setFilterById]   = useState(false)

  // 2) режим Transform/Rect/Point
  const [mode, setMode] = useState("transform")

  // 3) object_id (натуральные числа начиная с 1)
  const [objectId, setObjectId] = useState(1)
  const incObjectId = () => setObjectId(i => i + 1)
  const decObjectId = () => setObjectId(i => Math.max(1, i - 1))

  const [keypointName, setKeypoint] = useState(null)
  // сбрасываем keypoint, когда меняем режим или класс
  useEffect(() => {
    setKeypoint(null)
  }, [mode, classId])

  // вычисляем цвет для текущего keypoint (или fallback на classColor)
  const keypointColor = keypointName
    ? (
        annotationSchema.find(x => x.bbox === classId)
        ?.keypoints?.[keypointName]?.color
      ) || classColor
    : classColor
  
  const containerRef = useRef(null)

  // колбэк отправки в Python + автозаполнение objectId при Transform & select
  const doChange = objs => {
    // 1) фильтруем оставляем только rect/circle
    const filtered = objs.filter(o => o.type === "rect" || o.type === "circle")

    // 2) если мы в Transform-режиме и есть выделенный объект — подтягиваем его ID
    if (mode === "transform") {
      // 2a) тянем objectId из любого выделенного объекта (как было)
      const sel = filtered.find(o => o.is_selected)
      if (sel) {
        setObjectId(sel.objectId)
      }
      // 2b) если выделён ровно один bbox — синхронизируем Label (classId + цвет)
      const selectedRects = filtered.filter(o => o.is_selected && o.type === "rect")
      if (selectedRects.length === 1) {
        const r = selectedRects[0]
        if (r.classId != null) {
          setClassId(r.classId)
          const item = annotationSchema.find(x => x.bbox === r.classId)
          if (item) setClassColor(item.color)
        }
      }
    }

    // 3) отправляем в Streamlit
    Streamlit.setComponentValue(filtered)
    const h = containerRef.current?.clientHeight || canvasHeight
    Streamlit.setFrameHeight(h + STREAMLIT_FRAME_PADDING)
  }

  const handleChange = useMemo(
    () => debounce(doChange, 250),
    [canvasHeight, mode, setObjectId, setClassId, setClassColor, annotationSchema]
  )

  /*
  // колбэк отправки в Python
  const doChange = objs => {
      const filtered = objs.filter(
        o => o.type === "rect" || o.type === "circle"
      )
      Streamlit.setComponentValue(filtered)
      //const h = containerRef.current?.clientHeight || canvasHeight
      Streamlit.setFrameHeight(canvasHeight + STREAMLIT_FRAME_PADDING)
    }

  const handleChange = useMemo(
    () => debounce(doChange, 250),
    [canvasHeight]
  )
    */

  //console.log("FOO BAR BAZ")

  return (
    <div ref={containerRef} style={{ display: "inline-block" }}>
      {/* — первый ряд: Классы + режимы */}
      <ClassSelector
        schema={annotationSchema}
        classId={classId}
        onSelect={handleClassSelect}
      />

      {/* — второй ряд: object_id input */}
      <ObjectIdInput
      value={objectId}
      onChange={setObjectId}
      onIncrement={incObjectId}
      onDecrement={decObjectId}
      filterEnabled={filterById}
      onFilterToggle={setFilterById}
      />

      <ModeSelector value={mode} onChange={setMode}/>

      {/* третий ряд: keypoints (только в режиме point) */}
      {mode === "point" && (
        <KeypointSelector
          keypoints={
            annotationSchema.find(x => x.bbox === classId).keypoints
          }
          selected={keypointName}
          onSelect={setKeypoint}
        />
      )}

      {/* — сам Canvas, прокидываем classColor и objectId */}
      <FabricCanvas
        width={canvasWidth}
        height={canvasHeight}
        backgroundImageURL={backgroundImageURL}
        mode={mode}
        classColor={classColor}    
        keypointColor={keypointColor}
        classId={classId}
        objectId={objectId}
        keypointName={keypointName}
        initialObjects={initialObjects}
        pointRadius={pointRadius}
        onChange={handleChange}
        filterById={filterById}
      />
    </div>
  )
}

export default withStreamlitConnection(App)
