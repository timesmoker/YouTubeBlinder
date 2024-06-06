import socket
import json
import sql_func as sql  # 'sql_func' 모듈을 사용하여 SQL 함수 호출
import time
import gzip
from threading import Timer

def start_server():
    host = "0.0.0.0"
    port = 8870

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((host, port))
    server_socket.listen(5)
    sql.first_connect_sql()
    print(f"서버가 {host}:{port}에서 대기 중입니다...")

    def reset_connection_periodically():
        sql.reset_connection()
        Timer(3600, reset_connection_periodically).start()  # 1시간(3600초)마다 연결 재설정

    # 주기적 연결 재설정 시작
    Timer(3600, reset_connection_periodically).start()

    try:
        while True:
            client_socket, client_address = server_socket.accept()
            print(f"클라이언트 {client_address}가 연결되었습니다.")
            
            try:
                data = client_socket.recv(10240)
                if not data:
                    continue

                try:
                    data = gzip.decompress(data).decode("utf-8")
                    request_data = json.loads(data)
                    table = request_data.get("table")
                    video_id = request_data.get("video_id")
                    title = request_data.get("title")
                    description = request_data.get("description")
                    category = request_data.get("category")
                    topic = request_data.get("topic")
                    tags = request_data.get("tags")
                    thumbnail = request_data.get("thumbnail")
                    column = request_data.get("column")
                    channel_id = request_data.get("channel_id")

                    
                    tags = str(tags)

                    if (table == "today" or table == "not_banned"):
                        try:
                            sql.insert_data(table, video_id, title, description, tags, channel_id, category, topic, thumbnail)

                            # 성공 응답 전송
                            response_message = {
                                "status": "success",
                                "message": f"Data for video_id {video_id} successfully inserted into table {table}."
                            }
                            client_socket.sendall(json.dumps(response_message).encode('utf-8'))
                        except Exception as e:
                            # 실패 응답 전송
                            response_message = {
                                "status": "error",
                                "message": str(e)
                            }
                            client_socket.sendall(json.dumps(response_message).encode('utf-8'))
                        
                    elif (table == "today_request" or table == "learn_request" or table == "not_banned_request"):
                        # sql에서 데이터 가져오기
                        response = sql.send_data(table, column)

                        # 데이터 길이 보내기
                        data_length = len(response)
                        client_socket.sendall(data_length.to_bytes(8, 'big'))

                        # 데이터를 20MB 청크로 나누어 전송
                        chunk_size = 20 * 1024 * 1024
                        for i in range(0, data_length, chunk_size):
                            client_socket.sendall(response[i:i + chunk_size])
                    
                except json.JSONDecodeError:
                    print("유효하지 않은 요청")
                    error_message = {
                        "status": "error",
                        "message": "Invalid JSON request."
                    }
                    client_socket.sendall(json.dumps(error_message).encode('utf-8'))

            except Exception as e:
                print(f"오류 발생: {e}")
                error_message = {
                    "status": "error",
                    "message": str(e)
                }
                client_socket.sendall(json.dumps(error_message).encode('utf-8'))

            finally:
                print("클라이언트 연결 종료")
                client_socket.close()
    except KeyboardInterrupt:
        print("서버가 종료됩니다.")
    finally:
        server_socket.close()
        sql.close_db()
        print("서버 및 데이터베이스 연결이 종료되었습니다.")

if __name__ == "__main__":
    start_server()
