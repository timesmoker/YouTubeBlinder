import pandas as pd
from transformers import BertTokenizer, BertModel
import torch
from torch.utils.data import Dataset, DataLoader
from sklearn.metrics.pairwise import cosine_similarity

# 데이터셋 로드 및 전처리
df = pd.read_csv('kobert_single_line_dataset.csv')
tokenizer = BertTokenizer.from_pretrained('trained_kobert_tokenizer')

class CustomDataset(Dataset):
    def __init__(self, dataframe, tokenizer, max_len):
        self.dataframe = dataframe
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.dataframe)

    def __getitem__(self, index):
        row = self.dataframe.iloc[index]
        text = row['text']
        
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_len,
            return_token_type_ids=False,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )

        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten()
        }

MAX_LEN = 256
dataset = CustomDataset(df, tokenizer, MAX_LEN)
dataloader = DataLoader(dataset, batch_size=2)

# 단어 유사도 계산
def get_word_embeddings(word, tokenizer, model, device):
    inputs = tokenizer(word, return_tensors='pt').to(device)
    outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).cpu().detach().numpy()

def calculate_similarity(word1, word2, tokenizer, model, device):
    embedding1 = get_word_embeddings(word1, tokenizer, model, device)
    embedding2 = get_word_embeddings(word2, tokenizer, model, device)
    similarity = cosine_similarity(embedding1, embedding2)
    return similarity[0][0]

# 디바이스 설정
device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')

# BERT 모델 로드 (classification이 아닌 일반 BERT 모델 필요)
bert_model = BertModel.from_pretrained('trained_kobert_model').to(device)

# 단어 유사도 테스트
word_pairs = [("류현진", "한화"), ("Gaming", "페이커"), ("트위치", "게임"), ("머독", "카스"), ("Entertainment", "News")]

for word1, word2 in word_pairs:
    similarity = calculate_similarity(word1, word2, tokenizer, bert_model, device)
    print(f"Similarity between '{word1}' and '{word2}': {similarity}")
