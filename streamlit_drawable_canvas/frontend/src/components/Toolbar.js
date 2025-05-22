import React from "react"
import deleteIcon  from "url:../img/delete.svg"
import resetIcon   from "url:../img/reset.svg"
import undoIcon    from "url:../img/undo.svg"
import redoIcon    from "url:../img/redo.svg"
import zoomInIcon  from "url:../img/zoom_in.svg"
import zoomOutIcon from "url:../img/zoom_out.svg"

export default function Toolbar({
  zoomIn,
  zoomOut,
  deleteSelected,
  undo,
  redo,
  reset,
}) {
  const style = {
    display:    "flex",
    gap:        8,
    marginTop:  8,
    alignItems: "center",
  }
  const btn = {
    cursor:     "pointer",
    width:      24,
    height:     24,
    background: "transparent",
    border:     "none",
  }

  return (
    <div style={style}>
      <button style={btn} onClick={zoomOut}>
        <img src={zoomOutIcon} alt="Zoom Out"/>
      </button>
      <button style={btn} onClick={zoomIn}>
        <img src={zoomInIcon} alt="Zoom In"/>
      </button>
      <button style={btn} onClick={undo}>
        <img src={undoIcon} alt="Undo"/>
      </button>
      <button style={btn} onClick={redo}>
        <img src={redoIcon} alt="Redo"/>
      </button>
      <button style={btn} onClick={deleteSelected}>
        <img src={deleteIcon} alt="Delete"/>
      </button>
      <button style={btn} onClick={reset}>
        <img src={resetIcon} alt="Reset"/>
      </button>
    </div>
  )
}