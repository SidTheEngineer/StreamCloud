# StreamCloud

StreamCloud is a small SoundCloud clone that allows the user to stream and queue up tracks from SoundCloud. The goal of this project was to explore and demonstrate the ability of SoundCloud's API with modern, framework-less JavaScript.

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
