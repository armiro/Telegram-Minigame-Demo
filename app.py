"""
@file app.py
@description This file is a preview of the server ajax request handling

@author Arman H
@contact arman.haghanifar@gmail.com
@website https://armiro.github.io
@linkedin https://linkedin.com/in/armanhgh

@note Feel free to contact or open issue to learn more about the project, collaborate, or discuss source code pricing

@repository https://github.com/armiro/Telegram-Minigame-Demo
"""


from flask import Flask, request, jsonify
from flask_cors import CORS
from mongo_db import get_users_collection
# import other libraries ...


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
users_collection = get_users_collection()


@app.route('/update_balance', methods=['POST'])
def update_balance():
    pass


@app.route('/get_balance', methods=['POST'])
def get_balance():
    pass


# define other functions ...


if __name__ == '__main__':
    app.run(debug=True)
