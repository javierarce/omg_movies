const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const Bot = require('./bot.js')
let bot = new Bot()

let Movie = {}

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

const onError = (error) => {
  console.log(error)
}

const onGetRhymesForActor = (response) => {
  if (!response.data || !response.data.length) {
    console.log(`couldnt find rhymes for ${Movie.actorLastName}`)

    console.log(Movie)
    let status = bot.generateStatusForActorAndMovie(Movie.newTitle, Movie.actor, Movie.data)
    bot.publishTweet(status)

    return
  }

  let lastNameRhyme = bot.getRhymeOrContextFromData(response.data)

  if (lastNameRhyme) {
    Movie.newActorName = bot.buildNewActorName(Movie.actor, Movie.actorLastName, lastNameRhyme)
    console.log(Movie)
    
    let status = bot.generateStatusForActorAndMovie(Movie.newTitle, Movie.newActorName, Movie.data)
    bot.publishTweet(status)
  } else {
    console.log(Movie)
    let status = bot.generateStatusForActorAndMovie(Movie.newTitle, Movie.actor, Movie.data)
    bot.publishTweet(status)   
  }
}

const onGetRhymesForMovie = (response) => {

  if (!response.data || !response.data.length) {
    throw(`couldnt find rhymes for ${Movie.word}`)
  }

  let titleRhyme = bot.getRhymeOrContextFromData(response.data)

  if (titleRhyme) {
    Movie.newTitle = bot.getNewTitle(Movie.title, Movie.word, titleRhyme)
    Movie.actor = bot.getRandomActor(Movie.data)
    Movie.actorLastName = bot.getActorLastName(Movie.actor)

    bot.getRhymesFor(Movie.actorLastName.toLowerCase()).then(onGetRhymesForActor).catch(onError)  
  }
}

const onGetRandomMovie = (response) => {

  if (!response.data) {
    throw('Couldn\'t find a movie, sorry')    
  }

  Movie.data = response.data
  Movie.title = response.data.Title

  if (!Movie.title) {
    throw('Couldn\'t find a title, sorry')
  }

  Movie.word = bot.getRandomWord(Movie.title)

  if (!Movie.word) {
    throw('Couldn\'t find a word in the title, sorry')
  }

  bot.getRhymesFor(Movie.word.toLowerCase()).then(onGetRhymesForMovie).catch(onError)
}

app.get('/movie', (request, response) => {
  Movie = {}
  bot.getRandomMovie().then(onGetRandomMovie).catch(onError)
  response.end('ok')
})

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})