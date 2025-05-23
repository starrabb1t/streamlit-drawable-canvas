import React from "react"

// утилита, считающая яркость цвета и возвращающая "light" или "dark"
function getLuminance(hex) {
  const c = hex.replace("#", "")
  const [r,g,b] = [0,2,4].map(i => parseInt(c.substr(i,2),16)/255)
  // простая формула яркости
  return 0.299*r + 0.587*g + 0.114*b
}

// затемнить hex-цвет на долю amt (0…1)
function darken(hex, amt = 0.2) {
  const c = hex.replace("#","")
  let out = "#"
  for (let i = 0; i < 3; i++) {
    const val = parseInt(c.substr(i*2,2), 16)
    // уменьшаем яркость и округляем
    const v = Math.round(Math.max(0, Math.min(255, val * (1 - amt))))
    out += v.toString(16).padStart(2, "0")
  }
  return out
}

function pickTextColor(bgHex) {

  let darken_color = darken(bgHex)
  console.log(bgHex, darken_color)

  return getLuminance(bgHex) > 0.8 ? darken_color : bgHex
}

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
  fontSize:     "13px"
}

const pillActive = {
  ...pillBase,
  background:  "#333",
  color:       "#fff",
}

const textDesc = { 
  alignContent: "center", 
  marginRight: "10px", 
  fontFamily: "Arial", 
  fontSize: "12px" 
}

export default function KeypointSelector({
  keypoints,      // { name: { color } }
  selected,       // string | null
  onSelect,       // fn(name)
}) {
  return (
    <div style={container}>
      <span style={textDesc}>Keypoints:</span>
      {Object.entries(keypoints).map(([name, { color }]) => {
        color = pickTextColor(color)
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