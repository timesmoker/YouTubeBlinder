import numpy as np
from flask import Flask, request, jsonify
import json
import def_koalanlp as nlp
import threading
import fasttext
import socket
import scipy.spatial as spatial
import time
import unicodedata
import re
import gzip

from youtubeapi import load_api_key, get_video_information

SQLITE_HOST = 'localhost'  # SQLite 서버의 호스트 주소
SQLITE_PORT = 8870  # SQLite 서버의 포트

app = Flask(__name__)

# nlp 초기화를 위한 플래그와 락 객체 생성
initialized = False
lock = threading.Lock()


def initialize_nlp():
    global initialized
    with lock:
        if not initialized:
            nlp.initialize_koalanlp()
            initialized = True

def keep_korean(text):
    # 한글만 남김
    text = unicodedata.normalize('NFC', text)
    korean_pattern = re.compile('[^가-힣\s]+')
    # 한글 범위 외의 모든 문자를 공백으로 대체하여 제거
    text = korean_pattern.sub('', text)
    # 중복 공백을 제거
    text = re.sub(r'\s+', ' ', text)
    return text


def send_to_sqlite(data):
    compressed_data = gzip.compress(json.dumps(data).encode('utf-8'))
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((SQLITE_HOST, SQLITE_PORT))
        s.sendall(compressed_data)
        response = s.recv(1024)
        print('Received from SQLite server:', response.decode('utf-8'))


def calculate_similarity(topic, keywords, topic_vector, max_sim, max_sim_keywords, total_sim, keyword_count, model):
    if not keywords:
        return max_sim, max_sim_keywords, total_sim, keyword_count

    for keyword in keywords:
        if keyword == topic:
            similarity = 1.0
        else:
            keyword_vector = model.get_sentence_vector(keyword)
            # 유효한 벡터인지 검사
            if np.any(np.isnan(keyword_vector)) or np.any(np.isnan(topic_vector)):
                print("NaN detected in vectors")
                continue
            if np.linalg.norm(keyword_vector) == 0 or np.linalg.norm(topic_vector) == 0:
                print("Null vector detected")
                continue

            similarity = 1 - spatial.distance.cosine(keyword_vector, topic_vector)

        if similarity == 1.0 and keyword != topic:
            print("null vector similarity, if you see this something is doomed")
            continue

        if similarity > max_sim:
            max_sim_keywords = keyword
            max_sim = similarity

        total_sim += similarity
        keyword_count += 1

    return max_sim, max_sim_keywords, total_sim, keyword_count


def categoryCheck(category_number_str):
    category_dict = {
        "1": ["영화", "애니메이션"],
        "2": ["자동차"],
        "10": ["음악"],
        "15": ["반려동물", "동물"],
        "17": ["스포츠"],
        "18": ["단편 영화"],
        "19": ["여행", "이벤트"],
        "20": ["게임"],
        "21": ["동영상 블로그"],
        "22": ["인물", "블로그"],
        "23": ["코미디"],
        "24": ["엔터테인먼트"],
        "25": ["뉴스", "정치"],
        "26": ["노하우", "스타일"],
        "27": ["교육"],
        "28": ["과학기술"],
        "29": ["비영리", "사회운동"],
        "30": ["영화"],
        "31": ["애니메", "애니메이션"],
        "32": ["액션", "모험"],
        "33": ["고전"],
        "34": ["코미디"],
        "35": ["다큐멘터리"],
        "36": ["드라마"],
        "37": ["가족"],
        "38": ["외국"],
        "39": ["공포"],
        "40": ["SF", "판타지"],
        "41": ["스릴러"],
        "42": ["단편"],
        "43": ["프로그램"],
        "44": ["예고편"],
        "":[""]
    }

    return category_dict.get(category_number_str, ["Unknown Category"])


# FastText 모델 로드
model = fasttext.load_model('files/cc.ko.300.bin')
apikey = load_api_key('files/api_key.txt')
#model = fasttext.load_model('C:\\workspace\\files\\cc.ko.300.bin')
print("model loaded")
#apikey = load_api_key('C:\\workspace\\keys\\youtubeapi.txt')
print("apikey loaded")


print("server is now running")
initialize_nlp()
print("nlp initialzied")


@app.route('/simCalculate', methods=['POST'])
def receive_data():
    data = request.get_json()
    print("Received data:", data)

    title = data.get('title', '')
    title = keep_korean(title)
    topics = data.get('topic', [])
    whiteList = data.get('whiteList', {})

    video_id = ''
    tags_origin = []
    tags = []
    thumbnailurl = ''
    description = ''
    categoryID = ''
    channelID = ''
    category = []


    if 'video_id' in data:
        video_id = data.get('video_id', '')
        tags_origin, thumbnailurl, description, categoryID, channelID = get_video_information(apikey, video_id)
        print("tags:", tags_origin)
        print("thumbnailurl:", thumbnailurl)
        print("description:", description)
        print("categoryID:", categoryID)
        print("channelID:", channelID)

    category = categoryCheck(categoryID)
    print("카테고리 : " + str(category))

    # 소개 한글만 남김
    description = keep_korean(description)

    # 태그 한글만 남김
    tags = [keep_korean(tag) for tag in tags]

    # 태그 공백 기준으로 분리
    for tag in tags_origin:
        tags.extend(tag.split())

    # 중복 제거
    tags = list(set(tags))

    start_time = time.time()
    title_keywords = nlp.analyze_text(title)
    description_keywords = nlp.analyze_text(description)
    end_time = time.time()

    elapsed_time = end_time - start_time
    print("형태소 분리에 걸린시간:", elapsed_time, "seconds")

    print("제목 가공 후:", title)
    print("소개 가공 후:", description)
    print("추출된 제목 키워드:", title_keywords)
    print("추출된 소개 키워드:", description_keywords)

    maxSimList = []
    avgSimList = []

    start_time = time.time()

    for topic in topics:
        max_sim = [0, 0, 0, 0]
        total_sim = 0
        description_avg_sim = 0
        topic_vector = model.get_sentence_vector(topic)
        keyword_count = 0
        description_keywords_count = 0

        whitelist_keywords = whiteList.get(topic, [])

        max_sim_keywords = ["", "", "", ""]

        if any(keyword in whitelist_keywords for keyword in title_keywords):
            print(f"Topic '{topic}' contains a whitelisted keyword in title. Setting similarity to 0.")
            maxSimList.append(0)
            avgSimList.append(0)
            continue

        if any(keyword in whitelist_keywords for keyword in description_keywords):
            print(f"Topic '{topic}' contains a whitelisted keyword in description. Setting similarity to 0.")
            maxSimList.append(0)
            avgSimList.append(0)
            continue

        if any(keyword in whitelist_keywords for keyword in tags):
            print(f"Topic '{topic}' contains a whitelisted keyword in tags. Setting similarity to 0.")
            maxSimList.append(0)
            avgSimList.append(0)
            continue

        max_sim[0], max_sim_keywords[0], total_sim, keyword_count = calculate_similarity(topic,category, topic_vector,
                                                                                         max_sim[0],
                                                                                         max_sim_keywords[0], total_sim,
                                                                                         keyword_count, model)
        max_sim[1], max_sim_keywords[1], total_sim, keyword_count = calculate_similarity(topic,title_keywords, topic_vector,
                                                                                         max_sim[1],
                                                                                         max_sim_keywords[1], total_sim,
                                                                                         keyword_count, model)
        max_sim[2], max_sim_keywords[2], total_sim, keyword_count = calculate_similarity(topic,tags, topic_vector, max_sim[2],
                                                                                         max_sim_keywords[2], total_sim,
                                                                                         keyword_count, model)
        max_sim[3], max_sim_keywords[3], description_avg_sim, description_keywords_count = calculate_similarity(topic,
            description_keywords, topic_vector, max_sim[3], max_sim_keywords[3], description_avg_sim,
            description_keywords_count, model)

        avg_sim = total_sim / keyword_count if keyword_count > 0 else 0

        max_sim[3] = max_sim[3] * 0.7
        description_avg_sim = max_sim[3] * 0.7 / description_keywords_count if description_keywords_count > 0 else 0

        highest_max_sim = max(max_sim)
        avg_sim = max(avg_sim, description_avg_sim)

        maxSimList.append(highest_max_sim)
        avgSimList.append(avg_sim)

    end_time = time.time()

    max_sim_index = maxSimList.index(max(maxSimList))
    highest_maxSim_topic = topics[max_sim_index]
    highest_maxSim = maxSimList[max_sim_index]

    if highest_maxSim < 0.5:
        highest_maxSim_topic = ""

    elapsed_time = end_time - start_time
    print("유사도 측정에 걸린시간:", elapsed_time, "seconds")
    print("카테고리 키워드 :",max_sim_keywords[0],"카테고리 유사도:", max_sim[0])
    print("제목 키워드 :",max_sim_keywords[1],"제목 유사도:", max_sim[1])
    print("태그 키워드 :",max_sim_keywords[2],"태그 유사도:", max_sim[2])
    print("소개 키워드 :",max_sim_keywords[3],"소개 유사도:", max_sim[3])


    response = {
        "maxSim": maxSimList,
        "avg_sim": avgSimList
    }

    youtube_data = {
        'table': "today",
        'title': title,
        'description': description,
        'video_id': video_id,
        'category': categoryID,
        'topic': highest_maxSim_topic,
        'tags': tags,
        'channel_id': channelID
    }
    send_to_sqlite(youtube_data)

    return jsonify(response)


@app.route('/shutdown', methods=['POST'])
def shutdown():
    nlp.close_koalanlp()
    request.environ.get('werkzeug.server.shutdown')()
    return 'Server shutting down...'


@app.route('/notBanned', methods=['POST'])
def notBanned():

    # JSON 형식의 데이터 수신
    data = request.get_json()
    print("Received data:", data)

    # 클라이언트로부터 받은 title 처리
    title = data.get('title', '')
    title = keep_korean(title)
    topic = data.get('topic', '')


    tags = []
    thumbnailurl = ''
    description = ''
    categoryID = ''
    channelID = ''
    tags_origin = []
    category = []


    # 비디오 아이디 있으면 확인
    if 'video_id' in data:
        video_id = data.get('video_id', '')
        tags_origin, thumbnailurl, description, categoryID, channelID = get_video_information(apikey, video_id)
        print("tags:", tags_origin)
        print("thumbnailurl:", thumbnailurl)
        print("description:", description)
        print("categoryID:", categoryID)
        print("channelID:", channelID)

        # 소개 한글만 남김
        description = keep_korean(description)

        # 태그 한글만 남김
        tags = [keep_korean(tag) for tag in tags]

        # 태그 공백 기준으로 분리
        for tag in tags_origin:
            tags.extend(tag.split())

        # 중복 제거
        tags = list(set(tags))



    youtube_data = {
        'table': "today",
        'title': title,
        'description': description,
        'video_id': video_id,
        'category': categoryID,
        'topic': topic,
        'tags': tags,
        # 'thumbnail': thumbnailstring,
        'channel_id': channelID
    }
    send_to_sqlite(youtube_data)
    return

@app.route('/adjacency', methods=['POST'])
def adjacency():
    selected_topics = []
    data = request.get_json()
    topic = data.get('topic', '')

    # 초기 및 스텝 설정
    num_neighbors = 200  # 초기 검색할 이웃의 수
    increment_neighbors = 150  # 이웃 수 증가 폭
    max_neighbors = 1000  # 최대 이웃 수
    num_select = 20  # 선택할 토픽의 수

    while True:
        # 모델에서 유사한 단어 검색
        similar_words = model.get_nearest_neighbors(topic, k=num_neighbors)


        # 유사도 0.37과 0.45 사이의 단어 필터링
        filtered_words = [neighbor for neighbor in similar_words if 0.37 <= neighbor[0] <= 0.45]

        # 필터링된 단어가 있고 최소 유사도가 0.37 이하면 반복문 종료
        if filtered_words and min(filtered_words, key=lambda x: x[0])[0] <= 0.37:

            # 유사도 범위에서 20개의 키워드 선택
            min_similarity = min(filtered_words, key=lambda x: x[0])[0]
            max_similarity = max(filtered_words, key=lambda x: x[0])[0]
            interval = (max_similarity - min_similarity) / num_select

            for i in range(num_select):
                target_similarity = min_similarity + i * interval
                closest_word = min(filtered_words, key=lambda x: abs(x[0] - target_similarity), default=None)
                if closest_word and closest_word[1] not in [word[1] for word in selected_topics]:
                    selected_topics.append(closest_word)
                    print(f"Selected topic: {closest_word}")

            break

        # 이웃의 수가 최대치를 넘으면 종료
        if num_neighbors >= max_neighbors:
            print("Reached maximum number of neighbors, selecting closest topics")

            # 유사도 범위에서 20개의 키워드 선택
            min_similarity = min(filtered_words, key=lambda x: x[0])[0]
            max_similarity = max(filtered_words, key=lambda x: x[0])[0]
            interval = (max_similarity - min_similarity) / num_select

            for i in range(num_select):
                target_similarity = min_similarity + i * interval
                closest_word = min(filtered_words, key=lambda x: abs(x[0] - target_similarity), default=None)
                if closest_word and closest_word[1] not in [word[1] for word in selected_topics]:
                    selected_topics.append(closest_word)
                    print(f"Selected topic: {closest_word}")

            break

        # 검색할 유사 단어의 수 증가
        num_neighbors += increment_neighbors

    response = {
        "path": '/topic/adjacency',
        "topics": [{"similarity": word[0], "keyword": word[1]} for word in selected_topics]
    }

    print(f"Final selected topics: {response['topics']}")
    return jsonify(response)


@app.route('/adjacencyTopic',methods=['POST'])
def adjacencyTopic():
    data = request.get_json()
    topic_sent = data.get('topic', '')
    topics_all = data.get('topicsAll', '')
    similar_topic = ''
    max_sim = 0

    topicSended_vector = model.get_sentence_vector(topic_sent)
    for topic in topics_all:
        topic_vector = model.get_sentence_vector(topic)
        similarity = 1 - spatial.distance.cosine(topic_vector, topicSended_vector)
        if 0.4 < similarity < 1.0:
            if similarity > max_sim:
                max_sim = similarity
                similar_topic = topic

    response = {
        "path": '/topic/adjacencyTopic',
        "topic": similar_topic
    }

    return jsonify(response)


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9836)
    #app.run(host='localhost', port=5000)

