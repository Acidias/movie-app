# myapp/tests.py
from django.test import TestCase, Client

class DownloadSubtitleTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_analyse_subtitle(self):
        # Replace with your static TMDb id
        tmdb_id = '315635'
        response = self.client.get(f'/analyse_subtitle/?tmdb_id={tmdb_id}')
        
        # Output the response content for debugging
        print(response.content)
        
        # Assert that the response status code is 200 (OK)
        self.assertEqual(response.status_code, 200)
        
        # You can also check the content of the response
        # For example, you can check if the response contains the success message.
        response_data = response.json()
        self.assertEqual(response_data.get('success'), 'Subtitle downloaded successfully')
        
        # Optionally, you can check if the file is actually downloaded by checking its existence in the file system.
        # import os
        # file_name = response_data.get('file_name')
        # self.assertTrue(os.path.exists(file_name))
