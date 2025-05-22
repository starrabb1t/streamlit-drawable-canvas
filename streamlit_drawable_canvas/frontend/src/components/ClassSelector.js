// src/components/ClassSelector.js
import React from "react"

const container = {
  display:      "flex",
  gap:          "4px",
  paddingLeft: "10px",
  paddingBottom: "10px"
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

export default function ClassSelector({ schema, classId, onSelect }) {
  return (
    <div style={container}>
      {schema.map(item => {
        const active = item.bbox === classId
        return (
          <div
            key={item.bbox}
            onClick={() => onSelect(item.bbox)}
            style={{
              ...pillBase,
              borderColor: item.color,
              color:       active ? "#fff" : item.color,
              background:  active ? item.color : "#fff",
            }}
          >
            {item.bbox}
          </div>
        )
      })}
    </div>
  )
}