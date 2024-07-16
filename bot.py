import logging
from telegram.ext import Application, CommandHandler, ContextTypes, Updater
from telegram import Update
from pymongo import MongoClient
from mongodb_connection import users_collection


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = '7251575252:AAEbeZo1rNLmE8zInZSnbtr66S5WPPSOLvI'
APP_LINK = 'https://t.me/mustchio_bot/hoskinson'


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # guid = update.effective_user.id
    # user = users_collection.find_one({'guid': guid})
    # if not user:
    #     users_collection.insert_one({'guid': guid, 'balance': 0})

    welcome_msg = "Welcome to the mini-game crypto bot! Tap on funny Donald Trump to earn $DJT token!"
    game_link_msg = f"<a href={APP_LINK}>Tap to open the game!</a>"
    await update.message.reply_text(welcome_msg, parse_mode='HTML')
    await update.message.reply_text(game_link_msg, parse_mode='HTML', disable_web_page_preview=False)


def main() -> None:
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler('start', start))
    app.run_polling()


if __name__ == '__main__':
    main()
