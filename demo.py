import streamlit as st
from PIL import Image
from streamlit_drawable_canvas import st_canvas
import json

images = ("image.png", "image.png")
index = st.selectbox("Выберите изображение:", images)

if type(index) == int:
    index = images[index]
print("FOO", index)

bg = Image.open(index)

with open("initial_objects.json", "r") as f:
    initial_objects = json.load(f)

#initial_objects = []

with open("annotation_schema.json", "r") as f:
    annotation_schema = json.load(f)

res = st_canvas(
    annotation_schema,
    background_image=bg,
    key=index,
    initial_objects=initial_objects
)

st.json(res, expanded=False)