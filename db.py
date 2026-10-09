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
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    
    # Scan history table
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
            notes TEXT DEFAULT '',
            user_id INTEGER
        )
    """)
    
    # Check if user_id column exists in scan_history (for schema upgrades)
    cursor.execute("PRAGMA table_info(scan_history)")
    columns = [col["name"] for col in cursor.fetchall()]
    if "user_id" not in columns:
        cursor.execute("ALTER TABLE scan_history ADD COLUMN user_id INTEGER")

    # Temple bookmarks table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS temple_bookmarks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            temple_id TEXT NOT NULL,
            bookmarked INTEGER DEFAULT 0,
            user_id INTEGER,
            UNIQUE(temple_id, user_id)
        )
    """)
    
    conn.commit()
    conn.close()

# User Account Helpers
def create_user(name, email, password_hash):
    conn = get_connection()
    cursor = conn.cursor()
    timestamp = datetime.utcnow().isoformat() + "Z"
    try:
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, created_at)
            VALUES (?, ?, ?, ?)
        """, (name, email.strip().lower(), password_hash, timestamp))
        user_id = cursor.lastrowid
        conn.commit()
        return user_id
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def get_user_by_email(email):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "password_hash": row["password_hash"],
            "created_at": row["created_at"]
        }
    return None

def get_user_by_id(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "created_at": row["created_at"]
        }
    return None

def save_scan(filename, best_guess, confidence, predictions, image_b64=None, notes="", user_id=None):
    conn = get_connection()
    cursor = conn.cursor()
    timestamp = datetime.utcnow().isoformat() + "Z"
    cursor.execute("""
        INSERT INTO scan_history (timestamp, filename, best_guess, confidence, predictions_json, image_b64, bookmarked, notes, user_id)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    """, (
        timestamp,
        filename,
        best_guess,
        float(confidence),
        json.dumps(predictions),
        image_b64,
        notes,
        user_id
    ))
    scan_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return scan_id

def get_history(limit=50, deity=None, bookmarked_only=False, user_id=None):
    conn = get_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM scan_history WHERE 1=1"
    params = []
    
    if user_id is not None:
        query += " AND user_id = ?"
        params.append(user_id)
    else:
        query += " AND user_id IS NULL"

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
            "notes": r["notes"],
            "user_id": r["user_id"]
        })
    conn.close()
    return result

def toggle_bookmark(scan_id, user_id=None):
    conn = get_connection()
    cursor = conn.cursor()
    if user_id is not None:
        cursor.execute("UPDATE scan_history SET bookmarked = CASE WHEN bookmarked = 1 THEN 0 ELSE 1 END WHERE id = ? AND user_id = ?", (scan_id, user_id))
    else:
        cursor.execute("UPDATE scan_history SET bookmarked = CASE WHEN bookmarked = 1 THEN 0 ELSE 1 END WHERE id = ? AND user_id IS NULL", (scan_id,))
    
    cursor.execute("SELECT bookmarked FROM scan_history WHERE id = ?", (scan_id,))
    row = cursor.fetchone()
    conn.commit()
    conn.close()
    return bool(row["bookmarked"]) if row else None

# Temple bookmark helpers per user
def toggle_temple_bookmark(temple_id, user_id=None):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if record exists
    if user_id is not None:
        cursor.execute("SELECT bookmarked FROM temple_bookmarks WHERE temple_id = ? AND user_id = ?", (temple_id, user_id))
    else:
        cursor.execute("SELECT bookmarked FROM temple_bookmarks WHERE temple_id = ? AND user_id IS NULL", (temple_id,))
    
    row = cursor.fetchone()
    if row is None:
        new_state = 1
        if user_id is not None:
            cursor.execute("INSERT INTO temple_bookmarks (temple_id, bookmarked, user_id) VALUES (?, 1, ?)", (temple_id, user_id))
        else:
            cursor.execute("INSERT INTO temple_bookmarks (temple_id, bookmarked, user_id) VALUES (?, 1, NULL)", (temple_id,))
    else:
        new_state = 0 if row["bookmarked"] == 1 else 1
        if user_id is not None:
            cursor.execute("UPDATE temple_bookmarks SET bookmarked = ? WHERE temple_id = ? AND user_id = ?", (new_state, temple_id, user_id))
        else:
            cursor.execute("UPDATE temple_bookmarks SET bookmarked = ? WHERE temple_id = ? AND user_id IS NULL", (new_state, temple_id))
    
    conn.commit()
    conn.close()
    return bool(new_state)

def get_temple_bookmark_state(temple_id, user_id=None):
    conn = get_connection()
    cursor = conn.cursor()
    if user_id is not None:
        cursor.execute("SELECT bookmarked FROM temple_bookmarks WHERE temple_id = ? AND user_id = ?", (temple_id, user_id))
    else:
        cursor.execute("SELECT bookmarked FROM temple_bookmarks WHERE temple_id = ? AND user_id IS NULL", (temple_id,))
    row = cursor.fetchone()
    conn.close()
    return bool(row["bookmarked"]) if row else False

def delete_scan(scan_id, user_id=None):
    conn = get_connection()
    cursor = conn.cursor()
    if user_id is not None:
        cursor.execute("DELETE FROM scan_history WHERE id = ? AND user_id = ?", (scan_id, user_id))
    else:
        cursor.execute("DELETE FROM scan_history WHERE id = ? AND user_id IS NULL", (scan_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def get_stats(user_id=None):
    conn = get_connection()
    cursor = conn.cursor()
    
    if user_id is not None:
        cursor.execute("SELECT COUNT(*) as total_scans, AVG(confidence) as avg_confidence FROM scan_history WHERE user_id = ?", (user_id,))
    else:
        cursor.execute("SELECT COUNT(*) as total_scans, AVG(confidence) as avg_confidence FROM scan_history WHERE user_id IS NULL")
    
    overall = cursor.fetchone()
    total_scans = overall["total_scans"] if overall else 0
    avg_conf = overall["avg_confidence"] if (overall and overall["avg_confidence"] is not None) else 0.0
    avg_confidence = round(float(avg_conf), 2)

    if user_id is not None:
        cursor.execute("""
            SELECT best_guess, COUNT(*) as count, AVG(confidence) as avg_conf
            FROM scan_history
            WHERE user_id = ?
            GROUP BY best_guess
            ORDER BY count DESC
        """, (user_id,))
    else:
        cursor.execute("""
            SELECT best_guess, COUNT(*) as count, AVG(confidence) as avg_conf
            FROM scan_history
            WHERE user_id IS NULL
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

    if user_id is not None:
        cursor.execute("SELECT COUNT(*) as bookmarks FROM scan_history WHERE bookmarked = 1 AND user_id = ?", (user_id,))
    else:
        cursor.execute("SELECT COUNT(*) as bookmarks FROM scan_history WHERE bookmarked = 1 AND user_id IS NULL")
        
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
