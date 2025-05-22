import React from "react"

const MODES = [
  { value: "transform", label: "Transform" },
  { value: "rect",      label: "Rectangle" },
  { value: "point",     label: "Point"     },
]

export default function ModeSelector({ value, onChange }) {
  const container = {
    display:      "flex",
    gap:          "4px",
    marginBottom: "10px",
    padding:      "10px",
  }
  const pillBase = {
    borderWidth:  "1px",
    borderStyle:  "solid",
    borderColor:  "#ccc",
    borderRadius: "50vh",
    background:   "#fff",
    cursor:       "pointer",
    userSelect:   "none",
    padding: "5px 10px",
    fontFamily: "Arial",
    fontSize: "14px"
  }
  const pillActive = {
    ...pillBase,
    background:  "#007bff",
    color:       "#fff",
    borderColor: "#007bff",
  }

  return (
    <div style={container}>
      {MODES.map(m => (
        <div
          key={m.value}
          style={value === m.value ? pillActive : pillBase}
          onClick={() => onChange(m.value)}
        >
          {m.label}
        </div>
      ))}
    </div>
  )
}