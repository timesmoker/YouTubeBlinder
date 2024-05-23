import pymysql

def reset_table():
    conn = pymysql.connect(host='localhost', user='root', password='NewPassw0rd!', db='youtube_data', charset='utf8mb4')
    cur = conn.cursor()
    
    try:
        # 테이블의 모든 데이터 삭제
        reset_query = "DELETE FROM today_data;"
        cur.execute(reset_query)
        conn.commit()
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    reset_table()
