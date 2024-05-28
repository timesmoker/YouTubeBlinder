import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader, random_split
from transformers import AdamW, get_cosine_schedule_with_warmup
from transformers import BertTokenizer, BertForSequenceClassification
import os

# output.txt 파일 경로
file_path = 'output.txt'

# KoBERT 토크나이저 및 모델 로드
tokenizer = BertTokenizer.from_pretrained('monologg/kobert')
model = BertForSequenceClassification.from_pretrained('monologg/kobert', num_labels=2)

# 데이터셋 클래스 정의
class CustomDataset(Dataset):
    def __init__(self, file_path, tokenizer, max_len):
        self.data = self.load_data(file_path)
        self.tokenizer = tokenizer
        self.max_len = max_len

    def load_data(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        data = []
        for line in lines:
            line = line.strip()
            if line:
                data.append((line, 0))  # 모든 레이블을 0으로 설정
        return data

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        text, label = self.data[idx]
        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=self.max_len,
            return_token_type_ids=False,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt',
        )
        return {
            'text': text,
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'label': torch.tensor(label, dtype=torch.long)
        }

# 데이터 로드 및 전처리
dataset = CustomDataset(file_path, tokenizer, max_len=64)

# 데이터셋을 훈련 세트와 테스트 세트로 분할
train_size = int(0.8 * len(dataset))
test_size = len(dataset) - train_size
train_dataset, test_dataset = random_split(dataset, [train_size, test_size])

# 데이터 로더 준비
train_dataloader = DataLoader(train_dataset, batch_size=32, shuffle=True)
test_dataloader = DataLoader(test_dataset, batch_size=32)

# 모델 준비
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
model = model.to(device)

# Optimizer 및 스케줄러 설정
optimizer = AdamW(model.parameters(), lr=5e-5)
total_steps = len(train_dataloader) * 3  # 총 학습 스텝 수
scheduler = get_cosine_schedule_with_warmup(optimizer, num_warmup_steps=int(0.1 * total_steps), num_training_steps=total_steps)

# 손실 함수 정의
loss_fn = nn.CrossEntropyLoss().to(device)

# 정확도 계산 함수
def calc_accuracy(preds, labels):
    _, pred_max = torch.max(preds, dim=1)
    acc = (pred_max == labels).sum().item() / len(preds)
    return acc

# 모델 학습
for epoch in range(3):
    model.train()
    total_train_loss = 0
    total_train_acc = 0

    for batch in train_dataloader:
        optimizer.zero_grad()
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['label'].to(device)

        outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
        loss = outputs.loss
        logits = outputs.logits

        total_train_loss += loss.item()
        total_train_acc += calc_accuracy(logits, labels)

        loss.backward()
        optimizer.step()
        scheduler.step()

    avg_train_loss = total_train_loss / len(train_dataloader)
    avg_train_acc = total_train_acc / len(train_dataloader)

    print(f"Epoch {epoch + 1}")
    print(f"Train loss: {avg_train_loss}, Train accuracy: {avg_train_acc}")

    # 평가
    model.eval()
    total_eval_loss = 0
    total_eval_acc = 0

    with torch.no_grad():
        for batch in test_dataloader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['label'].to(device)

            outputs = model(input_ids=input_ids, attention_mask=attention_mask, labels=labels)
            loss = outputs.loss
            logits = outputs.logits

            total_eval_loss += loss.item()
            total_eval_acc += calc_accuracy(logits, labels)

    avg_eval_loss = total_eval_loss / len(test_dataloader)
    avg_eval_acc = total_eval_acc / len(test_dataloader)

    print(f"Validation loss: {avg_eval_loss}, Validation accuracy: {avg_eval_acc}")

"""
# 파인튜닝된 모델 저장 (잠깐 주석처리)
model_path = './fine_tuned_kobert'
os.makedirs(model_path, exist_ok=True)
model.save_pretrained(model_path)
tokenizer.save_pretrained(model_path)
"""
