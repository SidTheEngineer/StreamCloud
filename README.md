# StreamCloud
#### SoundCloud Internship Code Challenge 2017

StreamCloud is a small SoundCloud clone that allows the user to stream and queue up tracks from SoundCloud. The goal of this project was to explore and demonstrate the ability of SoundCloud's API with modern, framework-less JavaScript.

<div style="text-align: center;">
  <img src="./screenshot-home.png" height=400 />
<div>

## Local Setup

This project was set up using [Yarn](https://github.com/yarnpkg/yarn) package manager, however, npm can replace commands where Yarn is used.

### Dependencies

From the root directory of the project install dependencies with
```
yarn install
```

### Keys

Place your SoundCloud client ID in `config.json.template` and remove `.template` from the name of the file.

### Start

To start the application run
```
yarn start
```

This will run webpack to bundle all static files and watch for changes, as well as fire up a local express server on port 3000 to serve these files (thanks [Concurrently](https://github.com/kimmobrunfeldt/concurrently)). Visit `localhost:3000` to see the application.

### Testing

Facebook's [Jest](https://github.com/facebook/jest) framework is used for unit testing the client side JavaScript (similar to React). To start testing, run
```
yarn test
```

## Challenges

### Asynchronous requests

One of the toughest problems to tackle while building this application was writing a streaming algorithm that could work asynchronously with a queue. In order to properly account for the asynchrony of user requests and the SoundCloud player streaming tracks, edge cases involving the player and its 'finish' event listener had to be implemented. This includes the ability to enqueue a track if the player is currently streaming and not allowing duplicate tracks in the queue to avoid uncaught promise errors with the player (this can be changed in the future). A recursive descent is made when the current player is finished playing, which allows a new player to be used for the next track, avoiding some promise interruption errors.
```JavaScript
async stream(track) {
  if (!this.playing) {
    let player = await StreamCloud.startPlayer(track);
    player.play();
    this.playing = true;
    StreamCloud.toggleControls(true);

    player.on('finish', () => {
      this.playing = false;
      StreamCloud.toggleControls(false);
      if (this.queue.length > 0) {
        let nextTrack = StreamCloud.dequeue();
        this.stream(nextTrack);
      }
    });
  }
  else if (this.playing) {
    if (!this.queue.includes(track))
      StreamCloud.enqueue(track);
  }
}
```

### Architecture

Being a small enough project (and a demonstration of technical ability), I decided to not use a front-end framework and relied mainly on the newer features of ECMAScript alongside webpack to create a modular front-end. Experience working with React allowed me to model the front-end in a way that allows for reusable components. It is by no means as elegant as if I were to use a framework, however it gets the job done without many issues. For future improvements, I would most likely end up rewriting the application using React to make state management a lot easier throughout.

----
Overall, I thoroughly enjoyed building this little project and working with the SoundCloud API. I think this is an excellent way of screening for potential job candidates and should be more of a norm if it isn't already.
