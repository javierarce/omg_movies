'use strict';

var Config = require('./lib/config')();
var Bot = require('./lib/bot')(Config);
var _ = require('underscore');
var rand = require('unique-random');

var the_movie = '';
var titleRhyme = '';
var newTitle = '';
var title = '';
var word = '';
var actor = '';

Bot.getRandomMovie().then(function(movie) {

  the_movie = movie;
  title = movie.Title;
  word  = Bot.getRandomWord(title);
  actor = Bot.getRandomActor(movie);

  console.log('Title:', title);
  console.log('Actor', actor);

  return Bot.getRhymesFor(word.toLowerCase());
}).then(function(rhymes) {

  if (rhymes) {
    titleRhyme = Bot.getRandomRhyme(rhymes);
    newTitle   = Bot.getNewTitle(title, word, titleRhyme);

    return Bot.getNewActorName(actor).then(function(rhymes) {
      var names = actor.trim().split(' ');
      var name = names[1];
      var rhyme = Bot.getRandomRhyme(rhymes);
      if (rhyme) {
        return Bot.getNewActor(actor, name, rhyme);
      }
    });
  }
}).then(function(newActor) {
  Bot.tweet(newTitle, newActor, the_movie);
})
.fail(function(e) {
  console.log(e);
})
.done();



