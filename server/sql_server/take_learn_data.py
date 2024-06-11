import socket
import json
import gzip
import re

host = "13.125.145.225"
port = 8870

table = "learn_request"
video_id = ""
title = ''
description = ''
category = ""
topic = ''
tags = ''
thumbnail = ""
channel_id = ""
column = "all"

# all, title, description 3개 중에 선택
# output.txt에는 데이터만, original_output.txt에는 json 데이터 그대로 저장

# fasttext 또는 kobert 선택
learn_style = "fasttext"

request_data = {
    "table": table,
    "video_id": video_id,
    "title": title,
    "description": description,
    "category": category,
    "topic": topic,
    "tags": tags,
    "thumbnail": thumbnail,
    "column": column,
    "channel_id": channel_id
}
request_json = json.dumps(request_data)

# JSON 데이터를 gzip으로 압축
compressed_data = gzip.compress(request_json.encode('utf-8'))

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((host, port))

# 압축된 데이터 전송
client_socket.sendall(compressed_data)

if table == 'today':
    data = client_socket.recv(1024).decode("utf-8")
    print(data)

elif table == 'today_request' or table == 'learn_request' or table == 'not_banned_request':
    # 데이터 길이 받기 (8바이트)
    data_length = int.from_bytes(client_socket.recv(8), 'big')
    received_data = bytearray()

    # 20MB (20 * 1024 * 1024 바이트) 버퍼 크기 설정
    chunk_size = 20 * 1024 * 1024

    # 데이터 수신 시작
    while len(received_data) < data_length:
        packet = client_socket.recv(min(chunk_size, data_length - len(received_data)))
        if not packet:
            break
        received_data.extend(packet)

    if table in ["today_request", "learn_request"]:
        decompressed_data = gzip.decompress(received_data)
        json_data = json.loads(decompressed_data.decode('utf-8'))

        if learn_style == "fasttext":
            title_lines = []
            description_lines = []
            tags_lines = []

            for item in json_data:
                category = item.get("category", "").strip()
                title = item.get("title", "").strip()
                description = item.get("description", "").strip()
                tags = item.get("tags", "").strip("[]").replace("'", "").replace(",", "").strip()

                # description에서 URL, 줄바꿈, '#으로 시작하는 단어 제거
                description = re.sub(r'http[s]?://\S+|www\.\S+', '', description)
                description = description.replace('\n', ' ').replace('\r', '')
                description = re.sub(r'\s+', ' ', description).strip()
                description = re.sub(r'#\S+', '', description)

                if category and title:
                    title_lines.append(f'__label__{category} {title}')
                if category and description:
                    description_lines.append(f'__label__{category} {description}')
                if category and tags:
                    tags_lines.append(f'__label__{category} {tags}')

            # title 텍스트 파일로 저장
            with open('output_category_title.txt', 'w', encoding='utf-8') as f:
                for line in title_lines:
                    f.write(line + '\n')
            print("category와 title이 __label__ 형식으로 output_category_title.txt 파일에 저장되었습니다.")

            # description 텍스트 파일로 저장
            with open('output_category_description.txt', 'w', encoding='utf-8') as f:
                for line in description_lines:
                    f.write(line + '\n')
            print("category와 description이 __label__ 형식으로 output_category_description.txt 파일에 저장되었습니다.")

            # tags 텍스트 파일로 저장
            with open('output_category_tags.txt', 'w', encoding='utf-8') as f:
                for line in tags_lines:
                    f.write(line + '\n')
            print("category와 tags가 __label__ 형식으로 output_category_tags.txt 파일에 저장되었습니다.")

            # 원본 데이터를 텍스트 파일로 저장
            with open('original_output.txt', 'w', encoding='utf-8') as f:
                json.dump(json_data, f, ensure_ascii=False, indent=4)
            print("원본 데이터가 original_output.txt 파일에 저장되었습니다.")

        elif learn_style == "kobert":
            processed_lines = []

            for item in json_data:
                category = item.get("category", "").strip()
                title = item.get("title", "").strip()
                description = item.get("description", "").strip()
                tags = item.get("tags", "").strip("[]").replace("'", "").replace(",", "").strip()

                # description에서 URL, 줄바꿈, '#으로 시작하는 단어 제거
                description = re.sub(r'http[s]?://\S+|www\.\S+', '', description)
                description = description.replace('\n', ' ').replace('\r', '')
                description = re.sub(r'\s+', ' ', description).strip()
                description = re.sub(r'#\S+', '', description)

                if category and (title or description or tags):
                    line = f"category: {category}"
                    if title:
                        line += f" title: {title}"
                    if tags:
                        line += f" tags: {tags}"
                    if description:
                        line += f" description: {description}"
                    processed_lines.append(line)

            # 텍스트 파일로 저장
            with open('kobert_dataset.txt', 'w', encoding='utf-8') as f:
                for line in processed_lines:
                    f.write(line + '\n')
            print("KoBERT 학습을 위한 데이터가 kobert_dataset.txt 파일에 저장되었습니다.")

# 클라이언트 소켓 종료
client_socket.close()
