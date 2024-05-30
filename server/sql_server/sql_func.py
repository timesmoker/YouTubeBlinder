import pymysql
import json
import gzip
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError

conn = None
engine = None

def first_connect_sql():
    global conn, engine
    conn = pymysql.connect(host='localhost', user='root', password='NewPassw0rd!', db='youtube_data', charset='utf8mb4')
    engine = create_engine('mysql+pymysql://root:NewPassw0rd!@localhost/youtube_data')

def insert_data(table, video_id, video_title, description, tags, channel_id, category, topic, thumbnail):
    if not conn:
        print("Database connection is not established.")
        return

    cur = conn.cursor()
    try:
        if table == 'today':
                        
            insert_query = "INSERT INTO today_data (id, title, description, tags, channel_id, category, topic, thumbnail) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
            cur.execute(insert_query, (video_id, video_title, description, tags, channel_id, category, topic, thumbnail))
            conn.commit()
            print("Data inserted into today_data table")
        
        elif table == 'not_banned':

            insert_query = "INSERT INTO not_banned_data (id, title, description, tags, channel_id, category, topic, thumbnail) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
            cur.execute(insert_query, (video_id, video_title, description, tags, channel_id, category, topic, thumbnail))
            conn.commit()
            print("Data inserted into not_banned_data table")
              
    except pymysql.MySQLError as e:
        print(f"Error during database operation: {e}")
        conn.rollback()


def send_data(table, column):
    if table == "today_request":
        table = "today"
    elif table == "learn_request":
        table = "learn"
    elif table == "not_banned_request":
        table = "not_banned"

    if column == "all":
        query = f"SELECT * FROM {table}_data"
    else:
        query = f"SELECT {column} FROM {table}_data"
    

    try:
        df = pd.read_sql(query, engine)

        json_data = df.to_json(orient='records', force_ascii=False)
        if isinstance(json_data, str):
            json_data = json_data.encode('utf-8')

        compressed_data = gzip.compress(json_data)

        return compressed_data
    except SQLAlchemyError as e:
        print(f"Error during data retrieval or compression: {e}")
        raise

def close_db():
    global conn
    if conn:
        conn.close()
        print("Database connection closed")