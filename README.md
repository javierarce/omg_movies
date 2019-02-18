OMG Movies!
=================

A Twitter bot that loves films big time but doesn't have a very good memory :( 

Watch it in action here: https://twitter.com/omg_movies

### How does it works

The data folder of the bot contains a list of Internet Movie Database movie ids. When a new tweet is requested, a random id is picked and used to obtain a hash with all the movie metadata using [OMDB](http://omdbapi.com).

The bot then picks a word from the movie title and tries to find a word that rhymes or belongs to the same semantic context using the [Wordnick API](https://developer.wordnik.com). If a rhyme is found, it's then used to replaced the original word in the title. The bot applies the same kind of substitution with the last name of the main actor/actress. 

Finally, the bot picks a random template from `movie_templates`, replaces the special tokens (TITLE, ACTOR, GENRE, DIRECTOR), and publishes the tweet.

### How to install

1. [Remix the project on Glitch](https://glitch.com/edit/#!/omg-movies)
2. Edit the `key.env` file with:
 - A random `SECRET` string to update the bot and publish a new tweet.
 - A [wordnick](https://developer.wordnik.com/) API key.
 - An [OMDB](http://omdbapi.com) API key.
 - Your [Twitter app](https://developer.twitter.com/en/apps) credentials.
 
Once that is ready visit `YOUR_GLITCH_URL.com/SECRET` to generate and publish a new Tweet.

**Bonus points**: use [cron-job.org](https://cron-job.org) to ping the secret URL every X minutes.
