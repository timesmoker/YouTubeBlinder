from flask import Flask, request, Response
import json
import def_koalanlp as nlp
import threading
import def_sql as sql

app = Flask(__name__)

# 초기화를 위한 플래그와 락 객체 생성
initialized = False
connect_sql = False
lock = threading.Lock()

def initialize_system():
    global initialized
    with lock:
        if not initialized:
            nlp.initialize_koalanlp()
            initialized = True
        if not connect_sql:
            sql.first_connect_sql()
            connect_sql = True


@app.route('/data', methods=['POST'])
def receive_data():
    # 처음 서버 구동시를 대비한 초기화 확인 및 수행
    initialize_system()

    # JSON 형식의 데이터 수신
    data = request.get_json()
    print("Received data:", data)

    # JSON으로 받은 데이터 분리작업 (임시)
    title = data.get('title')
    id = data.get('id')
    
    # 형태소 분석 수행 (수정예정)
    text = data.get('text', '')
    analyzed_result = nlp.analyze_text(text)
    

    # 응답 메시지에 성공 문구와 분석 결과 추가
    response = {
        "analyzed_result": analyzed_result
    }
    
    # JSON 형태로 응답 반환 (UTF-8 인코딩 명시)
    response_json = json.dumps(response, ensure_ascii=False)
    return Response(response_json, content_type='application/json; charset=utf-8')

# 서버 종료 시 자원 해제
@app.route('/shutdown', methods=['POST'])
def shutdown():
    nlp.close_koalanlp()
    sql.close_db()
    request.environ.get('werkzeug.server.shutdown')()
    return 'Server shutting down...'

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9836)
