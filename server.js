const express = require("express");

const TelegramBot = require("node-telegram-bot-api");

const db = require('./database');

const axios = require('axios');

const dotenv = require('dotenv');

const basicAuth = require('basic-auth');

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

const token = process.env.TELEGRAM_BOT_TOKEN;

const API_URL = 'https://api.ez-captcha.com/obtainServiceStatus';

const payload = { clientKey: '', websiteKey: process.env.OUTLOOK_FUNCAPTCHA_SITEKEY, type: 'FunCaptchaTaskProxyless' };

const bot = new TelegramBot(token, { polling: true });

async function MakeAPICall(url, data)
{
  try 
  {
    const response = await axios.post(url, data);
    
    return `EzCaptcha API response: \n\`\`\`\n${JSON.stringify(response.data)}\n\`\`\``;
  } 
  catch (error) 
  {
    return `EzCaptcha API error: ${error.message}`;
  }  
}

// Middleware for Basic Authentication
const authenticate = (req, res, next) => 
{
  const credentials = basicAuth(req);

  if (!credentials || credentials.name !== process.env.HTTP_AUTH_USERNAME || credentials.pass !== process.env.HTTP_AUTH_PASSWORD) 
  {
    res.set('WWW-Authenticate', 'Basic realm="Example"');

    res.status(401).send('Authentication required.');
    
    return;
  }

  next();
};

bot.onText(/\/start/, async(msg) => 
{
  const chatId = msg.chat.id;
  
  // Check if the user is already in the database
  const row = await new Promise((resolve, reject) => 
        {
          db.get('SELECT client_key FROM customers WHERE chat_id = ?', [chatId], (err, row) => 
          {
            if (err) 
            {
              reject(err);
            } 
            else 
            {
              resolve(row);
            }
          });
        });
  
    if (row && row.client_key) 
    {
      // User found in the database, make POST request with stored client_key
      const clientKey = row.client_key;
    
      payload.clientKey = clientKey;
      
      const result = await MakeAPICall(API_URL, payload);

      bot.sendMessage(chatId, result, { parse_mode: 'MarkdownV2' });
    } 
    else 
    {
      bot.sendMessage(chatId, 'Please enter your EzCaptcha Client Key:');
    }
});

bot.onText(/\/reset/, async (msg) => 
{
  const chatId = msg.chat.id;

  try 
  {
    // Delete the user's record from the database
    await new Promise((resolve, reject) => 
    {
      db.run('DELETE FROM customers WHERE chat_id = ?', [chatId], (err) => 
      {
        if (err) 
        {
          reject(err);
        } 
        else 
        {
          resolve();
        }
      });
    });

    bot.sendMessage(chatId, 'Your EzCaptcha Client Key has been deleted successfully.');
  } 
  catch (error)
  {
    bot.sendMessage(chatId, 'An error occurred while resetting your client key.');
  }
});

bot.on('message', async(msg) => 
{
  const chatId = msg.chat.id;
  
  const clientKey = msg.text.trim().toLowerCase();

  // Ignore non-commands
  if (clientKey === '/start' || clientKey === '/reset') return;
  
  // Regular expression to validate the clientKey
  const keyPattern = /^[0-9a-f]{38}$/;

  // Validate the clientKey
  if (!keyPattern.test(clientKey)) 
  {
    bot.sendMessage(chatId, 'Your ClientKey is invalid');
    
    return;
  }  
  
  try 
  {
    await new Promise((resolve, reject) => 
    {
      // Store the client key in the database  
      db.run('INSERT OR REPLACE INTO customers (chat_id, client_key) VALUES (?, ?)', [chatId, clientKey], (err) => 
      {
        if (err) 
        {
          reject(err);
        } 
        else 
        {
          resolve();
        }
      });
    });

    payload.clientKey = clientKey;

    const result = await MakeAPICall(API_URL, payload);
  
    bot.sendMessage(chatId, result, { parse_mode: 'MarkdownV2' });

  } catch (error) {
    bot.sendMessage(chatId, 'An error occurred while saving your client key.');
  }
});

app.get("/", (req, res) => 
{
  res.send("EzCaptcha status Telegram bot is running!");
});

// Route to fetch and display stored data with Basic Authentication
app.get("/data", authenticate, (req, res) => 
{
  db.all("SELECT * FROM customers", [], (err, rows) => 
  {
    if (err) 
    {
      res.status(500).json({ error: err.message });
      
      return;
    }
    res.json(
    {
      message: "success",
      data: rows
    });
  });
});

app.listen(port, () => 
{
  console.log(`Server is running on port ${port}`);
});
