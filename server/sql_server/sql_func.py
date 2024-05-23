import pymysql

conn = None

def first_connect_sql():
    global conn
    conn = pymysql.connect(host='localhost', user='root', password='NewPassw0rd!', db='youtube_data', charset='utf8mb4')

def insert_data(table, video_id, video_title, video_info):
    if not conn:
        print("Database connection is not established.")
        return

    cur = conn.cursor()
    try:
        if table == 'today':
            # ID가 today_data 테이블에 존재하는지 확인
            check_query = "SELECT COUNT(*) FROM today_data WHERE id = %s"
            cur.execute(check_query, (video_id,))
            result = cur.fetchone()
            count = result[0]
        
            if count == 0:
                # ID가 존재하지 않으면 데이터를 삽입
                insert_query = "INSERT INTO today_data (id, title, info) VALUES (%s, %s, %s)"
                cur.execute(insert_query, (video_id, video_title, video_info))
                conn.commit()
                print("Data inserted into today_data table")
            else:
                print("ID already exists in today_data table.")
        else:
            # ID가 learn_data 테이블에 존재하는지 확인
            check_query = "SELECT COUNT(*) FROM learn_data WHERE id = %s"
            cur.execute(check_query, (video_id,))
            result = cur.fetchone()
            count = result[0]
        
            if count == 0:
                # ID가 존재하지 않으면 데이터를 삽입
                insert_query = "INSERT INTO learn_data (id, title, info) VALUES (%s, %s, %s)"
                cur.execute(insert_query, (video_id, video_title, video_info))
                conn.commit()
                print("Data inserted into learn_data table")
            else:
                print("ID already exists in learn_data table.")
    except pymysql.MySQLError as e:
        print(f"Error during database operation: {e}")
        conn.rollback()

def close_db():
    global conn
    if conn:
        conn.close()
        print("Database connection closed")