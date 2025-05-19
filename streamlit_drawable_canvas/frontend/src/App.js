import React, { useCallback } from "react"
import { withStreamlitConnection, Streamlit } from "streamlit-component-lib"
import FabricCanvas from "./FabricCanvas"

function App({ args }) {
  const {
    backgroundImageURL,
    color,
    drawingMode,
    canvasWidth,
    canvasHeight,
    initialObjects = [],
    pointRadius,
  } = args

  // колбэк, который принимает текущий список объектов и
  // шлёт его в Python + подгоняет высоту iframe
  const handleChange = useCallback(
    objs => {
      Streamlit.setComponentValue(objs)
      // зарезервируем 40px под тулбар
      Streamlit.setFrameHeight(canvasHeight + 40)
    },
    [canvasHeight]
  )

  return (
    <div style={{ display: "inline-block" }}>
      <FabricCanvas
        width={canvasWidth}
        height={canvasHeight}
        backgroundImageURL={backgroundImageURL}
        mode={drawingMode}
        color={color}
        initialObjects={initialObjects}
        pointRadius={pointRadius}
        onChange={handleChange}
      />
    </div>
  )
}

export default withStreamlitConnection(App)