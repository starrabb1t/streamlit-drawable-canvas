// src/components/ClassSelector.js
import React from "react"

const container = {
  display:      "flex",
  gap:          "4px",
  marginBottom: "10px",
  padding:      "0 10px 10px 10px",
}
const pillBase = {
  borderWidth:  "1px",
  borderStyle:  "solid",
  borderRadius: "50vh",
  background:   "#fff",
  cursor:       "pointer",
  userSelect:   "none",
  padding:      "5px 10px",
  fontFamily:   "Arial",
  fontSize:     "14px",
}

export default function ClassSelector({ schema }) {
  return (
    <div style={container}>
      {schema.map(item => {
        const color = item.color || "#ccc"
        return (
          <div
            key={item.bbox}
            style={{
              ...pillBase,
              borderColor: color,
              color:       color,
            }}
          >
            {item.bbox}
          </div>
        )
      })}
    </div>
  )
}