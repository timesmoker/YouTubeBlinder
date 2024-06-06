import pandas as pd
from transformers import BertTokenizer, BertForSequenceClassification
from torch.utils.data import Dataset, DataLoader
import torch

# 데이터 읽기
def read_txt_file(file_path):
    with open(file_path, 'r', encoding='utf-8-sig') as file:
        lines = file.readlines()
    return [line.strip() for line in lines]

# 데이터 읽기
data_lines = read_txt_file('kobert_dataset.txt')

# 데이터를 분리하여 데이터프레임 생성
categories = []
titles = []
descriptions = []
tags_list = []

for line in data_lines:
    parts = line.split("description: ")
    description = parts[-1]
    rest = parts[0].split("tags: ")
    tags = rest[-1]
    rest = rest[0].split("title: ")
    title = rest[-1]
    category = rest[0].replace("category: ", "")
    
    categories.append(category)
    titles.append(title)
    descriptions.append(description)
    tags_list.append(tags)

df = pd.DataFrame({
    'category': categories,
    'title': titles,
    'description': descriptions,
    'tags': tags_list
})

df['text'] = df['category'] + ' ' + df['title'] + ' ' + df['tags'] + ' ' + df['description']

# CSV 파일로 저장
df.to_csv('kobert_single_line_dataset.csv', index=False, encoding='utf-8-sig')

# 데이터셋 로드 및 전처리
df = pd.read_csv('kobert_single_line_dataset.csv')
tokenizer = BertTokenizer.from_pretrained('monologg/kobert')

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

# 모델 학습
model = BertForSequenceClassification.from_pretrained('monologg/kobert')
optimizer = torch.optim.Adam(params=model.parameters(), lr=1e-5)
loss_fn = torch.nn.CrossEntropyLoss()
device = torch.device('cuda') if torch.cuda.is_available() else torch.device('cpu')
model.to(device)

def train_model(dataloader, model, optimizer, loss_fn, device):
    model.train()
    total_loss = 0

    for batch in dataloader:
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = torch.tensor([1]*input_ids.size(0)).to(device)  # 임의의 레이블 설정

        outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss

        if loss is not None:
            total_loss += loss.item()

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

    return total_loss / len(dataloader)

EPOCHS = 3
for epoch in range(EPOCHS):
    train_loss = train_model(dataloader, model, optimizer, loss_fn, device)
    print(f'Epoch {epoch+1}/{EPOCHS}, Training Loss: {train_loss}')

# 모델 저장
model.save_pretrained('trained_kobert_model')
tokenizer.save_pretrained('trained_kobert_tokenizer')
