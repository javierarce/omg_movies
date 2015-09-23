![](https://travis-ci.org/javierarce/bot.svg?branch=master)

## Twiter bot template

A simple template to start building Twitter bots.

## How to run the default example

The default example captures the tweets that contain the string "I'm feeling [bad|good|etc.]" and stores the feeling in Redis. Another program prints each feeling every 30 seconds.

You'll need to have `node`, `npm` and `redis` installed.

1. Fork or clone the repo.
2. Rename the configuration file `config.example.js` to `config.js`.
3. Edit the development configuration with your Twitter credentails.
4. Run `redis-server`.
5. Run `npm install` to install the packages.
6. Run `grunt` to check your JavaScript syntax and run the suite of tests.
7. Run `node watcher.js` to capture the tweets and `node app.js` to see the list of captured feelings.

## Packages included

#### Language

* [wordfilter](https://github.com/dariusk/wordfilter):  a small module meant for use in text generators that lets you filter strings for bad words.
* [pos](https://github.com/dariusk/pos-js): fasttag part of speech tagger javascript implementation.
* [inflection](https://github.com/dreamerslab/node.inflection): a port of inflection-js to node.js module

#### Base

* [twit](https://github.com/ttezel/twit): Twitter API Client for node (REST & Streaming API).
* [redis](https://www.npmjs.com/package/redis): redis client library
* [request](https://www.npmjs.com/package/request): simplified HTTP request client.

#### Helpers

* [underscore](https://www.npmjs.com/package/underscore): JavaScript's functional programming helper library.
* [cli-color](https://github.com/medikoo/cli-color): colors and formatting for the console.

## License
Copyright (c) 2015 Javier Arce
Licensed under the MIT license.
