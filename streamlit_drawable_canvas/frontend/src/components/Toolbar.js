import React from "react"
import deleteIcon  from "url:../img/delete.svg"
import resetIcon   from "url:../img/reset.svg"
import undoIcon    from "url:../img/undo.svg"
import redoIcon    from "url:../img/redo.svg"
import zoomInIcon  from "url:../img/zoom_in.svg"
import zoomOutIcon from "url:../img/zoom_out.svg"
import zoomResetIcon from "url:../img/zoom_reset.svg"
import saveIcon      from "url:../img/save.svg"

export default function Toolbar({
  zoomIn,
  zoomReset,
  zoomOut,
  deleteSelected,
  undo,
  redo,
  reset,
  save
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

  const sbtn = {
    cursor:     "pointer",
    width:      100,
    height:     36,
    border:     "none",
    //background: "rgb(0, 178, 110)",
    background:     "linear-gradient(-120deg,rgb(0, 178, 110) 0%,rgb(0, 145, 131) 100%)",
    marginLeft: "auto",
    borderRadius: "12px",
    padding: "3px",
    display:       "flex",
    alignItems:    "center",
    paddingLeft: "22px",
  }

  const stext = {
    color:      "#fff",
    alignContent: "centopter", 
    marginRight: "2px", 
    fontFamily: "Arial", 
    fontSize: "16px",
  }

  return (
    <div style={style}>
      <button style={btn} onClick={zoomOut}>
        <img src={zoomOutIcon} alt="Zoom Out"/>
      </button>
      <button style={btn} onClick={zoomReset}>
        <img src={zoomResetIcon} alt="Zoom Reset"/>
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

/*<button style={sbtn} onClick={save}>
  <span style={stext}>Save</span>
  <img src={saveIcon} alt="Save"/>
</button>*/