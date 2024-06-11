import os
import re

def replace_multiple_spaces_and_remove_english_special_chars(file_paths):
    for file_path in file_paths:
        # 파일을 읽기 모드로 열기
        with open(file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
        
        # 각 라인의 과도한 스페이스를 단 하나의 스페이스로 변경하고 영어와 특수 문자를 제거
        modified_lines = []
        for line in lines:
            # __label__ 부분을 보존
            label_part = ''
            if line.startswith('__label__'):
                label_part, _, rest_of_line = line.partition(' ')
                line = rest_of_line
            
            # 영어, 숫자와 특수 문자를 제거
            cleaned_line = re.sub(r'\b\w*\d+\w*\b', '', line)  # 숫자가 포함된 단어 제거
            cleaned_line = re.sub(r'[A-Za-z_@.,!?%$#&*()~+=:;\"\'/\\-]', '', cleaned_line)  # 특수문자 제거
            # 과도한 스페이스를 단 하나의 스페이스로 변경
            cleaned_line = ' '.join(cleaned_line.split())
            
            # __label__ 부분과 합치기
            if label_part:
                cleaned_line = label_part + ' ' + cleaned_line
            
            # 숫자 제거 후 __label__(숫자)만 있는 라인은 제거
            if cleaned_line.strip() == label_part.strip():
                continue
            
            modified_lines.append(cleaned_line + '\n')
        
        # 새로운 파일 이름 생성
        dir_name, base_name = os.path.split(file_path)
        new_file_name = os.path.join(dir_name, f"final_{base_name}")
        
        # 파일을 쓰기 모드로 열기 (새로운 파일에 쓰기)
        with open(new_file_name, 'w', encoding='utf-8') as file:
            file.writelines(modified_lines)

# 사용 예시
file_paths = ['[nlp]output_category_title.txt', '[nlp]output_category_tags.txt', '[nlp]output_category_description.txt']
replace_multiple_spaces_and_remove_english_special_chars(file_paths)
