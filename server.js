const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const Bot = require('./bot.js')

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

app.get('/movie', (request, response) => {

  let movie = undefined
  let word = undefined
  let title = undefined
  let actor = undefined
  let actorLastName = undefined
  let newTitle = undefined
  let newActorName = undefined

  let bot = new Bot()

  const onGetRhymesForActor = (response) => {
    if (!response.data || !response.data.length) {
      console.log(`couldnt find rhymes for ${actor}`)
      let status = bot.generateStatusForActorAndMovie(newTitle, actor, movie)
      bot.publishTweet(status)
      console.log(3, status)
      return
    }

    let lastNameRhyme = bot.getRhymeOrContextFromData(response.data)


    if (lastNameRhyme) {
      console.log('Lastname rhyme: ', lastNameRhyme)

      if (lastNameRhyme) {
        newActorName = bot.buildNewActorName(actor, actorLastName, lastNameRhyme)

        console.log('New actor name: ', newActorName)

        let status = bot.generateStatusForActorAndMovie(newTitle, newActorName, movie)
        bot.publishTweet(status)
        console.log(1, status)
      }
    } else {
      let status = bot.generateStatusForActorAndMovie(newTitle, actor, movie)
      bot.publishTweet(status)
      console.log(2, status)
    }

    console.log('-----')
  }

  const onGetRhymesForMovie = (response) => {

    if (!response.data || !response.data.length) {
      console.log(`couldnt find rhymes for ${word}`);
      return
    }

    let titleRhyme = bot.getRhymeOrContextFromData(response.data)

    if (titleRhyme) {
      newTitle = bot.getNewTitle(title, word, titleRhyme)
      actorLastName = bot.getActorLastName(actor)

      console.log('Title rhyme: ', titleRhyme)
      console.log('New title: ', newTitle)
      console.log('Last name: ', actorLastName)  

      bot.getRhymesFor(actorLastName.toLowerCase()).then(onGetRhymesForActor).catch(onError)  
    }
  }

  const onGetRandomMovie = (response) => {
    movie = response.data
    title = response.data.Title

    if (!title) {
      console.log("Couldn't find a title, sorry")
      return
    }

    console.log('Movie: ', title)

    word = bot.getRandomWord(title)

    if (!word) {
      console.log("Couldn't find a word in the title, sorry")
      return
    }

    actor = bot.getRandomActor(movie)

    console.log('Actor: ', actor)
    console.log('Word: ', word)

    bot.getRhymesFor(word.toLowerCase()).then(onGetRhymesForMovie).catch(onError)
  }

  bot.getRandomMovie().then(onGetRandomMovie).catch(onError)
  response.end('ok')
})

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})