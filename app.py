from flask import Flask, request, jsonify
from mongodb_connection import users_collection


app = Flask(__name__)


@app.route('/tap', methods=['POST'])
def tap():
    user_id = request.form['guid']
    user = users_collection.find_one({'guid': user_id})
    if user:
        new_balance = user['balance'] + 1
        users_collection.update_one({'guid': user_id}, {'$set': {'balance': new_balance}})
        return jsonify({})
    else:
        return jsonify({'error': 'User not found!'}), 404


@app.route('/get_balance', methods=['GET'])
def get_balance():
    user_id = request.args.get('guid')
    print(user_id)
    user = users_collection.find_one({'guid': user_id})
    if user:
        return jsonify({'balance': user['balance']})
    else:
        users_collection.insert_one({'guid': user_id, 'balance': 0})
        return jsonify({'balance': 0})


if __name__ == '__main__':
    app.run()
