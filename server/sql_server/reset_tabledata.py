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
                SELECT id, title, description, tags, channel_id, category, topic, thumbnail
                FROM today_data
            """
            cursor.execute(select_query)
            rows = cursor.fetchall()
            
            if not rows:
                print("No data found in today_data")
                return

            for row in rows:
                id, title, description, tags, channel_id, category, topic, thumbnail = row
                
                # 기존 데이터 확인
                existing_record_query = """
                    SELECT description, tags, channel_id, category, topic, thumbnail 
                    FROM learn_data 
                    WHERE id = %s AND title = %s
                """
                cursor.execute(existing_record_query, (id, title))
                existing_record = cursor.fetchone()
                
                if existing_record:
                    # 기존 데이터와 비교하여 동일한 경우 넘어가기
                    if (description, tags, channel_id, category, topic, thumbnail) == existing_record:
                        print(f"Record with id {id} already exists with the same data. Skipping insertion.")
                    else:
                        # 태그나 카테고리가 없는 경우 업데이트
                        update_query = """
                            UPDATE learn_data
                            SET description = %s, tags = %s, channel_id = %s, category = %s, topic = %s, thumbnail = %s
                            WHERE id = %s AND title = %s
                        """
                        cursor.execute(update_query, (description, tags, channel_id, category, topic, thumbnail, id, title))
                        print(f"Record with id {id} updated.")
                else:
                    # 새로운 데이터 삽입
                    insert_query = """
                        INSERT INTO learn_data (id, title, description, tags, channel_id, category, topic, thumbnail)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    cursor.execute(insert_query, (id, title, description, tags, channel_id, category, topic, thumbnail))
                    print(f"Record with id {id} inserted.")
                
                # 원본 데이터 삭제
                delete_query = "DELETE FROM today_data WHERE id = %s"
                cursor.execute(delete_query, (id,))
            
            conn.commit()
            print("All data moved successfully.")
            
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
