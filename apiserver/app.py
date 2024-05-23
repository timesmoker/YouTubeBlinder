from flask import Flask, request, jsonify
import json
import def_koalanlp as nlp
import threading
import fasttext
import scipy.spatial as spatial
import time
import unicodedata
import re

from youtubeapi import load_api_key, get_video_information

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


# FastText 모델 로드
model = fasttext.load_model('files/cc.ko.300.bin')
apikey = load_api_key('files/api_key.txt')
#model = fasttext.load_model('C:\\workspace\\files\\cc.ko.300.bin')
#print("model loaded")
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


    # 클라이언트로부터 받은 title과 topics
    title = data.get('title', '')
    title = unicodedata.normalize('NFC', title)
    title = keep_korean(title)
    topics = data.get('topic', [])
    # 비디오 아이디 있으면 확인
    if 'video_id' in data:
        video_id = data.get('video_id', '')
        tags,thumbnailurl,description,categoryID = get_video_information(apikey, video_id)
        print("tags:", tags)
        print("thumbnailurl:", thumbnailurl)
        print("description:", description)
        print("categoryID:", categoryID) # 이후에 이용예정 일단 받아오는것까지 확인

    print("가공 후:", title)

    # 형태소 분석 수행
    start_time = time.time()

    keywords = nlp.analyze_text(title)  # title에서 키워드 추출
    # 시간 측정 종료
    end_time = time.time()

    # 소요된 시간 계산
    elapsed_time = end_time - start_time
    print("형태소 분리에 걸린시간:", elapsed_time, "seconds")

    # 유사도 계산
    maxSimList = []
    totalSimList = []

    start_time = time.time()

    # 모든 키워드와 모든 토픽 간의 유사도 계산
    for topic in topics:
        maxSim = 0
        totalSim = 0
        topic_vector = model.get_sentence_vector(topic)
        for keyword in keywords:
            keyword_vector = model.get_sentence_vector(keyword)
            similarity = 1 - spatial.distance.cosine(keyword_vector, topic_vector)
            maxSim = max(maxSim, similarity)
            totalSim += similarity
        maxSimList.append(maxSim)
        totalSimList.append(totalSim)

    end_time = time.time()

    # 소요된 시간 계산
    elapsed_time = end_time - start_time
    print("유사도 측정에 걸린시간:", elapsed_time, "seconds")

    # 응답 메시지에 최대 유사도와 총 유사도 배열 추가
    response = {
        "maxSim": maxSimList,
        "totalSim": totalSimList
    }

    # JSON 형태로 응답 반환
    return jsonify(response)


@app.route('/shutdown', methods=['POST'])
def shutdown():
    nlp.close_koalanlp()
    request.environ.get('werkzeug.server.shutdown')()
    return 'Server shutting down...'

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9836)
    #app.run(host='localhost', port=5000)