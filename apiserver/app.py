from flask import Flask, request, jsonify
import json
import def_koalanlp as nlp
import threading
import fasttext
import scipy.spatial as spatial
import time


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

# FastText 모델 로드
model = fasttext.load_model('files/cc.ko.300.bin')
#model = fasttext.load_model('C:\\workspace\\cc.ko.300.bin')

print("model loaded")
print("server is now running")
initialize_nlp()
print("nlp initialzied")
@app.route('/data', methods=['POST'])
def receive_data():
    # JSON 형식의 데이터 수신
    data = request.get_json()
    print("Received data:", data)

    # 클라이언트로부터 받은 title과 topics
    title = data.get('title', '')
    topics = data.get('topic', [])

     #형태소 분석 수행
    start_time = time.time()

    keywords = nlp.analyze_text(title)  # title에서 키워드 추출
    # 시간 측정 종료
    end_time = time.time()

    # 소요된 시간 계산
    elapsed_time = end_time - start_time

    print("형태소 분리에 걸린시간:", elapsed_time, "seconds")

    # 유사도 계산
    maxSim = 0
    totalSim = 0

    start_time = time.time()
    # 모든 키워드와 모든 토픽간의 유사도 계산
    for keyword in keywords:
        keyword_vector = model.get_sentence_vector(keyword)
        for topic in topics:
            topic_vector = model.get_sentence_vector(topic)
            similarity = 1 - spatial.distance.cosine(keyword_vector, topic_vector)
            maxSim = max(maxSim, similarity)
            totalSim += similarity

    end_time = time.time()

    # 소요된 시간 계산
    elapsed_time = end_time - start_time

    print("유사도 측정에 걸린시간:", elapsed_time, "seconds")

    # 응답 메시지에 최대 유사도와 총 유사도 추가
    response = {
        "maxSim": maxSim,
        "totalSim": totalSim
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

