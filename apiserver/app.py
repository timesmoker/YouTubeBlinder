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
    korean_pattern = re.compile('[^가-힣\s]+')

    # 한글 범위 외의 모든 문자를 공백으로 대체하여 제거
    return korean_pattern.sub('', text)


def send_to_sqlite(data):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((SQLITE_HOST, SQLITE_PORT))
        s.sendall(json.dumps(data).encode('utf-8'))
        response = s.recv(1024)
        print('Received from SQLite server:', response.decode('utf-8'))


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
    # JSON 형식의 데이터 수신
    data = request.get_json()
    print("Received data:", data)

    # 클라이언트로부터 받은 title 처리
    title = data.get('title', '')
    title = unicodedata.normalize('NFC', title)
    title = keep_korean(title)
    topics = data.get('topic', [])

    print("제목 가공 후:", title)

    # 비디오 아이디 있으면 확인
    if 'video_id' in data:
        video_id = data.get('video_id', '')
        tags, thumbnailurl, description, categoryID, channelID = get_video_information(apikey, video_id)
        print("tags:", tags)
        print("thumbnailurl:", thumbnailurl)
        print("description:", description)
        print("categoryID:", categoryID)  # 이후에 이용예정 일단 받아오는것까지 확인
        print("channelID:", channelID)

    # 형태소 분석 수행
    start_time = time.time()

    title_keywords = nlp.analyze_text(title)  # title에서 키워드 추출
    description_keywords = nlp.analyze_text(description)  # description에서 키워드 추출

    # 시간 측정 종료
    end_time = time.time()

    # 소요된 시간 계산
    elapsed_time = end_time - start_time
    print("형태소 분리에 걸린시간:", elapsed_time, "seconds")
    print("추출된 키워드:", title_keywords)

    # 유사도 계산
    maxSimList = []
    avgSimList = []

    start_time = time.time()

    # 모든 키워드와 모든 토픽 간의 유사도 계산
    for topic in topics:
        max_sim = 0
        total_sim = 0
        description_max_sim = 0
        description_avg_sim = 0
        topic_vector = model.get_sentence_vector(topic)
        keyword_count = 0
        description_keywords_count = 0

        for keyword in title_keywords:
            keyword_vector = model.get_sentence_vector(keyword)
            similarity = 1 - spatial.distance.cosine(keyword_vector, topic_vector)
            max_sim = max(max_sim, similarity)
            total_sim += similarity
            keyword_count += 1

        for keyword in tags:
            keyword_vector = model.get_sentence_vector(keyword)
            similarity = 1 - spatial.distance.cosine(keyword_vector, topic_vector)
            max_sim = max(max_sim, similarity)
            total_sim += similarity
            keyword_count += 1

        for keyword in description_keywords:
            keyword_vector = model.get_sentence_vector(keyword)
            similarity = 1 - spatial.distance.cosine(keyword_vector, topic_vector)
            description_max_sim = max(description_max_sim, similarity)
            description_avg_sim += similarity
            description_keywords_count += 1

        avg_sim = total_sim / keyword_count if keyword_count > 0 else 0

        description_max_sim = description_max_sim * 0.7
        description_avg_sim = description_avg_sim * 0.7 / description_keywords_count if description_keywords_count > 0 else 0

        max_sim = max(max_sim, description_max_sim)
        avg_sim = max(avg_sim, description_avg_sim)

        maxSimList.append(max_sim)
        avgSimList.append(avg_sim)





    end_time = time.time()

    # Finding the topic with the highest max_sim
    max_sim_index = maxSimList.index(max(maxSimList))
    highest_maxSim_topic = topics[max_sim_index]
    highest_maxSim = maxSimList[max_sim_index]

    if highest_maxSim < 0.5:
        highest_maxSim_topic = ""

    # 소요된 시간 계산
    elapsed_time = end_time - start_time
    print("유사도 측정에 걸린시간:", elapsed_time, "seconds")

    # 응답 메시지에 최대 유사도와 총 유사도 배열 추가
    response = {
        "maxSim": maxSimList,
        "avg_sim": avgSimList
    }

    youtube_data = {
        'table': "today",
        'title': title_keywords,
        'description': description_keywords,
        'video_id': video_id,
        'category': categoryID,
        'topic': highest_maxSim_topic,
        'tags': tags,
        # 'thumbnail': thumbnailstring,
        'channel_id': channelID
    }
    send_to_sqlite(youtube_data)

    # JSON 형태로 응답 반환
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
    title = unicodedata.normalize('NFC', title)
    title = keep_korean(title)
    topic = data.get('topic', '')

    print("제목 가공 후:", title)

    # 비디오 아이디 있으면 확인
    if 'video_id' in data:
        video_id = data.get('video_id', '')
        tags, thumbnailurl, description, categoryID, channelID = get_video_information(apikey, video_id)
        print("tags:", tags)
        print("thumbnailurl:", thumbnailurl)
        print("description:", description)
        print("categoryID:", categoryID)  # 이후에 이용예정 일단 받아오는것까지 확인
        print("channelID:", channelID)

    # 형태소 분석 수행
    start_time = time.time()

    title_keywords = nlp.analyze_text(title)  # title에서 키워드 추출
    description_keywords = nlp.analyze_text(description)  # description에서 키워드 추출

    # 시간 측정 종료
    end_time = time.time()

    # 소요된 시간 계산
    elapsed_time = end_time - start_time
    print("형태소 분리에 걸린시간:", elapsed_time, "seconds")
    print("추출된 키워드:", title_keywords)

    youtube_data = {
        'table': "today",
        'title': title_keywords,
        'description': description_keywords,
        'video_id': video_id,
        'category': categoryID,
        'topic': topic,
        'tags': tags,
        # 'thumbnail': thumbnailstring,
        'channel_id': channelID
    }
    send_to_sqlite(youtube_data)
    return

'''
@app.route('/adjacency', methods=['POST'])
def adjacency():
    data = request.get_json()
    topic = data.get('topic', '')

    # num_neighbors와 num_select는 쿼리 파라미터로부터 가져옴, 기본값은 30과 20
    num_neighbors = 30
    num_select = 20

    topic_vector = model.get_sentence_vector(topic)

    # 주어진 토픽과 유사한 단어 찾기
    nearest_neighbors = model.get_nearest_neighbors(topic_vector, k=num_neighbors)
    similar_words = [neighbor for neighbor in nearest_neighbors]

    # 0.05 단위로 가장 가까운 단어 선택
    selected_topics = []
    previous_similarity = None
    for similarity, word in similar_words:
        if len(selected_topics) >= num_select:
            break
        if previous_similarity is None or abs(previous_similarity - similarity) >= 0.05:
            selected_topics.append(word)
            previous_similarity = similarity

    response = {
        "path": '/topic/adjacency',
        "topic": selected_topics
    }

    return jsonify(response)
'''

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
