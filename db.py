import os
import json
import sqlite3
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "deity_app.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS scan_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            filename TEXT,
            best_guess TEXT NOT NULL,
            confidence REAL NOT NULL,
            predictions_json TEXT NOT NULL,
            image_b64 TEXT,
            bookmarked INTEGER DEFAULT 0,
            notes TEXT DEFAULT ''
        )
    """)
    # New table for temple bookmarks (persistent per user)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS temple_bookmarks (
            temple_id TEXT PRIMARY KEY,
            bookmarked INTEGER DEFAULT 0
        )
    """)
    conn.commit()
    conn.close()

def save_scan(filename, best_guess, confidence, predictions, image_b64=None, notes=""):
    conn = get_connection()
    cursor = conn.cursor()
    timestamp = datetime.utcnow().isoformat() + "Z"
    cursor.execute("""
        INSERT INTO scan_history (timestamp, filename, best_guess, confidence, predictions_json, image_b64, bookmarked, notes)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    """, (
        timestamp,
        filename,
        best_guess,
        float(confidence),
        json.dumps(predictions),
        image_b64,
        notes
    ))
    scan_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return scan_id

def get_history(limit=50, deity=None, bookmarked_only=False):
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM scan_history WHERE 1=1"
    params = []
    if deity:
        query += " AND LOWER(best_guess) = LOWER(?)"
        params.append(deity)
    if bookmarked_only:
        query += " AND bookmarked = 1"
    query += " ORDER BY id DESC LIMIT ?"
    params.append(limit)
    
    rows = cursor.execute(query, params).fetchall()
    result = []
    for r in rows:
        result.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "filename": r["filename"],
            "best_guess": r["best_guess"],
            "confidence": r["confidence"],
            "predictions": json.loads(r["predictions_json"]) if r["predictions_json"] else [],
            "image_b64": r["image_b64"],
            "bookmarked": bool(r["bookmarked"]),
            "notes": r["notes"]
        })
    conn.close()
    return result

def toggle_bookmark(scan_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE scan_history SET bookmarked = CASE WHEN bookmarked = 1 THEN 0 ELSE 1 END WHERE id = ?", (scan_id,))
    cursor.execute("SELECT bookmarked FROM scan_history WHERE id = ?", (scan_id,))
    row = cursor.fetchone()
    conn.commit()
    conn.close()
    return bool(row["bookmarked"]) if row else None

# Temple bookmark helpers
def toggle_temple_bookmark(temple_id):
    conn = get_connection()
    cursor = conn.cursor()
    # Insert row if not exists
    cursor.execute("INSERT OR IGNORE INTO temple_bookmarks (temple_id, bookmarked) VALUES (?, 0)", (temple_id,))
    # Toggle
    cursor.execute("UPDATE temple_bookmarks SET bookmarked = CASE WHEN bookmarked = 1 THEN 0 ELSE 1 END WHERE temple_id = ?", (temple_id,))
    cursor.execute("SELECT bookmarked FROM temple_bookmarks WHERE temple_id = ?", (temple_id,))
    row = cursor.fetchone()
    conn.commit()
    conn.close()
    return bool(row["bookmarked"]) if row else False

def get_temple_bookmark_state(temple_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT bookmarked FROM temple_bookmarks WHERE temple_id = ?", (temple_id,))
    row = cursor.fetchone()
    conn.close()
    return bool(row["bookmarked"]) if row else False

def delete_scan(scan_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scan_history WHERE id = ?", (scan_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def get_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as total_scans, AVG(confidence) as avg_confidence FROM scan_history")
    overall = cursor.fetchone()
    total_scans = overall["total_scans"] if overall else 0
    avg_conf = overall["avg_confidence"] if (overall and overall["avg_confidence"] is not None) else 0.0
    avg_confidence = round(float(avg_conf), 2)

    cursor.execute("""
        SELECT best_guess, COUNT(*) as count, AVG(confidence) as avg_conf
        FROM scan_history
        GROUP BY best_guess
        ORDER BY count DESC
    """)
    breakdown = []
    for row in cursor.fetchall():
        breakdown.append({
            "deity": row["best_guess"],
            "count": row["count"],
            "avg_confidence": round(float(row["avg_conf"]), 2) if row["avg_conf"] else 0.0
        })

    cursor.execute("SELECT COUNT(*) as bookmarks FROM scan_history WHERE bookmarked = 1")
    bm_row = cursor.fetchone()
    bookmarks_count = bm_row["bookmarks"] if bm_row else 0

    conn.close()
    return {
        "total_scans": total_scans,
        "avg_confidence": avg_confidence,
        "bookmarked_count": bookmarks_count,
        "distribution": breakdown,
        "most_scanned": breakdown[0]["deity"] if breakdown else "N/A"
    }

# Initialize on import
init_db()
