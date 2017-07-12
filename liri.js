'use strict';
var twitterKeys = require('./keys.js');
var Twitter = require('twitter');

var app = {
  myTweets: function(count = 20) {
    var client = new Twitter({
      consumer_key: twitterKeys.twitter.consumer_key,
      consumer_secret: twitterKeys.twitter.consumer_secret,
      access_token_key: twitterKeys.twitter.access_token_key,
      access_token_secret: twitterKeys.twitter.access_token_secret
    });
    client.get('search/tweets', { q: 'from:jonjongrim', count: count }, function(error, tweets, response) {
      console.log(tweets);
    });
  }
};

var [, , fn, mod] = process.argv;

if (fn === 'my-tweets') {
  app.myTweets();
}
