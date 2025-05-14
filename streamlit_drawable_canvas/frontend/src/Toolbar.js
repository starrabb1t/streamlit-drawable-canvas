import React from "react"
import deleteIconUrl  from "url:./img/delete.svg"
import zoomInIconUrl  from "url:./img/zoom_in.svg"
import zoomOutIconUrl from "url:./img/zoom_out.svg"

const Toolbar = ({ canvas, sendBack, zoomIn, zoomOut }) => {
  if (!canvas) return null

  const handleDelete = () => {
    const active = canvas.getActiveObjects()
    active.forEach(o => canvas.remove(o))
    canvas.discardActiveObject()
    canvas.requestRenderAll()
    sendBack()
  }

  const style = {
    display: "flex",
    gap: 8,
    marginTop: 8,
    alignItems: "center",
  }
  const iconStyle = { cursor: "pointer", width: 24, height: 24 }

  return (
    <div style={style}>
      <img
        src={zoomInIconUrl}
        alt="Zoom In"
        title="Zoom In"
        style={iconStyle}
        onClick={zoomIn}
      />
      <img
        src={zoomOutIconUrl}
        alt="Zoom Out"
        title="Zoom Out"
        style={iconStyle}
        onClick={zoomOut}
      />
      <img
        src={deleteIconUrl}
        alt="Delete"
        title="Delete selected"
        style={iconStyle}
        onClick={handleDelete}
      />
    </div>
  )
}

export default Toolbar