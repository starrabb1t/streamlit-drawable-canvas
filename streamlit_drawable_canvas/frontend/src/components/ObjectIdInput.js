// src/components/ObjectIdInput.js
import React from "react"

const containerStyle = {
  display:    "flex",
  alignItems: "center",
  gap:        "4px",
  paddingLeft: "10px",
  paddingBottom: "10px"
}

const btnStyle = {
  width:      24,
  height:     24,
  borderRadius: "50%",
  border :     "none",
  background: "#ccc",
  color:      "#fff",
  cursor:     "pointer",
  userSelect: "none",
}

const inputStyle = {
  width:      60,
  textAlign:  "center",
  borderRadius: "50vh",
  height:     20,
  border: "1px solid #ccc",
  color:      "#333",
}

export default function ObjectIdInput({
  value,
  min = 1,
  onChange,
  onIncrement,
  onDecrement,
}) {
  const handleInput = e => {
    const v = Math.max(min, Number(e.target.value) || min)
    onChange(v)
  }

  return (
    <div style={containerStyle}>
      <button style={btnStyle} onClick={() => onDecrement()}>
        –
      </button>
      <input
        type="number"
        min={min}
        value={value}
        onChange={handleInput}
        style={inputStyle}
      />
      <button style={btnStyle} onClick={() => onIncrement()}>
        +
      </button>
    </div>
  )
}