'use strict';

var _ = require('underscore');
var request = require('request');
var movies = require('../movies.json');
var Q = require('q');
var Twit = require('twit');
var rand = require('unique-random');

module.exports = function(Config) {
  var module = {};

  var T = new Twit(Config);

  module.capitalize = function(string) {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
  };

  module.getRandomActor = function(movie) {
    var actors = movie.Actors.split(',');
    return actors[rand(0, actors.length - 1)()].trim();
  };

  module.getNewActor = function(actor, word, rhyme) {
    var regexp = new RegExp(word, 'g');
    return actor.replace(regexp, this.capitalize(rhyme));
  };

  module.getNewTitle = function(title, word, rhyme) {
    var regexp = new RegExp(word, 'g');
    return title.replace(regexp, this.capitalize(rhyme));
  };

  module.getRandomWord = function(sentence) {
    sentence = sentence.replace(/\W+/g, ' ');
    var words = sentence.trim().split(' ');

    words = _.reject(words, function(word) {
      return word.length < 3;
    });

    var word = words[rand(0, words.length - 1)()];

    var forbiddenWords = [
      'the', 'of', 'for', 'but', 'and', 'with', 'from', 'any', 'some', 'an', 'a', 'without', 'by', 'de', 'days', 'c', 'b', 'l'
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

      if (movie) {
        deferred.resolve(movie);
      } else {
        deferred.resolve(null);
      }
    });

    return deferred.promise;
  };

  module.getRhymesFor = function(word) {
    var deferred = Q.defer();
    var tpl = _.template('<%- host %>/word.json/<%- word %>/<%- endpoint %>?<%= params %>&api_key=<%- api_key %>');

    var params = [
      'useCanonical=false',
      'relationshipTypes=rhyme',
      'limitPerRelationshipType=10'
    ].join('&');

    var url = tpl({
      host: Config.WORDNICK.HOST,
      word: word,
      endpoint: 'relatedWords',
      api_key: Config.WORDNICK.API,
      params: params
    });

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

  module.tweet = function(title, actor, movie) {
    var status = null;

    if (actor) {

      var templates = [
        'I think <%= actor %> should make more movies',
        'yo <%= actor %> is the best',
        'Watching <%= title %> might not be the best movie, but I love <%= actor %>!',
        'looking forward to <%= actor %>\'s next movie!',
        'Wow! <%= actor %> was great in <%= title %>!!!',
        'Wasn\'t <%= actor %> just the best in <%= title %>?',
        '<%= title %> is the best movie ever, <%= actor %> is so cute',
        '<%= actor %> totally deserved the Oscar for <%= title %>',
        '<%= title %>! I loved it! If you\'re a fan of <%= actor %>, see it!',
        'Wasn\'t <%= actor %> the best in <%= title %>? I mean… right?',
        'whaaat! did <%= actor %> just die in <%= title %>!?',
        '<%= title %> with <%= actor %> is soooooo goood guys!'
      ];

      var r = rand(0, templates.length - 1)();
      var tpl = _.template(templates[r]);
      status = tpl({ title: title, actor: actor });

    } else if (title){

      var templates = [
        '<%= exclamation %>, <%= title %> is back in the teathres!',
        'Finally got round to watching <%= title %>. It\'s the best movie I\'ve seen this year.',
        'Oh my god. Just finished watching <%= title %>. Absolutely no doubt in my mind that it is the best movie I have ever seen. Gut wrenching',
        'The <%= title %>!! WOOOO!! best movie I\'ve watched so far!! definitely worth watching!😃😃',
        'I cried a lot watching <%= title %> tonight :(',
        '<%= title %> is so sad :(',
        'guys guys you have to watch <%= title %>!!!',
        'watching <%= title %>… best movie ever!',
        'I loved <%= title %> but the book was a thousand times better IMHO!',
        'noooooo, the ending of <%= title %> :(',
        '<%= director %>\'s <%= title %> is soooooo goood!',
        'watching <%= title %> because it\'s the best movie ever made',
        'idk about you but I love <%= title %>',
        'My fav movie is <%= title %>!!!',
        'I think I\'ve seen <%= title %> like 2 times',
        'My fav <%= genre %> movie is <%= title %>',
        '<%= genre %> movies like <%= title %> are the best thing 🎥',
        'Whaaaa, <%= title %> is on tv!!!',
        'I loved <%= director %>\'s <%= title %>!',
        'I went to see <%= title %> tonight & my oh my I walked out in amazement! Loved the movie!',
        '<%= exclamation %> <%= title %>. Best. Movie. Ever.',
        'remember? <%= title %> is still the best movie ever just saying',
        '<%? title %> is the best movie ever and nobody can convince me otherwise',
        '<%? title %> is the best movie ever and nobody can convince me otherwise',
        'Watching <%= title %>, best movie from my high school days',
        '<%= exclamation %> <%= title %> in 3D!!!',
        'Who\'s watching <%= title %> right now?',
        '<%= title %> is the best movie I\'ve ever seen',
        'i swear, <%= title %> is the best movie ever made',
        'The script of <%= title %> is dope',
        '<%= exclamation %> I loved <%= title %>!',
        '<%= exclamation %> my favorite movie is <%= title %>'
      ];

      var exclamations = ['OMG', 'hahaha', 'wow', 'guys', 'yay'];

      var r = rand(0, templates.length - 1)();
      var tpl = _.template(templates[r]);
      var director = movie.Director;
      var genre = movie.Genre.split(',')[0].trim().toLowerCase();

      r = rand(0, exclamations.length - 1)();
      var exclamation = exclamations[r];

      status = tpl({ title: title, actor: actor, director: director, genre: genre, exclamation: exclamation });
    }

    if (status) {
      T.post('statuses/update', { status: status }, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log(status);
        }
      });
    }

  };

  return module;
};
