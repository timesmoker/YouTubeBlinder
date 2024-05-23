from googleapiclient.discovery import build
import unicodedata
def get_video_information(api_key, video_id):
    youtube = build('youtube', 'v3', developerKey=api_key)
    request = youtube.videos().list(
        part='snippet',
        id=video_id
    )
    response = request.execute()
    item = response['items'][0]
    title = item['snippet']['title']
    title = unicodedata.normalize('NFC', title)
    thumbnail = item['snippet']['thumbnails']['default']['url']
    description = item['snippet']['description']
    tags = item['snippet']['tags']
    categoryId = item['snippet']['categoryId']

    return title,tags,thumbnail,description,categoryId