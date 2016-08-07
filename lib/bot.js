'use strict';

var _ = require('underscore');
var request = require('request');
var movies = require('../movies.json');
var movieTemplates = require('../movie_templates.json');
var movieActorTemplates = require('../movie_actor_templates.json');

var Q = require('q');
var Twit = require('twit');
var rand = require('unique-random');

module.exports = function(Config) {
  var module = {};

  var T = new Twit(Config);

  module._capitalize = function(string) {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  };

  module.getRandomActor = function(movie) {
    var actors = movie.Actors.split(',');
    return actors[rand(0, actors.length - 1)()].trim();
  };

  module.buildNewActorName = function(actor, word, rhyme) {
    var regexp = new RegExp(word, 'g');
    return actor.replace(regexp, this._capitalize(rhyme));
  };

  module.getActorLastName = function(name) {
    var names = name.trim().split(' ');
    return names[names.length - 1];
  };

  module.getNewTitle = function(title, word, rhyme) {
    var regexp = new RegExp(word, 'g');
    return title.replace(regexp, this._capitalize(rhyme));
  };

  module._getRandomGenre = function(movie) {
    var genres = movie.Genre.split(',');
    return genres[0].trim().toLowerCase();
  };

  module._getRandomExclamation = function() {
    var exclamations = ['OMG', 'hahaha', 'wow', 'guys', 'yay'];
    var r = rand(0, exclamations.length - 1)();
    return exclamations[r];
  };

  module._getRandomTemplate = function(templates) {
    var r = rand(0, templates.length - 1)();
    return _.template(templates[r]);
  };

  module.getRandomWord = function(sentence) {
    sentence = sentence.replace(/\W+/g, ' ');
    var words = sentence.trim().split(' ');

    words = _.reject(words, function(word) {
      return word.length < 3;
    });

    var word = words[rand(0, words.length - 1)()];

    var forbiddenWords = [
      'the', 'of', 'for', 'but', 'and', 'with', 'from', 'any',
      'some', 'an', 'a', 'without', 'by', 'de', 'days', 'c', 'b', 'l'
    ];

    while (_.contains(forbiddenWords, word.toLowerCase())) {
      word = words[rand(0, words.length - 1)()];
    }
    return word;
  };

  module.getNewActorName = function(actor) {
    var names = actor.trim().split(' ');
    var name = names.length > 0 ? names[1] : names[0];
    return this.getRhymesFor(name.toLowerCase());
  };

  module.getRandomRhyme = function(rhymes) {
    if (rhymes) {
      return rhymes[rand(0, rhymes.length - 1)()];
    }
    return null;
  };

  module.getRandomMovie = function() {
    var deferred = Q.defer();
    var movie = movies[rand(0, movies.length - 1)()];
    var url = 'http://www.omdbapi.com?i=' + movie;

    request(url, function(err, response, body) {
      if (err) {
        return console.log('Error', err);
      }

      var movie = JSON.parse(body);
      deferred.resolve(movie);
    });

    return deferred.promise;
  };

  module.getRhymesFor = function(word) {
    var deferred = Q.defer();
    var tpl = _.template('<%- host %>/word.json/<%- word %>/<%- endpoint %>?useCanonical=<%= useCanonical %>&relationshipTypes=<%= relationshipTypes %>&limitPerRelationshipType=<%= limitPerRelationshipType %>&api_key=<%- api_key %>');

    var params = {
      useCanonical: false,
      relationshipTypes: 'rhyme',
      limitPerRelationshipType: 10
    };

    var url = tpl(_.extend(params, {
      host: Config.WORDNICK.HOST,
      endpoint: 'relatedWords',
      api_key: Config.WORDNICK.API,
      word: word
    }));

    request(url, function(err, response, body) {
      if (err) {
        return console.log('Error', err);
      }

      if (body) {
        var rhymes = JSON.parse(body)[0];

        if (rhymes) {
          deferred.resolve(rhymes.words);
        } else {
          deferred.resolve(null);
        }
      } else {
        deferred.resolve(null);
      }
    });

    return deferred.promise;
  };

  module._publishTweet = function(status) {
    T.post('statuses/update', { status: status }, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log(status);
      }
    });
  };

  module._generateStatus = function(title, actor, movie) {
    var status = null;
    var tpl = null;
    var templates = movieActorTemplates;

    if (actor) {
      tpl = this._getRandomTemplate(templates);
      status = tpl({ title: title, actor: actor });
    } else if (title) {
      templates = movieTemplates;

      var director = movie.Director;
      var genre = this._getRandomGenre(movie);
      var exclamation = this._getRandomExclamation();

      tpl = this._getRandomTemplate(templates);
      status = tpl({ title: title, actor: actor, director: director, genre: genre, exclamation: exclamation });
    }

    return status;
  };

  module.tweet = function(title, actor, movie) {
    var status = this._generateStatus(title, actor, movie);

    if (status) {
      this._publishTweet(status);
    }
  };

  return module;
};
