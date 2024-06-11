import re
from koalanlp.Util import initialize, finalize
from koalanlp import API
from koalanlp.proc import Tagger

# KoalaNLP 초기화
def initialize_koalanlp():
    initialize(java_options="-Xmx4g", OKT="LATEST")

# Tagger 객체 생성
tagger = None

def create_tagger():
    global tagger
    if tagger is None:
        tagger = Tagger(API.OKT)

def analyze_text(text, exclude_tags):
    if tagger is None:
        create_tagger()

    # 작은따옴표 제거
    text = text.replace("'", "")

    result_list = []

    tagged_paragraph = tagger(text)
    for sentence in tagged_paragraph:
        for word in sentence:
            word_surface = []
            skip_next_space = False
            for morph in word:
                if str(morph.getTag()) in exclude_tags:
                    skip_next_space = True
                else:
                    if skip_next_space:
                        skip_next_space = False
                        if word_surface and word_surface[-1] == ' ':
                            word_surface.pop()  # 이전에 추가된 스페이스바 제거
                    word_surface.append(morph.getSurface())
            result_list.append(''.join(word_surface))  # 단어별로 띄어쓰기 유지

    return ' '.join(result_list)  # 문장별로 띄어쓰기 유지

def analyze_text_nng_only(text):
    if tagger is None:
        create_tagger()

    result_list = []

    tagged_paragraph = tagger(text)
    for sentence in tagged_paragraph:
        for word in sentence:
            word_surface = []
            for morph in word:
                if str(morph.getTag()) == 'NNG':
                    word_surface.append(morph.getSurface())
            if word_surface:  # NNG만 존재하는 경우에만 추가
                result_list.append(''.join(word_surface))

    return ' '.join(result_list)  # 문장별로 띄어쓰기 유지

def remove_extra_spaces(text):
    # 모든 연속된 공백을 하나의 공백으로 변경
    return ' '.join(text.split())

# KoalaNLP 사용 종료
def close_koalanlp():
    finalize()

def main():
    # KoalaNLP 초기화
    initialize_koalanlp()

    # 파일 리스트
    input_files = ['output_category_title.txt', 'output_category_tags.txt', 'output_category_description.txt']
    output_files = ['[nlp]output_category_title.txt', '[nlp]output_category_tags.txt', '[nlp]output_category_description.txt']
    output_files_nng = ['[nng]output_category_title.txt', '[nng]output_category_tags.txt', '[nng]output_category_description.txt']

    # 각 파일을 처리
    for input_file, output_file, output_file_nng in zip(input_files, output_files, output_files_nng):
        with open(input_file, 'r', encoding='utf-8') as infile, open(output_file, 'w', encoding='utf-8') as outfile, open(output_file_nng, 'w', encoding='utf-8') as outfile_nng:
            for line in infile:
                if line.startswith('__label__'):
                    # '__label__' 뒤에 숫자와 공백만 있는지 확인
                    match = re.match(r'__label__\d+\s*$', line)
                    if match:
                        continue  # 해당 라인은 무시하고 저장하지 않음

                    # '__label__'로 시작하는 줄을 처리
                    label_end = line.find(' ')  # 라벨의 끝 위치 찾기
                    if label_end != -1:
                        label = line[:label_end]
                        text = line[label_end + 1:]
                        text = remove_extra_spaces(text)  # 과도한 띄어쓰기 제거
                        processed_text = analyze_text(text.strip(), exclude_tags={'JX', 'SL', 'SF'})
                        processed_text_nng = analyze_text_nng_only(text.strip())
                        outfile.write(f'{label} {processed_text}\n')
                        outfile_nng.write(f'{label} {processed_text_nng}\n')
                    else:
                        outfile.write(line)  # 공백이 없는 경우 전체를 출력
                        outfile_nng.write(line)
                else:
                    # 라벨이 없는 줄을 그대로 형태소 분석기로 처리
                    text = remove_extra_spaces(line.strip())  # 과도한 띄어쓰기 제거
                    processed_text = analyze_text(text, exclude_tags={'JX', 'SL', 'SF'})
                    processed_text_nng = analyze_text_nng_only(text)
                    outfile.write(f'{processed_text}\n')
                    outfile_nng.write(f'{processed_text_nng}\n')

    # KoalaNLP 사용 종료
    close_koalanlp()

if __name__ == "__main__":
    main()
