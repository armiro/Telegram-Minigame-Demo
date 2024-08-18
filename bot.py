"""
@file bot.py
@description This file is a preview of the bot functions & database collection updates

@author Arman H
@contact arman.haghanifar@gmail.com
@website https://armiro.github.io
@linkedin https://linkedin.com/in/armanhgh

@note Feel free to contact or open issue to learn more about the project, collaborate, or discuss source code pricing

@repository https://github.com/armiro/Telegram-Minigame-Demo
"""


import logging
import os
from telegram.ext import Application, CommandHandler, ContextTypes
from mongo_db import get_users_collection
# import other libraries ...


REF_CODE_LENGTH = 0
WELCOME_BONUS = 0
REF_BONUS = 0

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv('./variables.env')
users_collection = get_users_collection()


def generate_ref_code(guid, length=REF_CODE_LENGTH):
    return None


def generate_random_reward():
    return None


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    return None


# define other functions ...


def main() -> None:
    pass


if __name__ == '__main__':
    main()
