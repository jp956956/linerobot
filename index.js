import linebot from 'linebot'
import dotenv from 'dotenv' 
import axios from 'axios'

dotenv.config()

const bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
})

bot.on('message', async event =>{
    // 抓取本地檔案不需要await，不然會發生錯誤
    const response = axios.get('./test.json')
    let reply = '123'
    try {
        if(event.message.text === '讀書'){
            event.reply(reply)
        }       
    } catch (error) {
        event.reply('錯誤')
    }

})

bot.listen('/', process.env.PORT,()=>{
    console.log('已啟動')
})