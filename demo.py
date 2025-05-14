import streamlit as st
from PIL import Image
from streamlit_drawable_canvas import st_canvas

bg = Image.open("image.png")  # ваш файл

mode = st.pills("Режим:", ["rect", "point"])
if mode is None:
    mode = "transform"

res = st_canvas(
    background_image=bg,
    color="cyan",
    drawing_mode=mode,
    key="mini",
)

st.json(res)