import pymysql
from googleapiclient.discovery import build

conn = None

def first_connect_sql():
    global conn
    conn = pymysql.connect(host='localhost', user='root', password='NewP@ssw0rd!', db='youtube_data', charset='utf8mb4')

def insert_data(id, title):
    cur = conn.cursor()
    try:
        # 데이터 삽입
        insert_query = "INSERT INTO today_data (id, title) VALUES (%s, %s)"
        cur.execute(insert_query, (id, title))
        conn.commit()
    except Exception as e:
        print(f"Error inserting into today_data: {e}")
        conn.rollback()

    try:
        # ID가 learn_title 테이블에 존재하는지 확인
        check_query = "SELECT COUNT(*) FROM learn_title WHERE id = %s"
        cur.execute(check_query, (id,))
        result = cur.fetchone()
        count = result[0]
    
        if count == 0:
            info = take_info(id)

            if info:
                # ID가 존재하지 않으면 데이터를 삽입
                try:
                    insert_query_title = "INSERT INTO learn_title (id, title) VALUES (%s, %s)"
                    cur.execute(insert_query_title, (id, title))
                    conn.commit()
                except Exception as e:
                    print(f"Error inserting into learn_title: {e}")
                    conn.rollback()

                try:
                    insert_query_info = "INSERT INTO learn_info (id, info) VALUES (%s, %s)"
                    cur.execute(insert_query_info, (id, info))
                    conn.commit()
                except Exception as e:
                    print(f"Error inserting into learn_info: {e}")
                    conn.rollback()
            else:
                print("No info retrieved from YouTube API.")
        else:
            print("ID already exists in learn_title table.")
    except Exception as e:
        print(f"Error checking ID existence: {e}")
        conn.rollback()
    finally:
        cur.close()

def take_info(id):
    try:
        # YouTube API 서비스 객체 생성
        print(f"Retrieving info for id={id} from YouTube API")
        youtube = build('youtube', 'v3', developerKey='AIzaSyBISbfDtzcCB96t9hn9mhoOqiaud2XvYZk')

        # 영상 정보를 가져오는 API 요청
        request = youtube.videos().list(
            part='snippet',
            id=id
        )
        response = request.execute()

        # 영상 설명 추출
        if 'items' in response and len(response['items']) > 0:
            video_description = response['items'][0]['snippet']['description']
            print(f"Video description retrieved: {video_description}")
            return video_description
        else:
            print("No video description found.")
            return None
    except Exception as e:
        print(f"Error in take_info: {e}")
        return None

def close_db():
    global conn
    if conn:
        conn.close()