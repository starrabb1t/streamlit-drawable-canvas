# test_app.py
import streamlit as st
from streamlit_drawable_canvas import st_canvas

st.title("🖌 Dev-test для streamlit-drawable-canvas")

# Настройки канваса
drawing_mode = st.sidebar.selectbox(
    "Drawing tool:", ("freedraw", "line", "rect", "circle", "transform", "polygon")
)
stroke_width = st.sidebar.slider("Stroke width:", 1, 25, 3)
stroke_color = st.sidebar.color_picker("Stroke color:", "#000000")
bg_color     = st.sidebar.color_picker("Background color:", "#ffffff")
realtime     = st.sidebar.checkbox("Realtime update", True)

# Сам Canvas
canvas_result = st_canvas(
    fill_color="rgba(255, 0, 0, 0.3)",
    stroke_width=stroke_width,
    stroke_color=stroke_color,
    background_color=bg_color,
    height=400,
    width=600,
    drawing_mode=drawing_mode,
    update_streamlit=realtime,
    key="dev_canvas",
)

# Показываем вывод
if canvas_result.image_data is not None:
    st.image(canvas_result.image_data, caption="Растеризованное изображение")
if canvas_result.json_data is not None:
    st.write("JSON data:", canvas_result.json_data)