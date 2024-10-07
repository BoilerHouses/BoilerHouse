import boto3
import os
from dotenv import load_dotenv, dotenv_values
def find_buckets():
    load_dotenv()
    s3 = boto3.client('s3',
                      aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                      aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"))

    lst = [bucket['Name'] for bucket in s3.list_buckets()['Buckets']]
    return lst
