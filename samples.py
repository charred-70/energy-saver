import sqlite3
import hashlib

conn=sqlite3.connect('userdata.db')
cur = conn.cursor()

cur.execute("""CREATE TABLE IF NOT EXISTS userdata 
               (
            id INTEGER PRIMARY KEY, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL)""")

username3, password3 = "admin", hashlib.sha256("password".encode()).hexdigest()
cur.execute("INSERT INTO userdata (username, password) VALUES (?, ?)", (username3, password3))
conn.commit()