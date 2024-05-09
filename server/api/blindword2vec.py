import sys
import json
from gensim.models import KeyedVectors

# Load word vectors from the tsv file
word_vectors = KeyedVectors.load_word2vec_format('ko.bin', binary=True)

while True:
    input_line = sys.stdin.readline()
    if not input_line:
        break
    data = json.loads(input_line)
    word1, word2 = data['word1'], data['word2']
    if word1 in word_vectors and word2 in word_vectors:
        similarity = word_vectors.similarity(word1, word2)
        print(similarity)
    else:
        print("One or both words not found")
    sys.stdout.flush()