OMG Movies!
=================

A Twitter bot that loves films big time but doesn't have a very good memory :( 

### How does it works

The data folder of the bot contains a list of Internet Movie Database move ids. Whenever a new tweet is generated, a random id is picked and used to obtain a hash with all the movie metadata.

The bot then picks a word from the title and tries to find a word that rhymes or belongs to the same semantic context using the Wordnick API. If a rhyme is found, the word is replaced in the title. The bot applies the same substitution with the name of the actor. 

Finally, the bot picks a random template from `movie_templates`, replaces the special tokens (TITLE, ACTOR, GENRE, DIRECTOR), and publishes the tweet.

### How to install

1. [Remix the project on Glitch](https://glitch.com/edit/#!/omg-movies)
2. Edit the `key.env` file with:
 - A random `SECRET` string to update the bot and publish a new tweet.
 - A [wordnick](https://developer.wordnik.com/) API key.
 - An [OMDB](http://omdbapi.com) API key.
 - Your [Twitter app](https://developer.twitter.com/en/apps) credentials.
 
Once everything is in place visit `YOUR_GLITCH_URL.com/SECRET` to generate and publish a new Tweet.

Bonus points: use [cron-job.org](https://cron-job.org) to ping the secret URL every X minutes.