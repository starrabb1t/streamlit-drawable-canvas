import streamlit as st
from PIL import Image
from streamlit_drawable_canvas import st_canvas

bg = Image.open("image.png")  # ваш файл

mode = st.pills("Режим:", ["rect", "point"])
if mode is None:
    mode = "transform"

initial = [
  {"type":"rect",   "left":10, "top":20, "width":100, "height":50, "stroke":"red"},
  {"type":"circle", "left":200,"top":100,"width":10,  "height":10, "stroke":"blue"},
]

res = st_canvas(
    background_image=bg,
    color="cyan",
    drawing_mode=mode,
    key="mini",
    initial_objects=initial
)

st.json(res)