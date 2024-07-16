from pymongo import MongoClient
# from urllib.parse import quote_plus


USR = 'test-admin'
PWD = 'Aa_13741374'
CLUSTER_NAME = 'testcluster'
APP_NAME = 'TestCluster'


cluster_url = f'{CLUSTER_NAME}.phixehn.mongodb.net'
uri = f"mongodb+srv://{USR}:{PWD}@{cluster_url}/?retryWrites=true&w=majority&appName={APP_NAME}"
client = MongoClient(uri)

try:
    client.admin.command('ping')
    print("Pinged deployment. Successfully connected to MongoDB!")
    print('creating database...')
    db = client['test_db']
    users_collection = db['users']
    print(f'database "{db.name}" created!')
except Exception as e:
    print(e)

