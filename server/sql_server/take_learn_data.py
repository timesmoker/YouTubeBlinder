import socket
import json
import gzip
import pandas as pd

host = "13.125.145.225"
port = 8870

table = "today_request"
video_id = ""
title = ''
description = ''
category = ""
topic = ''
tags = ''
thumbnail = ""
channel_id = ""

# all, title, description 3개 중에 선택
# output.txt에는 데이터만, original_output.txt에는 json 데이터 그대로 저장
column = "all"

#fasttext 또는 kobert 선택
learn_style = "fasttext"

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

    if learn_style == "fasttext":
        # "category", "title", "description", "tags"를 추출하여 리스트로 저장
        categories = []
        titles = []
        descriptions = []
        tags_list = []
        title_lines = []
        description_lines = []
        tags_lines = []

        for item in json_data:
            if "category" in item:
                if "title" in item:
                    categories.append(item["category"])
                    titles.append(item["title"])
                    title_lines.append(f'__label__{item["category"]} {item["title"]}')
                if "description" in item:
                    descriptions.append(item["description"])
                    description_lines.append(f'__label__{item["category"]} {item["description"]}')
                if "tags" in item:
                    # tags 문자열에서 대괄호 제거
                    tags = item["tags"].strip("[]").replace("'", "").replace(",", "")
                    tags_list.append(tags)
                    tags_lines.append(f'__label__{item["category"]} {tags}')

        # 데이터프레임 생성
        title_df = pd.DataFrame({'category': categories, 'title': titles})
        description_df = pd.DataFrame({'category': categories, 'description': descriptions})
        tags_df = pd.DataFrame({'category': categories, 'tags': tags_list})

        # CSV 파일로 저장
        title_df.to_csv('output_category_title.csv', index=False, encoding='utf-8-sig')
        description_df.to_csv('output_category_description.csv', index=False, encoding='utf-8-sig')
        tags_df.to_csv('output_category_tags.csv', index=False, encoding='utf-8-sig')

        print("category와 title이 output_category_title.csv 파일에 저장되었습니다.")
        print("category와 description이 output_category_description.csv 파일에 저장되었습니다.")
        print("category와 tags가 output_category_tags.csv 파일에 저장되었습니다.")

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
        # KoBERT 학습을 위한 데이터 처리
        categories = []
        titles = []
        descriptions = []
        tags_list = []

        for item in json_data:
            if "category" in item:
                categories.append(item["category"])
                if "title" in item:
                    titles.append(item["title"])
                else:
                    titles.append("")
                if "description" in item:
                    descriptions.append(item["description"])
                else:
                    descriptions.append("")
                if "tags" in item:
                    tags = item["tags"].strip("[]").replace("'", "").replace(",", "")
                    tags_list.append(tags)
                else:
                    tags_list.append("")

        # 데이터프레임 생성
        df = pd.DataFrame({
            'category': categories,
            'title': titles,
            'description': descriptions,
            'tags': tags_list
        })

        # CSV 파일로 저장
        df.to_csv('kobert_dataset.csv', index=False, encoding='utf-8-sig')
        print("KoBERT 학습을 위한 데이터가 kobert_dataset.csv 파일에 저장되었습니다.")

        # TXT 파일로 저장
        with open('kobert_dataset.txt', 'w', encoding='utf-8-sig') as file:
            for i in range(len(df)):
                line = f"category: {df.iloc[i]['category']} title: {df.iloc[i]['title']} tags: {df.iloc[i]['tags']} description: {df.iloc[i]['description']}\n"
                file.write(line)

        print("KoBERT 학습을 위한 데이터가 kobert_dataset.txt 파일에 저장되었습니다.")

client_socket.close()