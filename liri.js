'use strict';
var chalk = require('chalk');
var fs = require('fs');
var axios = require('axios');
var moment = require('moment');
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var appKeys = require('./keys.js');

var [, , fn, ...args] = process.argv;

var app = (function() {
  function myTweets(count = 20) {
    var client = new Twitter({
      consumer_key: appKeys.twitter.consumer_key,
      consumer_secret: appKeys.twitter.consumer_secret,
      access_token_key: appKeys.twitter.access_token_key,
      access_token_secret: appKeys.twitter.access_token_secret
    });
    const log = console.log;
    client.get('search/tweets', { q: 'from:jonjongrim', count: count }, function(error, tweets, data) {
      let msgArray = tweets.statuses;
      let logText = { tweets: [] };
      msgArray.forEach(msg => {
        let [wDay, month, date] = msg.created_at.split(' ');
        log(chalk.blue(`Tweet at: ${wDay}, ${month} ${date}`));
        log(`${msg.text}`);
        logText.tweets.push({ created_at: msg.created_at, tweet: msg.text });
      });
      appendData('my-tweets', JSON.stringify(logText));
    });
  }

  function spotify(songName = 'The Sign') {
    var spotify = new Spotify({
      id: appKeys.spotify.id,
      secret: appKeys.spotify.secret
    });
    spotify
      .search({ type: 'track', query: songName })
      .then(data => {
        let items = data.tracks.items;
        if (items.length === 0) {
          console.log(chalk.red('No results for that song!'));
          return;
        }
        let song = items[0];

        console.log(chalk.blue('Song:'), song.name);
        console.log(chalk.blue('Artist:'), song.artists[0].name);
        console.log(chalk.blue('Album:'), song.album.name);
        console.log(chalk.blue('Preview URL:'), song.preview_url);

        let logText = {
          song: song.name,
          artist: song.artists[0].name,
          album: song.album.name,
          previewURL: song.preview_url
        };

        appendData('spotify-this-song', JSON.stringify(logText));
      })
      .catch(err => {
        console.error(chalk.red(err));
      });
  }

  function movie(movieName) {
    const log = console.log;
    if (!movieName) {
      movieName = 'Mr. Nobody';
    }
    axios
      .get(`http://www.omdbapi.com/?apikey=${appKeys.omdb.key}&t=${movieName}`)
      .then(response => {
        let data = response.data;
        if (data.Error) {
          console.error(data.Error);
          return;
        }
        log(chalk.blue('Title:'), data.Title);
        log(chalk.blue('Year:'), data.Year);
        log(chalk.blue('Ratings:'));
        data.Ratings.forEach(rate => {
          log(`  ${rate.Source}: ${rate.Value}`);
        });
        log(chalk.blue('Country:'), data.Country);
        log(chalk.blue('Plot:'));
        log(data.Plot);
        log(chalk.blue('Actors:'), data.Actors);

        let logText = {
          title: data.Title,
          year: data.Year,
          ratings: data.Ratings,
          country: data.Country,
          plot: data.Plot,
          actors: data.Actors
        };

        appendData('movie-this', JSON.stringify(logText));
      })
      .catch(err => {
        console.error(err);
      });
  }

  function executeFile(err, data) {
    if (err) throw err;
    var lines = data.split('\n');
    lines.forEach(line => {
      if (!line) return;
      var [command, arg] = line.split(',');
      callOtherFunction(command, arg.replace('"', ''));
    });
  }

  function loadFile(file) {
    if (!file) {
      file = './random.txt';
    }
    if (/^\./.test(file)) {
      // file is a relative file
      file = file.substr(1);
      fs.readFile(__dirname + file, 'utf8', executeFile);
    } else if (/^\//.test(file)) {
      // file is absolute path
      fs.readFile(file, 'utf8', executeFile);
    } else {
      // file is relative, without preceeding ./
      fs.readFile(__dirname + '/' + file, 'utf8', executeFile);
    }
  }

  function callOtherFunction(fn, arg) {
    if (fn === 'my-tweets') {
      myTweets();
    } else if (fn === 'spotify-this-song') {
      spotify(arg);
    } else if (fn === 'movie-this') {
      movie(arg);
    }
  }

  function appendData(fn, data) {
    fs.appendFile('log.txt', `${fn} ran at ${moment()}\n${data}\n`, 'utf8', err => {
      if (err) {
        console.error(err);
      }
    });
  }

  return {
    myTweets: myTweets,
    spotify: spotify,
    movie: movie,
    loadFile: loadFile
  };
})();

if (fn === 'my-tweets') {
  app.myTweets();
} else if (fn === 'spotify-this-song') {
  app.spotify(args.join(' '));
} else if (fn === 'movie-this') {
  app.movie(args.join(' '));
} else if (fn === 'do-what-it-says') {
  app.loadFile(args.join(' '));
}
