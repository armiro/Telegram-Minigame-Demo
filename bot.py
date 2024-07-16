import logging
from telegram.ext import Application, CommandHandler, ContextTypes
from telegram import Update


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

BOT_TOKEN = ''
IMAGE_PATH = './hoskinson.png'


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_text('welcome to the mini-game crypto bot!')


async def mini_app(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    await update.message.reply_photo(photo=open(IMAGE_PATH, mode='rb'))


app = Application.builder().token(BOT_TOKEN).build()
app.add_handler(CommandHandler('start', start))
app.add_handler(CommandHandler('show_image', mini_app))
app.run_polling()


