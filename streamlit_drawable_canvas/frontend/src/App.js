import React, { useState, useCallback } from "react"
import { withStreamlitConnection, Streamlit } from "streamlit-component-lib"
import ModeSelector from "./components/ModeSelector"
import FabricCanvas from "./components/FabricCanvas"

const STREAMLIT_FRAME_PADDING = 100

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