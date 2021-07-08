from __future__ import print_function
import pickle
import os.path
import json
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import sys

# If modifying these scopes, delete the file token.pickle.
SCOPES = ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/documents']

input_args = sys.argv
country = input_args[1]

def main():
    """Shows basic usage of the Docs API.
    Prints the title of a sample document.
    """
    creds = None
    # The file token.pickle stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    doc_service = build('docs', 'v1', credentials=creds)
    drive_service = build('drive', 'v3', credentials=creds)
  
    
    original_doc_id = "1zvlWWy1Q7-thTTSs0Wf0rPAM1r1bB07UTuFZd5PAfjo"

    # load json file with urls of files
    with open('../../files/review-by-country/' +country +'/files_urls_with_incorporated.json', encoding="utf8") as json_file:
        files_urls = json.load(json_file)

    with open('../../files/review-by-country/' +country +'/external_folders_urls.json', encoding="utf8") as json_file:
        folders_urls = json.load(json_file)
    
    
    



    copy_title = country + ' - ParentText Content Review & Adaptation'
    body = {
            'name': copy_title
        }
    drive_response = drive_service.files().copy(
        fileId=original_doc_id, body=body).execute()
    document_copy_id = drive_response.get('id')

    doc = doc_service.documents().get(documentId=document_copy_id).execute()
    doc_content = doc.get('body').get('content')

    
    # function to read the text of the document and find all the positions of the url to replace
       
    def findLinksInDoc(doc):
        links = []
        for struct_element in doc:
            if 'paragraph' in struct_element:
                parag_elements = struct_element.get('paragraph').get('elements')
                for parag_elem in parag_elements:
                    
                    if 'textRun' in parag_elem:
                        if 'link' in parag_elem.get('textRun').get('textStyle'):
                            new_link = {}
                            new_link[parag_elem.get('textRun').get('content')] = [parag_elem.get('startIndex'), parag_elem.get('endIndex')]
                            links.append(new_link)
            elif 'table' in struct_element:
            # The text in table cells are in nested Structural Elements and tables may be
            # nested.
                table = struct_element.get('table')
                for row in table.get('tableRows'):
                    cells = row.get('tableCells')
                    for cell in cells:
                        links_from_table = findLinksInDoc(cell.get('content'))
                        links = links + links_from_table



    
    
        return links
    
    links_positions = findLinksInDoc(doc_content)
    
    
    requests = []

    for link_obj in links_positions:
        for text_in_doc in link_obj.keys():

            if text_in_doc in files_urls:
                new_url = files_urls.get(text_in_doc)
            elif text_in_doc in folders_urls:
                new_url = folders_urls.get(text_in_doc)     
            else:
                print("error, no url found for " + text_in_doc)
                break

            requests.append(
                {"updateTextStyle":{
                        "textStyle": {
                            "link": {"url": new_url}
                        },
                        "fields": "link",
                        "range": {
                            "startIndex": link_obj.get(text_in_doc)[0],
                            "endIndex": link_obj.get(text_in_doc)[1],
                        }
                    }

                }
            )
            




    result = doc_service.documents().batchUpdate(
        documentId=document_copy_id, body={'requests': requests}).execute()
    print('Sent requests to document: {0}'.format(len(requests)))
    print(result)

if __name__ == '__main__':
    main()
