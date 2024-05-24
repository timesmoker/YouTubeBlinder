import socket
import json
import sql_func as sql

def start_server():
    host = "0.0.0.0"
    port = 8856

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((host, port))
    server_socket.listen(5)
    sql.first_connect_sql()
    print(f"서버가 {host}:{port}에서 대기 중입니다...")

    try:
        while True:
            client_socket, client_address = server_socket.accept()
            print(f"클라이언트 {client_address}가 연결되었습니다.")
            
            try:
                data = client_socket.recv(4096).decode("utf-8")
                if not data:
                    continue

                try:
                    request_data = json.loads(data)
                    table = request_data.get("table")
                    video_id = request_data.get("video_id")
                    video_title = request_data.get("video_title")
                    video_info = request_data.get("video_info")
                    channel_tag = request_data.get("channel_tag")

                    if (table == "today" or table == "learn"):
                        sql.insert_data(table, video_id, video_title, video_info)

                    elif (table == "channel"):
                        sql.insert_channel_data(video_id, channel_tag)

                except json.JSONDecodeError:
                    print("유효하지 않은 요청")

            except Exception as e:
                print(f"오류 발생: {e}")

            finally:
                print("클라이언트 연결 종료")
                client_socket.close()
    except KeyboardInterrupt:
        print("서버가 종료됩니다.")
    finally:
        server_socket.close()
        #sql.close_db()
        print("서버 및 데이터베이스 연결이 종료되었습니다.")

if __name__ == "__main__":
    start_server()
