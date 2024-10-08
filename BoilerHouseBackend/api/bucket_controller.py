import boto3

def find_buckets():
    s3 = boto3.client('s3',
                      aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                      aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"))

    lst = [bucket['Name'] for bucket in s3.list_buckets()['Buckets']]
    return lst
