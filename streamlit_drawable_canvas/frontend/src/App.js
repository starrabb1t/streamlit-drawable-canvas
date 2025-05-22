// src/App.js
import React, { useState, useCallback, useEffect } from "react"
import { withStreamlitConnection, Streamlit } from "streamlit-component-lib"
import ClassSelector from "./components/ClassSelector"
import KeypointSelector from "./components/KeypointSelector"
import ModeSelector  from "./components/ModeSelector"
import FabricCanvas  from "./components/FabricCanvas"
import ObjectIdInput from "./components/ObjectIdInput"

const STREAMLIT_FRAME_PADDING = 150

function App({ args }) {
  const {
    backgroundImageURL,
    canvasWidth,
    canvasHeight,
    initialObjects = [],
    pointRadius,
  } = args

  // временная схема (потом придёт из Python)
  const annotationSchema = [
    {
      bbox: "person",
      color: "#66FFCC",
      keypoints: { nose: { color: "#FF6666" }, left_eye: { color: "#FF9966" } },
    },
    {
      bbox: "dog",
      color: "#FFAA00",
      keypoints: { head: { color: "#0000FF" }, tail: { color: "#00CCFF" } },
    },
  ]

  // 1) выбираем класс (по умолчанию первый)
  const [classId, setClassId] = useState(annotationSchema[0].bbox)
  const [classColor,   setClassColor]   = useState(annotationSchema[0].color)
  const handleClassSelect = cls => {
    setClassId(cls)
    const item = annotationSchema.find(x => x.bbox === cls)
    setClassColor(item.color)
  }

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
    ? annotationSchema
        .find(x => x.bbox === classId)
        .keypoints[keypointName].color
    : classColor

  // колбэк отправки в Python
  const handleChange = useCallback(
    objs => {
      Streamlit.setComponentValue(objs)
      Streamlit.setFrameHeight(canvasHeight + STREAMLIT_FRAME_PADDING)
    },
    [canvasHeight]
  )

  return (
    <div style={{ display: "inline-block" }}>
      {/* — первый ряд: Классы + режимы */}
      <ClassSelector
        schema={annotationSchema}
        classId={classId}
        onSelect={handleClassSelect}
      />
      <ModeSelector value={mode} onChange={setMode}/>

      {/* — второй ряд: object_id input */}
      <ObjectIdInput
        value={objectId}
        onChange={setObjectId}
        onIncrement={incObjectId}
        onDecrement={decObjectId}
      />

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
      />
    </div>
  )
}

export default withStreamlitConnection(App)