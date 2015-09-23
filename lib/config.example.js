'use strict';

module.exports = function(env) {

  if (!env) {
    env = process.env.NODE_ENV || 'development';
  }

  return {
    development: {
      INTERVAL: 30 * 1000,
      queueName: 'feelings_dev',
      consumer_key: '12345',
      consumer_secret: '12345',
      access_token: '12345',
      access_token_secret: '12345'
    },
    test: {
      INTERVAL: 30 * 1000,
      queueName: 'feelings_test',
      consumer_key: '12345',
      consumer_secret: '12345',
      access_token: '12345',
      access_token_secret: '12345'
    },
    production: {
    }
  }[env];
};

