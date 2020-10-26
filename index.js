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
    // 新北市ubike交通資料
    const traffic  = await axios.get('https://data.ntpc.gov.tw/api/datasets/71CD1490-A2DF-4198-BEF1-318479775E8A/json?page=0&size=1000')
    // 職訓局周邊食衣住
    // 抓取本地檔案不需要await，不然會發生錯誤
    const response = axios.get('./life.json')
    try {
        // ubike部分
        for (let res of traffic.data) {
            if (event.message.text === res.sarea) {
                event.reply(
                    {
                    type: 'location',
                    title: res.sna + "(可借車輛:" + res.sbi +')',
                    address: res.ar,
                    latitude: res.lat,
                    longitude: res.lng
                  }
                );
            }
        }
        // 周遭生活部分

       

    } catch (error) {
        event.reply('錯誤')
    }

})

bot.listen('/', process.env.PORT,()=>{
    console.log('已啟動')
})