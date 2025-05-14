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
        "st_canvas", path=os.path.join(parent, "front/dist")
    )


def _image_to_data_url(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def st_canvas(
    background_image: Image.Image = None,
    color: str = "red",
    drawing_mode: str = "rect",
    height: int = 400,
    width: int = 600,
    key=None,
):
    """
    Минимальный canvas: рисование rect/point + transform.
    Возвращает список примитивов [{type,left,top,width,height,stroke},...]
    """
    bg_url = None
    if background_image is not None:
        bg_url = _image_to_data_url(background_image)

    # Вызов фронтенда
    objects = _st_canvas(
        backgroundImageURL=bg_url,
        color=color,
        drawingMode=drawing_mode,
        canvasWidth=width,
        canvasHeight=height,
        key=key,
    )

    if objects is None:
        return []

    # возвращаем сразу список словарей
    return objects