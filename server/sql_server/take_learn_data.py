import socket
import json
import gzip

host = "13.125.145.225"
port = 8870

table = "learn_request"
video_id = ""
title = ''
description = ''
category = ""
topic = ''
tags = ""
thumbnail = ""
channel_id = ""

# all, title, description 3개 중에 선택
# output.txt에는 데이터만, original_output.txt에는 json 데이터 그대로 저장
column = "all"


request_data = {
    "table": table,
    "video_id": video_id,
    "title": title,
    "description": description,
    "category" : category,
    "topic" : topic,
    "tags": tags,
    "thumbnail" : thumbnail,
    "column": column,
    "channel_id": channel_id
}
request_json = json.dumps(request_data)

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((host, port))

client_socket.send(request_json.encode("utf-8"))

# 데이터 길이 받기 (8바이트)
data_length = int.from_bytes(client_socket.recv(8), 'big')
received_data = bytearray()

# 10MB (10 * 1024 * 1024 바이트) 버퍼 크기 설정
chunk_size = 10 * 1024 * 1024

# 데이터 수신 시작
while len(received_data) < data_length:
    packet = client_socket.recv(min(chunk_size, data_length - len(received_data)))
    if not packet:
        break
    received_data.extend(packet)

if (table == "today_request" or table == "learn_request"):
    decompressed_data = gzip.decompress(received_data)
    json_data = json.loads(decompressed_data.decode('utf-8'))

    # "title"과 "description"만 추출하여 텍스트 파일로 저장
    lines = []
    for item in json_data:
        if "title" in item:
            lines.append(item["title"])
        if "description" in item:
            lines.append(item["description"])
    
    with open('output.txt', 'w', encoding='utf-8') as f:
        for line in lines:
            f.write(line + '\n')

    print("title과 description이 output.txt 파일에 저장되었습니다.")

    # 원본 데이터를 텍스트 파일로 저장
    with open('original_output.txt', 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=4)

    print("원본 데이터가 original_output.txt 파일에 저장되었습니다.")

client_socket.close()