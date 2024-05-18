import pymysql

conn = None

#여기에서 유튜브 API까지 

def first_connect_sql():
    global conn
    conn = pymysql.connect(host='localhost', user='root', password='NewP@ssw0rd!', db='youtube_data', charset='utf8mb4')

def insert_data(id, title):
    #여기에서 유튜브 API를 이용해 영상소개를 가져오는 작업을 거침..?
    # info 임시용
    info = '1'

    cur = conn.cursor()
    try:
        insert_query = "INSERT INTO today_data (id, title) VALUES (%s, %s)"
        cur.execute(insert_query, (id, title))
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")
    
    try:
        insert_query = "INSERT INTO learn_title (id, title) VALUES (%s, %s)"
        cur.execute(insert_query, (id, title))
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")

    try:
        insert_query = "INSERT INTO learn_info (id, info) VALUES (%s, %s)"
        cur.execute(insert_query, (id, info))
        conn.commit()
    except Exception as e:
        print(f"Error: {e}")

def close_db():
    
    conn.close()