import pymysql

def move_all_data():
    # MySQL 연결 설정
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='NewPassw0rd!',
        db='youtube_data',
        charset='utf8mb4'
    )
    
    try:
        with conn.cursor() as cursor:
            # 데이터 선택
            select_query = """
                SELECT id, title, description, tags, channel_id 
                FROM today_data
            """
            cursor.execute(select_query)
            rows = cursor.fetchall()
            
            if not rows:
                print("No data found in today_data")
                return

            # 중복 ID 필터링
            existing_ids_query = """
                SELECT id 
                FROM learn_data 
                WHERE id IN (%s)
            """ % ','.join(['%s'] * len(rows))
            existing_ids = [row[0] for row in rows]
            cursor.execute(existing_ids_query, existing_ids)
            existing_ids_set = set(row[0] for row in cursor.fetchall())
            
            rows_to_insert = [row for row in rows if row[0] not in existing_ids_set]
            
            if rows_to_insert:
                # 데이터 삽입
                insert_query = """
                    INSERT INTO learn_data (id, title, description, tags, channel_id)
                    VALUES (%s, %s, %s, %s, %s)
                """
                cursor.executemany(insert_query, rows_to_insert)
                
                # 원본 데이터 삭제
                ids_to_delete = [row[0] for row in rows_to_insert]
                delete_query = "DELETE FROM today_data WHERE id IN (%s)" % ','.join(['%s'] * len(ids_to_delete))
                cursor.execute(delete_query, ids_to_delete)
                
                # 커밋
                conn.commit()
                
                print(f"{len(rows_to_insert)} records moved successfully")
            else:
                print("No new records to move.")
            
            # 모든 데이터가 삭제되었는지 확인
            cursor.execute("SELECT COUNT(*) FROM today_data")
            count = cursor.fetchone()[0]
            if count == 0:
                print("today_data table is now empty.")
            else:
                print(f"today_data table still contains {count} records.")
                reset_table()  # 테이블 비우기
            
    except pymysql.MySQLError as e:
        print(f"Error: {e}")
        conn.rollback()
    
    finally:
        conn.close()

def reset_table():
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='NewPassw0rd!',
        db='youtube_data',
        charset='utf8mb4'
    )
    try:
        with conn.cursor() as cursor:
            delete_query = "DELETE FROM today_data"
            cursor.execute(delete_query)
            conn.commit()
            print("today_data table has been reset.")
    except pymysql.MySQLError as e:
        print(f"Error in reset_table: {e}")
        conn.rollback()
    finally:
        conn.close()

move_all_data()
