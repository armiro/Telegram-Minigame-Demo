import logging
import os
import hashlib
from dotenv import load_dotenv

from telegram.ext import Application, CommandHandler, ContextTypes
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from mongo_db import get_users_collection


REF_CODE_LENGTH = 10
WELCOME_BONUS = 250
REF_BONUS = 1500

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv('./variables.env')
users_collection = get_users_collection()


def generate_ref_code(guid, length=REF_CODE_LENGTH):
    hashed_id = hashlib.sha256(guid.encode()).hexdigest()
    return hashed_id[:length]


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    guid = str(update.effective_user.id)
    referred_by = context.args[0] if context.args else None

    user = users_collection.find_one({'guid': guid})  # use `guid` as primary key
    if not user:
        new_ref_code = generate_ref_code(guid=guid)  # generate new user's referral code
        init_balance = WELCOME_BONUS if referred_by else 0
        users_collection.insert_one({'guid': guid, 'balance': init_balance, 'speed': 1.0,
                                     'ref_code': new_ref_code, 'referred_by': referred_by, 'num_referrals': 0})
        if referred_by:
            referrer = users_collection.find_one({'ref_code': referred_by})  # `ref_code` is also a primary key
            if referrer:
                users_collection.update_one(
                    {'ref_code': referred_by},
                    {'$inc': {'balance': REF_BONUS, 'num_referrals': 1}}
                )

    if user:
        welcome_msg = f"Welcome back, {update.effective_user.username}! Continue earning $MuskTap points!"
    else:
        welcome_msg = "Welcome to the mini-game crypto bot! Tap on funny Elon Musk to earn $MuskTap points!"

    referral_msg = f"Join me on playing MuskTap and receive {WELCOME_BONUS} coins as your welcome bonus!\n" \
                   f"{os.getenv(key='BOT_LINK')}?start={generate_ref_code(guid)}"
    keyboard = [
        [InlineKeyboardButton(text='Launch the Game!', web_app=WebAppInfo(url=os.getenv(key='APP_LINK')))],
        [InlineKeyboardButton(text='Follow Us on X', url=os.getenv(key='X_PROFILE'))],
        [InlineKeyboardButton(text=f'Invite & Earn {REF_BONUS} Points!', url=f'tg://msg?text={referral_msg}')]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(welcome_msg, reply_markup=reply_markup, parse_mode='HTML')


def main() -> None:
    bot_token = os.getenv(key='BOT_TOKEN')
    app = Application.builder().token(bot_token).build()
    app.add_handler(CommandHandler('start', start))
    app.run_polling()


if __name__ == '__main__':
    main()
