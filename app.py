from flask import Flask, request, jsonify
from flask_cors import CORS
from mongodb_connection import users_collection


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # enable cross-origin resource sharing


@app.route('/tap', methods=['POST'])
def tap():
    user_id = request.form['guid']
    new_balance = int(request.form['balance'])
    user = users_collection.find_one({'guid': user_id})
    if user:
        users_collection.update_one({'guid': user_id}, {'$set': {'balance': new_balance}})
        return jsonify({})
    else:
        return jsonify({'error': 'User not found!'}), 404


@app.route('/get_balance', methods=['POST'])
def get_balance():
    user_id = request.form.get('guid')
    user = users_collection.find_one({'guid': user_id})
    if user:
        return jsonify({'balance': user['balance'], 'ref_code': user['ref_code']})
    else:
        users_collection.insert_one({'guid': user_id, 'balance': 0})
        return jsonify({'balance': 0})


if __name__ == '__main__':
    app.run(debug=True)
