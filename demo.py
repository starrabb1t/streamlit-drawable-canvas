# test_app.py
import streamlit as st
from streamlit_drawable_canvas import st_canvas
from PIL import Image

st.title("streamlit-drawable-canvas")

# Настройки канваса
drawing_mode = st.sidebar.pills(
    "Drawing tool:", ("box", "keypoint")
)

modes = {
    "box": "rect",
    "keypoint": "point",
}

if drawing_mode:
    drawing_mode = modes[drawing_mode]
else:
    drawing_mode = "transform"

stroke_width = 3 #st.sidebar.slider("Stroke width:", 1, 25, 3)
stroke_color = "#000000" #st.sidebar.color_picker("Stroke color:", "#000000")
bg_color     = "#ffffff" #st.sidebar.color_picker("Background color:", "#ffffff")
realtime     = True #st.sidebar.checkbox("Realtime update", True)

# open image
img = Image.open("image.png")
width, height = img.size

# Сам Canvas
canvas_result = st_canvas(
    #fill_color=bg_color,
    stroke_width=stroke_width,
    stroke_color=stroke_color,
    #background_color=bg_color,
    background_image=img,
    drawing_mode=drawing_mode,
    update_streamlit=realtime,
    key="dev_canvas",
    width=width//2,
    height=height//2,
    point_display_radius=3,
    display_toolbar=True
)

# Показываем вывод
#if canvas_result.image_data is not None:
#    st.image(canvas_result.image_data, caption="Растеризованное изображение")
#if canvas_result.json_data is not None:
#    st.write("JSON data:", canvas_result.json_data)