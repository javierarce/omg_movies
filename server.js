const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const Bot = require('./bot.js')

let bot = new Bot()

app.use(express.static('public'))

app.use(bodyParser.json()) 
app.use(
  bodyParser.urlencoded({
    extended: true
  })
) 

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html')
})

app.get(`/${process.env.SECRET}`, (request, response) => {
  bot.start()
  response.end('ok')
})

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})