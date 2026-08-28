import json
import sqlite3
import os
import time
from pathlib import Path

from flask import Flask, jsonify, request
from flask_cors import CORS

DB_DIR = Path(__file__).parent / "data"
DB_PATH = DB_DIR / "imonwork.sqlite3"

app = Flask(__name__)
CORS(app)

ROW_ID = 1


def init_db():
    DB_DIR.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS state (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                data TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


@app.get("/api/state")
def get_state():
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute("SELECT data FROM state WHERE id = ?", (ROW_ID,)).fetchone()
    if row is None:
        return jsonify(data=None)
    return jsonify(data=json.loads(row[0]))


@app.put("/api/state")
def put_state():
    payload = request.get_json(silent=True)
    if payload is None:
        return jsonify(error="invalid JSON body"), 400

    data = json.dumps(payload, ensure_ascii=False)
    updated_at = time.strftime("%Y-%m-%dT%H:%M:%S")
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO state (id, data, updated_at) VALUES (?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
            """,
            (ROW_ID, data, updated_at),
        )
        conn.commit()
    return jsonify(ok=True)


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="127.0.0.1", port=port, debug=True)
