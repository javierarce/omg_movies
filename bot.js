'use strict'

const ENABLED = false // If this is set to true, the bot will publish a Tweet.

const axios = require('axios')
const rand = require('unique-random')
const Twit = require('twit')

const movies = require('./data/movies.json')
const movieTemplates = require('./data/movie_templates.json')
const RHYME = 'rhyme'

const WORDNICK_HOST = 'https://api.wordnik.com'

const FORBIDDEN_WORDS = [
  'the', 'of', 'for', 'but', 'and', 'with', 'from', 'any',
  'some', 'an', 'a', 'without', 'by', 'de', 'days', 'c', 'b', 'l'
]

const EXCLAMATIONS = ['OMG', 'hahaha', 'wow', 'guys', 'yay']

const TWITTER_CONFIG = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_CONSUMER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_CONSUMER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60*1000
}

module.exports = class Bot {
  constructor () {
    this.Tweet = new Twit(TWITTER_CONFIG)
    this.movie = {}  
  }
  
  onError (error) {
    console.log(this.movie)
    console.error(error)
  }

  capitalize (string) {
    if (!string) return string
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase()
  }

  getRandomActor (movie) {
    let actors = movie.Actors.split(',')
    return actors[rand(0, actors.length - 1)()].trim()
  }

  buildNewActorName (actor, word, rhyme) {
    let regexp = new RegExp(word, 'g')
    return actor.replace(regexp, this.capitalize(rhyme))
  }

  getActorLastName (name) {
    let names = name.trim().split(' ')
    return names[names.length - 1]
  }

  getNewTitle (title, word, rhyme) {
    let regexp = new RegExp(word, 'g')
    return title.replace(regexp, this.capitalize(rhyme))
  }

  getRandomGenre (movie) {
    let genres = movie.Genre.split(',')
    return genres[0].trim().toLowerCase()
  }

  getRandomExclamation () {
    let r = rand(0, EXCLAMATIONS.length - 1)()
    return EXCLAMATIONS[r]
  }

  getRandomTemplate (templates) {
    let r = rand(0, templates.length - 1)()
    return templates[r]
  }

  getRandomMovie () {
    let movie = movies[rand(0, movies.length - 1)()]
    let url = `http://www.omdbapi.com?i=${movie}&apikey=${process.env.OMDB_API}`
    return axios.get(url)
  }

  getRhymesFor (word) {
    let useCanonical = false
    let relationshipTypes = RHYME
    let limitPerRelationshipType = 10
    let host = WORDNICK_HOST
    let api_key = process.env.WORDNICK_API
    let endpoint = 'relatedWords'

    let url = `${host}/v4/word.json/${word}/${endpoint}?useCanonical=${useCanonical}&limitPerRelationshipType=${limitPerRelationshipType}&api_key=${api_key}`

    return axios(url)
  }

  getRandomWord (sentence) {
    sentence = sentence.replace(/\W+/g, ' ')
    let words = sentence.trim().split(' ')
    
    words = words.filter((word) => {
      return word.length > 3
    })

    let word = words[rand(0, words.length - 1)()]

    while (FORBIDDEN_WORDS.includes(word.toLowerCase())) {
      word = words[rand(0, words.length - 1)()]
    }
    return word
  }

  getRhymeOrContextFromData (data) {
    let rhymes = []
    let sameContext = []

    data.forEach((relationship) => {
      if (relationship.relationshipType === RHYME) {
        rhymes = relationship.words
      } else if (relationship.relationshipType === 'same-context') {
        sameContext = relationship.words
      }
    })

    if (!rhymes.length) {
      rhymes = sameContext
    }

    if (rhymes && rhymes.length) {
      return this.getRandomRhyme(rhymes)
    } 

    return undefined
  }

  getRandomRhyme (rhymes) {
    if (rhymes) {
      return rhymes[rand(0, rhymes.length - 1)()]
    }
    return null
  }

  generateStatusForActorAndMovie (title, actor, movie) {
    let status = null
    let templates = movieTemplates
    let tpl = this.getRandomTemplate(templates)

    let director = movie.Director
    let genre = this.getRandomGenre(movie)
    let exclamation = this.getRandomExclamation()

    tpl = tpl.replace(new RegExp('DIRECTOR', 'g'), director)
    tpl = tpl.replace(new RegExp('GENRE', 'g'), genre)
    tpl = tpl.replace(new RegExp('ACTOR', 'g'), actor)
    tpl = tpl.replace(new RegExp('TITLE', 'g'), title)
    tpl = tpl.replace(new RegExp('EXCLAMATION', 'g'), exclamation)
    
    return tpl
  }

  onGetRhymesForActor (response) {
    let actor = this.movie.actor

    if (response.data && response.data.length) {
      let lastNameRhyme = this.getRhymeOrContextFromData(response.data)

      if (lastNameRhyme) {
        this.movie.newActorName = this.buildNewActorName(this.movie.actor, this.movie.actorLastName, lastNameRhyme)
        actor = this.movie.newActorName
      } 
    }

    let status = this.generateStatusForActorAndMovie(this.movie.newTitle, actor, this.movie.data)
    this.publishTweet(status)   
  }

  onGetRhymesForMovie (response) {

    if (!response.data || !response.data.length) {
      throw(`couldnt find rhymes for ${this.movie.word}`)
    }

    let titleRhyme = this.getRhymeOrContextFromData(response.data)

    if (!titleRhyme) {
      throw(`couldnt find rhymes`)
    }

    this.movie.newTitle = this.getNewTitle(this.movie.title, this.movie.word, titleRhyme)
    this.movie.actor = this.getRandomActor(this.movie.data)
    this.movie.actorLastName = this.getActorLastName(this.movie.actor)

    this.getRhymesFor(this.movie.actorLastName.toLowerCase()).then(this.onGetRhymesForActor.bind(this)).catch(this.onError.bind(this))  
  }

  onGetRandomMovie (response) {

    if (!response.data) {
      throw('Couldn\'t find a movie, sorry')    
    }

    this.movie.data = response.data
    this.movie.title = this.movie.data.Title

    if (!this.movie.title || this.movie.title.split(' ').length < 2) {
      throw('Couldn\'t find a title, sorry')
    }

    this.movie.word = this.getRandomWord(this.movie.title)

    if (!this.movie.word) {
      throw('Couldn\'t find a word in the title, sorry')
    }

    this.getRhymesFor(this.movie.word.toLowerCase()).then(this.onGetRhymesForMovie.bind(this)).catch(this.onError.bind(this))
  }

  start () {
    try {
      this.getRandomMovie().then(this.onGetRandomMovie.bind(this)).catch(this.onError.bind(this))
    } catch (e) {
      this.onError(e)
    }
  }

  publishTweet (status) {
    if (!ENABLED) {
      console.log('Tweeting is disabled')
      console.log(status)
      return
    } 

    this.Tweet.post('statuses/update', { status }, (err, data, response) => {
      if (err) {
        console.log('Error: ', err)
      } else {
        console.log('Published: ', status)
      }
    })
  }
}