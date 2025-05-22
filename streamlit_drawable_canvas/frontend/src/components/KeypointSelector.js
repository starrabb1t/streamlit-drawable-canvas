import React from "react"

const container = {
  display:      "flex",
  gap:          "6px",
  margin:       "0 10px 10px 10px",
  flexWrap:     "wrap",
}

const pillBase = {
  borderWidth:  "1px",
  borderStyle:  "solid",
  borderRadius: "50vh",
  background:   "#fff",
  cursor:       "pointer",
  userSelect:   "none",
  padding:      "4px 8px",
  fontFamily:   "Arial",
  fontSize:     "13px",
}

const pillActive = {
  ...pillBase,
  background:  "#333",
  color:       "#fff",
}

export default function KeypointSelector({
  keypoints,      // { name: { color } }
  selected,       // string | null
  onSelect,       // fn(name)
}) {
  return (
    <div style={container}>
      {Object.entries(keypoints).map(([name, { color }]) => {
        const active = name === selected
        return (
          <div
            key={name}
            onClick={() => onSelect(active ? null : name)}
            style={{
              ...(active ? pillActive : pillBase),
              borderColor:  color,
              color:        active ? "#fff" : color,
              background:   active ? color : "#fff",
            }}
          >
            {name}
          </div>
        )
      })}
    </div>
  )
}