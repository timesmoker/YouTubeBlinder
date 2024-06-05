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

            # 중복 ID 및 제목 필터링
            existing_ids_query = """
                SELECT id, title, tags, category 
                FROM learn_data 
                WHERE id IN (%s)
            """ % ','.join(['%s'] * len(rows))
            existing_ids = [row[0] for row in rows]
            cursor.execute(existing_ids_query, existing_ids)
            existing_records = cursor.fetchall()
            
            existing_records_dict = {(row[0], row[1]): (row[2], row[3]) for row in existing_records}
            
            rows_to_insert = []
            rows_to_update = []

            for row in rows:
                key = (row[0], row[1])
                if key in existing_records_dict:
                    # 기존 레코드와 비교하여 태그나 카테고리가 없는 경우 업데이트 리스트에 추가
                    if not existing_records_dict[key][0] or not existing_records_dict[key][1]:
                        rows_to_update.append(row)
                else:
                    rows_to_insert.append(row)
            
            if rows_to_insert:
                # 데이터 삽입
                insert_query = """
                    INSERT INTO learn_data (id, title, description, tags, channel_id, category, topic, thumbnail)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.executemany(insert_query, rows_to_insert)

            if rows_to_update:
                # 데이터 업데이트
                update_query = """
                    UPDATE learn_data
                    SET description = %s, tags = %s, channel_id = %s, category = %s, topic = %s, thumbnail = %s
                    WHERE id = %s AND title = %s
                """
                update_data = [(row[2], row[3], row[4], row[5], row[6], row[7], row[0], row[1]) for row in rows_to_update]
                cursor.executemany(update_query, update_data)

            if rows_to_insert or rows_to_update:
                # 원본 데이터 삭제
                ids_to_delete = [row[0] for row in rows_to_insert + rows_to_update]
                delete_query = "DELETE FROM today_data WHERE id IN (%s)" % ','.join(['%s'] * len(ids_to_delete))
                cursor.execute(delete_query, ids_to_delete)
                
                # 커밋
                conn.commit()
                
                print(f"{len(rows_to_insert)} records inserted and {len(rows_to_update)} records updated successfully")
            else:
                print("No new records to move or update.")
            
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
