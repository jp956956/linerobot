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

    let type = ''


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
    // (吃宵夜位置座標)
    for (let i = 0; i < life.dessert.length; i++) {
      if (event.message.text === life.dessert[i].name) {
        event.reply({
          type: 'location',
          title: life.dessert[i].name,
          address: life.dessert[i].location,
          latitude: life.dessert[i].latitude,
          longitude: life.dessert[i].longitude
        }
        )
      }
    }
    // (洗衣服位置座標)
    for (let i = 0; i < life.wash.length; i++) {
      if (event.message.text === life.wash[i].name) {
        event.reply({
          type: 'location',
          title: life.wash[i].name,
          address: life.wash[i].location,
          latitude: life.wash[i].latitude,
          longitude: life.wash[i].longitude
        }
        )
      }
    }
    // 搭公車位置座標
    for (let i = 0; i < life.bus.length; i++) {
      if (event.message.text === life.bus[i].name) {
        event.reply({
          type: 'location',
          title: life.bus[i].name,
          address: life.bus[i].location,
          latitude: life.bus[i].latitude,
          longitude: life.bus[i].longitude
        }
        )
      }
    }
    // 買東西位置座標
    for (let i = 0; i < life.buy.length; i++) {
      if (event.message.text === life.buy[i].name) {
        event.reply({
          type: 'location',
          title: life.buy[i].name,
          address: life.buy[i].location,
          latitude: life.buy[i].latitude,
          longitude: life.buy[i].longitude
        }
        )
      }
    }
    // 列表產生
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
    } else if (event.message.text === '吃宵夜') {
      const what = life.dessert
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
    } else if (event.message.text === '唸書') {
      const what = life.study
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
    } else if (event.message.text === '洗衣服') {
      const what = life.wash
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
    } else if (event.message.text === '搭車去台北') {
      const what = life.bus
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
          thumbnailImageUrl: data.photo,
          title: data.name,
          text: data.location,
          actions: [{
            type: 'message',
            label: '在哪裡',
            text: data.name
          }, {
            type: 'message',
            label: '價位',
            text: data.price
          }, {
            type: 'message',
            label: '營業時間',
            text: data.time[when]
          }]
        })
      }
      event.reply(reply)
    } else if (event.message.text === '買東西') {
      const what = life.buy
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
          thumbnailImageUrl: data.photo,
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