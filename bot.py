import logging
import os
from dotenv import load_dotenv

from telegram.ext import Application, CommandHandler, ContextTypes
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
# from pymongo import MongoClient
from mongodb_connection import users_collection


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv('./variables.env')


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    app_link = os.getenv(key='APP_LINK')
    guid = update.effective_user.id
    user = users_collection.find_one({'guid': guid})
    if not user:
        users_collection.insert_one({'guid': guid, 'balance': 0})

    welcome_msg = "Welcome to the mini-game crypto bot! Tap on funny Donald Trump to earn $DJT tokens!"
    keyboard = [[InlineKeyboardButton(text='Launch the Game!', web_app=WebAppInfo(url=app_link))]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(welcome_msg, reply_markup=reply_markup, parse_mode='HTML')

    # game_link_msg = f"<a href=\"{APP_LINK}\">Tap to open the game!</a>"
    # await update.message.reply_text(game_link_msg, parse_mode='HTML', disable_web_page_preview=False)


def main() -> None:
    bot_token = os.getenv(key='BOT_TOKEN')
    app = Application.builder().token(bot_token).build()
    app.add_handler(CommandHandler('start', start))
    app.run_polling()


if __name__ == '__main__':
    main()
