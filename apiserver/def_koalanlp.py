from koalanlp.Util import initialize, finalize
from koalanlp import API
from koalanlp.proc import Tagger

# KoalaNLP 초기화
def initialize_koalanlp():
    java_options = "-Xmx4g --add-opens java.base/java.util=ALL-UNNAMED"
    initialize(java_options=java_options, OKT="LATEST")



# Tagger 객체 생성
tagger = None

def create_tagger():
    global tagger
    if tagger is None:
        tagger = Tagger(API.OKT)


def analyze_text(text):
    if tagger is None:
        create_tagger()

    include_tags = {'Noun', 'Verb', 'Adjective', 'NNG', 'NNP', 'VV', 'VA'}
    result_list = []

    tagged_paragraph = tagger(text)
    for sentence in tagged_paragraph:
        for word in sentence:
            for morph in word:
                if str(morph.getTag())  in include_tags:
                    result_list.append(f"{morph.getSurface()}")

    return result_list


def analyze_text_Noun(text):
    if tagger is None:
        create_tagger()

    include_tags = {'Noun', 'NNG', 'NNP'}
    result_list = []

    tagged_paragraph = tagger(text)
    for sentence in tagged_paragraph:
        for word in sentence:
            for morph in word:
                if str(morph.getTag())  in include_tags:
                    result_list.append(f"{morph.getSurface()}")

    return result_list

# KoalaNLP 사용 종료
def close_koalanlp():
    finalize()