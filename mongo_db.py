import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
# from urllib.parse import quote_plus


load_dotenv('./variables.env')

USR = os.getenv(key='MONGODB_USR')
PWD = os.getenv(key='MONGODB_PWD')
CLUSTER_NAME = 'testcluster'
APP_NAME = 'TestCluster'


def get_database_uri(usr, pwd, cluster_name, app_name):
    cluster_url = f'{cluster_name}.phixehn.mongodb.net'
    return f"mongodb+srv://{usr}:{pwd}@{cluster_url}/?retryWrites=true&w=majority&appName={app_name}"


def connect_to_mongo():
    uri = get_database_uri(USR, PWD, CLUSTER_NAME, APP_NAME)
    return MongoClient(uri)


def ping_database(client: MongoClient) -> None:
    try:
        client.admin.command('ping')
        print("pinged deployment. successfully connected to MongoDB!")
    except ConnectionFailure as e:
        print(e)


def get_users_collection(db_name='test_db', collection_name='users'):
    client = connect_to_mongo()
    ping_database(client)
    try:
        print('creating database...')
        db = client[db_name]
        users_collection = db[collection_name]
        print(f'database "{db.name}" created!')
        return users_collection
    except OperationFailure as e:
        print('failed to create db or access collection:', e)
    except Exception as e:
        print('unexpected error:', e)
