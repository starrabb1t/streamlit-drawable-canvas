import streamlit as st
from PIL import Image
from streamlit_drawable_canvas import st_canvas

images = ("image2.png", "image.png")
index = st.selectbox("Выберите изображение:", images)

if type(index) == int:
    index = images[index]
print("FOO", index)

bg = Image.open(index)

initial = [
  {"type":"rect",   "left":10, "top":20, "width":100, "height":50, "stroke":"red"},
  {"type":"circle", "left":200,"top":100,"width":10,  "height":10, "stroke":"blue"},
]

annotation_schema = [   
    {
        "bbox" : "person",
        "color" : "#66FFCC",
        "keypoints": {
            "nose": {
                "color": "#FF6666"
            },
            "left_eye": {
                "color": "#FF9966"
            },
            "right_eye": {
                "color": "#FFCC66"
            }
        }
    }
]

initial = []

res = st_canvas(
    annotation_schema,
    background_image=bg,
    color="cyan",
    key=index,
    initial_objects=initial
)

st.json(res, expanded=False)