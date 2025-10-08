# E.S.T.B. aka EzCaptcha Status Telegram Bot by [Tavel](https://tavel.in/en/) and GPT-4o

This Telegram bot, written entirely using GPT-4o, checks the current status of Outlook's FunCAPTCHA solution via [EzCaptcha](https://dashboard.ez-captcha.com/#/register?inviteCode=VOFNUzlKSNA) API.

The bot is available at this link: [https://t.me/ezstatus_bot](https://t.me/ezstatus_bot)

## Supported commands

← `/start`: Asks for your [EzCaptcha](https://dashboard.ez-captcha.com/#/register?inviteCode=VOFNUzlKSNA) ClientKey or directly shows current API answer if your key is already stored in DB

← `/reset`: Completely removes your [EzCaptcha](https://dashboard.ez-captcha.com/#/register?inviteCode=VOFNUzlKSNA) ClientKey from the database

## What about security?
1. The bot is completely open source, anyone can view its [Node.js source code](https://glitch.com/edit/#!/ez-status-bot), make own copy of it, etc.
2. The keys are stored in the SQLite DB, the file of which is stored in a private directory.
3. `/reset` command completely removes your key from the DB, no other logs are kept and nothing else is saved in the DB.
4. The bot was created entirely by GPT-4o in 2 hours and does not involve any monetization, so your keys will not be used by me anywhere or in any way.
5. If paranoia does not let go, then no one is stopping you from changing your key in the [EzCaptcha control panel](https://dashboard.ez-captcha.com/#/dashboard) after using the bot.

