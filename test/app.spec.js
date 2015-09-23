'use strict';

var Config = require('../lib/config')('test');
var Bot = require('../lib/bot.js')(Config);
var assert = require('assert');

suite('Bot', function() {
  test('_extractFeeling should return the feeling', function(done) {
    var tweet = { text: 'I am feeling happy' };
    assert.equal(Bot._extractFeeling(tweet), 'happy');

    tweet = { text: 'I\'m feeling bored' };
    assert.equal(Bot._extractFeeling(tweet), 'bored');

    tweet = { text: 'I am bored' };
    assert.equal(Bot._extractFeeling(tweet), null);

    tweet = { text: 'Am I feeling ok?' };
    assert.equal(Bot._extractFeeling(tweet), null);

    done();
  });
});
