'use strict'

const _ = require('underscore')
const axios = require('axios')
const rand = require('unique-random')
const Twit = require('twit')

const movies = require('./movies.json')
const movieTemplates = require('./movie_templates.json')

let config = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.TWITTER_CONSUMER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_CONSUMER_ACCESS_TOKEN_SECRET,
  timeout_ms: 60*1000
}

const T = new Twit(config)

const capitalize = (string) => {
  if (!string) return string
  return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase()
}

module.exports = class Bot {
  getRandomActor (movie) {
    let actors = movie.Actors.split(',')
    return actors[rand(0, actors.length - 1)()].trim()
  }

  buildNewActorName (actor, word, rhyme) {
    let regexp = new RegExp(word, 'g')
    return actor.replace(regexp, capitalize(rhyme))
  }

  getActorLastName (name) {
    let names = name.trim().split(' ')
    return names[names.length - 1]
  }

  getNewTitle (title, word, rhyme) {
    let regexp = new RegExp(word, 'g')
    return title.replace(regexp, capitalize(rhyme))
  }

  _getRandomGenre (movie) {
    let genres = movie.Genre.split(',')
    return genres[0].trim().toLowerCase()
  }

  _getRandomExclamation () {
    let exclamations = ['OMG', 'hahaha', 'wow', 'guys', 'yay']
    let r = rand(0, exclamations.length - 1)()
    return exclamations[r]
  }

  _getRandomTemplate (templates) {
    let r = rand(0, templates.length - 1)()
    return _.template(templates[r])
  }

  getRandomMovie () {
    let movie = movies[rand(0, movies.length - 1)()]
    let url = `http://www.omdbapi.com?i=${movie}&apikey=${process.env.OMDB_API}`
    return axios.get(url)
  }

  getRhymesFor (word) {
    let useCanonical = false
    let relationshipTypes = 'rhyme'
    let limitPerRelationshipType = 10
    let host = process.env.WORDNICK_HOST
    let api_key = process.env.WORDNICK_API
    let endpoint = 'relatedWords'

    let url = `${host}/v4/word.json/${word}/${endpoint}?useCanonical=${useCanonical}&limitPerRelationshipType=${limitPerRelationshipType}&api_key=${api_key}`

    return axios(url)
  }

  getRandomWord (sentence) {
    sentence = sentence.replace(/\W+/g, ' ')
    let words = sentence.trim().split(' ')

    words = _.reject(words, (word) => {
      return word.length < 3
    })

    let word = words[rand(0, words.length - 1)()]

    let forbiddenWords = [
      'the', 'of', 'for', 'but', 'and', 'with', 'from', 'any',
      'some', 'an', 'a', 'without', 'by', 'de', 'days', 'c', 'b', 'l'
    ]

    while (_.contains(forbiddenWords, word.toLowerCase())) {
      word = words[rand(0, words.length - 1)()]
    }
    return word
  }

  getRhymeOrContextFromData (data) {
    let rhymes = []
    let sameContext = []

    data.forEach((relationship) => {
      if (relationship.relationshipType === 'rhyme') {
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
    let tpl = this._getRandomTemplate(templates)

    let director = movie.Director
    let genre = this._getRandomGenre(movie)
    let exclamation = this._getRandomExclamation()
    
    return tpl({ title, actor, director, genre, exclamation })
  }
  
  publishTweet (status) {
    if (process.env.ENABLED === 'false') {
      console.log('Tweeting is disabled')
      console.log(status)
      return
    } 
    /*
    T.post('statuses/update', { status }, (err, data, response) => {
      if (err) {
        console.log('Error: ', err)
      } else {
        console.log('Published: ', status)
      }
    })
    */
  }
}
