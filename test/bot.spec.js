'use strict';

var Config = require('../lib/config')('test');
var Bot = require('../lib/bot.js')(Config);
var _ = require('underscore');
var assert = require('assert');

suite('Bot', function() {
  test('should capitalize a string', function() {
    assert.equal(Bot._capitalize('hi this is cool'), 'Hi this is cool');
  });

  test('should build a new actor name', function() {
    assert.equal(Bot.buildNewActorName('Tom Hanks', 'Hanks', 'panks'), 'Tom Panks');
  });

  test('should get a new random rhyme', function() {
    var rhymes = ['a', 'b', 'c'];
    var rhyme = Bot.getRandomRhyme(rhymes);
    assert.equal(_.contains(rhymes, rhyme), true);
  });

  test('should generate a status message with a movie and an actor', function() {
    var title = 'Close Encounters';
    var actor = 'Richard Dreyfus';
    var movie =  {
      Director: 'Steven Spielberg',
      Genre: 'Sci-fi'
    };
    var status = Bot._generateStatus(title, actor, movie);
    assert.equal(status.indexOf(title) > 0, true);
    assert.equal(status.indexOf(actor) > 0, true);
  });

  test('should generate a status message with a movie', function() {
    var title = 'Close Encounters';
    var actor = null;
    var movie =  {
      Director: 'Steven Spielberg',
      Genre: 'Sci-fi'
    };
    var status = Bot._generateStatus(title, actor, movie);
    assert.equal(status.indexOf(title) > 0, true);
    console.log(status);
  });

});
