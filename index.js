import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'
import life from './life.js'

dotenv.config()

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})
const distance = (lat1, lon1, lat2, lon2, unit) => {
  if ((lat1 === lat2) && (lon1 === lon2)) {
    return 0
  } else {
    const radlat1 = Math.PI * lat1 / 180
    const radlat2 = Math.PI * lat2 / 180
    const theta = lon1 - lon2
    const radtheta = Math.PI * theta / 180
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
    if (dist > 1) {
      dist = 1
    }
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit === 'K') { dist = dist * 1.609344 }
    if (unit === 'N') { dist = dist * 0.8684 }
    return dist
  }
}

bot.on('message', async event => {
  // 新北市ubike交通資料
  const traffic = await axios.get('https://data.ntpc.gov.tw/api/datasets/71CD1490-A2DF-4198-BEF1-318479775E8A/json?page=0&size=1000')
  // 職訓局周邊食衣住
  try {
    // ubike部分
    if (event.message.type === 'location') {
    // 使用者傳送的資料
      const userlatitude = event.message.latitude
      const userlongitude = event.message.longitude
      let recentlytitle = ''
      let recentlyaddress = ''
      let recentlylatitude = 0
      let recentlylongitude = 0
      let recentlysbi = ''
      let small = distance(traffic.data[0].lat, traffic.data[0].lng, userlatitude, userlongitude)
      for (const res of traffic.data) {
        const count = distance(res.lat, res.lng, userlatitude, userlongitude)
        if (small > count) {
          small = count
          recentlytitle = res.sna
          recentlyaddress = res.ar
          recentlylatitude = res.lat
          recentlylongitude = res.lng
          recentlysbi = res.sbi
          console.log(res.sna)
        }
      }
      event.reply({
        type: 'location',
        title: recentlytitle + '(可借車輛:' + recentlysbi + ')',
        address: recentlyaddress,
        latitude: recentlylatitude,
        longitude: recentlylongitude
      })
    }
    // (吃飯位置座標)
    for (let i = 0; i < life.eat.length; i++) {
      if (event.message.text === life.eat[i].name) {
        event.reply({
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
    for (let i = 0; i < life.study.length; i++) {
      if (event.message.text === life.study[i].name) {
        event.reply({
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
      for (const data of what) {
        const d = new Date()
        const when = d.getDay()
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
      event.reply(reply)
    }
  } catch (error) {
    event.reply('錯誤')
    console.log(error)
  }
})

bot.listen('/', process.env.PORT, () => {
  console.log('已啟動')
})
