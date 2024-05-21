from flask import Flask, request, Response
import json
import threading
import mypackage.def_koalanlp as nlp
import mypackage.def_sql as sql
import mypackage.def_visionai as visionapi

app = Flask(__name__)

# 초기화를 위한 플래그와 락 객체 생성
initialized = False
lock = threading.Lock()

def initialize_system():
    global initialized
    with lock:
        if not initialized:
            nlp.initialize_koalanlp()
            sql.first_connect_sql()  # SQL 연결 초기화 추가
            initialized = True

@app.route('/data', methods=['POST'])
def receive_data():
    try:
        # 처음 서버 구동시를 대비한 초기화 확인 및 수행
        initialize_system()

        # JSON 형식의 데이터 수신
        data = request.get_json()
        print("Received data:", data)

        # JSON으로 받은 데이터 분리작업 (임시)
        video_id = data.get('id')
        video_title = data.get('title')

        # Vision AI로 URL을 보내서 썸네일 분석
        test1 = visionapi.extract_text_from_thumbnail(video_id)
        
        # SQL에 저장하는 작업
        sql.insert_data(video_id, video_title)

        '''
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
        '''

        return '', 204
    except Exception as e:
        print(f"Error in receive_data: {e}")
        return f"Internal Server Error: {e}", 500

# 서버 종료 시 자원 해제
@app.route('/shutdown', methods=['POST'])
def shutdown():
    nlp.close_koalanlp()
    sql.close_db()
    request.environ.get('werkzeug.server.shutdown')()
    return 'Server shutting down...'

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9836)
