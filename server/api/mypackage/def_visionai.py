from google.cloud import vision
import io
import requests

def detect_text_from_image_url(url):
    client = vision.ImageAnnotatorClient()

    # URL을 Vision API의 이미지 소스로 설정
    image = vision.Image()
    image.source.image_uri = url

    response = client.text_detection(image=image)
    texts = response.text_annotations

    if response.error.message:
        raise Exception(f'{response.error.message}')

    return texts

def extract_text_from_thumbnail(video_id):
    url = 'https://img.youtube.com/vi/' + video_id + '/0.jpg'
    texts = detect_text_from_image_url(url)

    if not texts:
        return "No text found."

    extracted_text = texts[0].description
    return extracted_text