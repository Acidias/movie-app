import requests

# Replace these with your actual API Key, username, password, and FILE_ID
API_KEY = 'LaAI4YYyijELzPmtY8B8EyOWafyXC9Bb'
USERNAME = 'Acidias'
PASSWORD = 'ZZx8v_w_2Q9LS_T'
FILE_ID = 123  # replace with your file_id

# OpenSubtitles API endpoint URLs
LOGIN_URL = 'https://api.opensubtitles.com/api/v1/login'
DOWNLOAD_URL = 'https://api.opensubtitles.com/api/v1/download'


def login():
    headers = {
        'Api-Key': API_KEY,
        'Content-Type': 'application/json',
        'User-Agent': 'YourAppName vYourAppVersion'
    }
    data = {
        'username': USERNAME,
        'password': PASSWORD
    }
    response = requests.post(LOGIN_URL, headers=headers, json=data)
    if response.status_code == 200:
        return response.json().get('token')
    else:
        print(f"Error: Unable to login. Status Code: {response.status_code}")
        print(f"Message: {response.text}")
        exit()


def download_subtitle(token):
    headers = {
        'Api-Key': API_KEY,
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'User-Agent': 'YourAppName vYourAppVersion'
    }
    body = {
        'file_id': FILE_ID,
    }
    response = requests.post(DOWNLOAD_URL, headers=headers, json=body)
    if response.status_code == 200:
        download_link = response.json().get('link')
        file_name = response.json().get('file_name')
        subtitle_response = requests.get(download_link)
        if subtitle_response.status_code == 200:
            with open(file_name, 'wb') as subtitle_file:
                subtitle_file.write(subtitle_response.content)
                print(f'Subtitle downloaded successfully as {file_name}')
        else:
            print('Error downloading subtitle file.')
    else:
        print('Error requesting subtitle download URL.')
        print(f'Response Code: {response.status_code}')
        print(f'Response Text: {response.text}')


# Main Execution
token = login()
if token:
    print(f"Login Successful!\nToken: {token}")
    download_subtitle(token)
