from koalanlp.Util import initialize, finalize
from koalanlp import API
from koalanlp.proc import Tagger

# KoalaNLP 초기화
def initialize_koalanlp():
    print("Initializing KoalaNLP...")
    initialize(java_options="-Xmx4g", EUNJEON="LATEST")
    print("KoalaNLP Initialized")

# Tagger 객체 생성
tagger = None

def create_tagger():
    global tagger
    if tagger is None:
        tagger = Tagger(API.EUNJEON)

def analyze_text(text):
    if tagger is None:
        create_tagger()
    tagged_paragraph = tagger(text)
    result = [sentence.singleLineString() for sentence in tagged_paragraph]
    return result

# KoalaNLP 사용 종료
def close_koalanlp():
    finalize()
