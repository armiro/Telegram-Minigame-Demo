from pymongo import MongoClient
# from urllib.parse import quote_plus


USR = 'new-user_31'
PWD = 'Aa_13741374'
CLUSTER_NAME = 'testcluster'
APP_NAME = 'TestCluster'


cluster_url = f'{CLUSTER_NAME}.phixehn.mongodb.net'
uri = f"mongodb+srv://{USR}:{PWD}@{cluster_url}/?retryWrites=true&w=majority&appName={APP_NAME}"
client = MongoClient(uri)

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

