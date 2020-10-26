import linebot from 'linebot'
import dotenv from 'dotenv' 
import axios from 'axios'
import life from './life.js'

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
        // (吃飯位置座標)
        for (let i = 0;i<life.eat.length;i++) {
            if (event.message.text === life.eat[i].name) {
                event.reply(
                    {
                        type: 'location',
                        title: life.eat[i].name,
                        address: life.eat[i].location,
                        latitude: life.eat[i].latitude,
                        longitude: life.eat[i].longitude
                    }
                )
            }
        }        
        // (讀書位置座標)
        for (let i = 0;i<life.study.length;i++) {
            if (event.message.text === life.study[i].name) {
                event.reply(
                    {
                        type: 'location',
                        title: life.study[i].name,
                        address: life.study[i].location,
                        latitude: life.study[i].latitude,
                        longitude: life.study[i].longitude
                    }
                )
            }
        }
        // 吃飯列表產生
        if (event.message.text === '吃飯') {
            const what = life.eat
            const reply = {
                type: 'template',
                altText: 'this is a carousel template',
                template: {
                    type: 'carousel',
                    columns: []
                }
            }
            for(let data of what) {
                const d = new Date()
                let when = d.getDay()
                reply.template.columns.push({
                    thumbnailImageUrl: 'https://example.com/bot/images/item1.jpg',
                    title: data.name,
                    text: data.location,
                    actions: [{
                        type: 'message',
                        label: '在哪裡',
                        text: data.name
                    }, {
                      type: 'message',
                      label: '價位',
                      text: '陸續開發中'
                    }, {
                      type: 'message',
                      label: '營業時間',
                      text: data.time[when]
                    }]
                  })
                }
            //   回應的固定板型
            event.reply(reply);
        }

    } catch (error) {
        event.reply('錯誤')
        console.log(error)
    }

})

bot.listen('/', process.env.PORT,()=>{
    console.log('已啟動')
})