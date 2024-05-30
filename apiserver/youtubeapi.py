from googleapiclient.discovery import build


def load_api_key(file_path):
    with open(file_path, "r") as f:
        api_key = f.read().strip()
    return api_key


def get_video_information(api_key, video_id):
    youtube = build('youtube', 'v3', developerKey=api_key)
    request = youtube.videos().list(
        part='snippet',
        id=video_id
    )

    response = request.execute()

    # 첫 번째 항목 가져오기
    item = response['items'][0] if 'items' in response and len(response['items']) > 0 else {}

    if not item:
        return [], '', '', ''

    snippet = item.get('snippet', {})

    # 각 필드를 안전하게 가져오기
    thumbnail = snippet['thumbnails']['default']['url'] if 'thumbnails' in snippet and 'default' in snippet[
        'thumbnails'] and 'url' in snippet['thumbnails']['default'] else ''
    description = snippet['description'] if 'description' in snippet else ''
    tags = snippet['tags'] if 'tags' in snippet else []
    categoryId = snippet['categoryId'] if 'categoryId' in snippet else ''
    channelId = snippet['channelId'] if 'channelId' in snippet else ''

    return tags, thumbnail, description, categoryId,channelId
