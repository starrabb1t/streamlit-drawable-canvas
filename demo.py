import streamlit as st
from PIL import Image
from streamlit_drawable_canvas import st_canvas
from streamlit_container_width import st_container_width
import json
import time

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

img_width, img_height = bg.size
img_ratio = img_height / img_width

while True:
    try:
        width = st_container_width()["width"]
        break
    except:
        time.sleep(0.1)
        
#print("FOO", width)
height = int(width * img_ratio)

for obj in initial_objects:
    obj["left"] *= width
    obj["top"] *= height
    obj["width"] *= width
    obj["height"] *= height

objects = st_canvas(
    annotation_schema,
    background_image=bg,
    key=index,
    initial_objects=initial_objects,
    width=width,
    height=height,
)

for obj in objects:
    obj["left"] /= width
    obj["top"] /= height
    obj["width"] /= width
    obj["height"] /= height

st.json(objects, expanded=False)