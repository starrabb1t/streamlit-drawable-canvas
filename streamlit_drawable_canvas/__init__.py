import base64
import io
import os
import streamlit as st
import streamlit.components.v1 as components
from PIL import Image

_RELEASE = False

if not _RELEASE:
    _st_canvas = components.declare_component(
        "st_canvas", url="http://localhost:3001"
    )
else:
    parent = os.path.dirname(__file__)
    _st_canvas = components.declare_component(
        "st_canvas", path=os.path.join(parent, "frontend/dist")
    )


def _image_to_data_url(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def st_canvas(
    background_image: Image.Image = None,
    color: str = "red",
    drawing_mode: str = "rect",
    height: int = 360, #TODO
    width: int = 640,
    initial_objects: list[dict] = None,   # <-- добавили сюда
    pointRadius = 3,
    key=None,
):
    """
    Минимальный canvas: рисование rect/point + transform.
    Возвращает список примитивов [{type,left,top,width,height,stroke},...]
    """
    bg_url = None
    if background_image is not None:
        bg_url = _image_to_data_url(background_image)

    # если не передали — пустой список
    initial_objects = initial_objects or []

    # вызываем компонент, передаём initialObjects
    objs = _st_canvas(
        backgroundImageURL=bg_url,
        color=color,
        drawingMode=drawing_mode,
        canvasWidth=width,
        canvasHeight=height,
        initialObjects=initial_objects,   
        pointRadius = pointRadius,
        key=key,
    )

    # если ещё не нажали ничего
    if objs is None:
        return []

    # возвращаем сразу список с полями id и т.д.
    return objs