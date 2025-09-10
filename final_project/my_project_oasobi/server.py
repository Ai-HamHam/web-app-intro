from fastapi import FastAPI, Response
from fastapi.responses import HTMLResponse, PlainTextResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional

import sqlite3
import os
import uvicorn

app = FastAPI()

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "data.db")


class DataBase(BaseModel):
    id: Optional[int] = None
    value_1: str
    value_2: Optional[str] = None


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value_1 TEXT NOT NULL,
            value_2 TEXT
        )
        """
    )
    conn.commit()
    conn.close()


@app.get("/data", response_model=List[DataBase])
def read_data_items():
    conn = get_db_connection()
    items = conn.execute("SELECT * FROM data").fetchall()
    conn.close()
    return [DataBase(**dict(item)) for item in items]


@app.post("/data", response_model=DataBase, status_code=201)
def create_data_item(item: DataBase):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO data (value_1, value_2) VALUES (?, ?)",
        (item.value_1, item.value_2),
    )
    conn.commit()
    item_id = cursor.lastrowid
    conn.close()
    return DataBase(
        id=item_id,
        value_1=item.value_1,
        value_2=item.value_2,
    )


@app.put("/data/{item_id}", response_model=DataBase)
def update_data_item(item_id: int, item: DataBase):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE data SET value_1 = ?, value_2 = ? WHERE id = ?",
        (item.value_1, item.value_2, item_id),
    )
    conn.commit()
    conn.close()
    return DataBase(id=item_id, value_1=item.value_1, value_2=item.value_2)


@app.delete("/data/{item_id}", status_code=204)
def delete_data_item(item_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM data WHERE id = ?", (item_id,))
    conn.commit()
    conn.close()
    return Response(status_code=204)


# ここから下は書き換えない
@app.get("/", response_class=HTMLResponse)
async def read_html():
    html_file_path = os.path.join(BASE_DIR, "client.html")
    with open(html_file_path, "r", encoding="utf-8") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=200)


@app.get("/style.css")
def read_css():
    css_file_path = os.path.join(BASE_DIR, "style.css")
    with open(css_file_path, "r", encoding="utf-8") as f:
        css_content = f.read()
    return Response(content=css_content, media_type="text/css")


@app.get("/script.js", response_class=PlainTextResponse)
def read_js():
    js_file_path = os.path.join(BASE_DIR, "script.js")
    with open(js_file_path, "r", encoding="utf-8") as f:
        js_content = f.read()
    return PlainTextResponse(
        content=js_content, status_code=200, media_type="application/javascript"
    )


@app.get("/favicon.ico")
def read_favicon():
    favicon_path = os.path.join(BASE_DIR, "favicon.ico")
    with open(favicon_path, "rb") as f:
        favicon_content = f.read()
    return Response(content=favicon_content, media_type="image/x-icon")


@app.get("/images/mendako.png")
def get_mendako_image():
    image_path = os.path.join(BASE_DIR, "images", "mendako.png")
    return FileResponse(image_path, media_type="image/png")


if __name__ == "__main__":
    initialize_db()
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
