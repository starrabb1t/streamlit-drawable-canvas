import React, { useState, useCallback } from "react"
import { withStreamlitConnection, Streamlit } from "streamlit-component-lib"
import ModeSelector from "./components/ModeSelector"
import ClassSelector from "./components/ClassSelector"
import FabricCanvas from "./components/FabricCanvas"

const STREAMLIT_FRAME_PADDING = 150

function App({ args }) {
  const {
    backgroundImageURL,
    color,
    canvasWidth,
    canvasHeight,
    initialObjects = [],
    pointRadius,
    // drawingMode,   // больше не берём из Streamlit
  } = args

  // Временный dummy-схема, потом придёт из Python
  const annotationSchema = [
    {
      bbox: "person",
      color: "#66FFCC",
      keypoints: {
        nose:       { color: "#FF6666" },
        left_eye:   { color: "#FF9966" },
        right_eye:  { color: "#FFCC66" },
      },
    },
    {
      bbox: "dog",
      color: "#FFAA00",
      keypoints: {
        head:      { color: "#0000FF" },
        tail:      { color: "#00CCFF" },
      },
    },
  ]

  // Локальный state для режима
  const [mode, setMode] = useState("transform")

  // колбэк отправки списка объектов в Python
  const handleChange = useCallback(
    objs => {
      Streamlit.setComponentValue(objs)
      Streamlit.setFrameHeight(canvasHeight + STREAMLIT_FRAME_PADDING)
    },
    [canvasHeight]
  )

  return (
    <div style={{ display: "inline-block" }}>
      {/* Наши «пиллы» */}
      <ModeSelector value={mode} onChange={setMode} />

      {/* строка #2: список классов из нашей схемы */}
      <ClassSelector schema={annotationSchema} />

      {/* Канвас, которому передаём режим из React state */}
      <FabricCanvas
        width={canvasWidth}
        height={canvasHeight}
        backgroundImageURL={backgroundImageURL}
        mode={mode}
        color={color}
        initialObjects={initialObjects}
        pointRadius={pointRadius}
        onChange={handleChange}
      />
    </div>
  )
}

export default withStreamlitConnection(App)