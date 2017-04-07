import SC           from 'soundcloud';
import { autobind } from 'core-decorators';

import config     from '../config.json';
import TrackItem  from './components/TrackItem';
import QueueItem  from './components/QueueItem';
import Notice     from './components/Notice';

@autobind
class StreamCloud {

  constructor() {
    this.appContainer    = document.getElementById('appContainer');
    this.titleContainer  = document.getElementById('titleContainer');
    this.searchContainer = document.getElementById('searchContainer');
    this.trackContainer  = document.getElementById('trackContainer');
    this.queueContainer  = document.getElementById('queueContainer');
    this.searchBox       = document.getElementById('searchBox');
    this.submitSearch    = document.getElementById('submitSearch');
    this.playerContainer = document.getElementById('playerContainer');
    this.playButton      = document.getElementById('playButton');
    this.pauseButton     = document.getElementById('pauseButton');
    this.trackTitle      = document.getElementById('trackTitle');

    // Initial state
    this.currentScreen  = 'search';
    this.queue          = [];
    this.previousTracks = [];
    this.playing        = false;
    this.currentPlayer  = null;
    this.currentTrack   = null;

    // Listeners
    this.submitSearch.onmousedown = (e) => this.fetchTracks(this.searchBox.value);
    this.appContainer.onclick = (e) => this.handleButtonClick(e);
    window.onpopstate = (e) => this.toggleScreen(this.currentScreen);
    this.searchBox.onkeydown = (e) => {
      if (e.which === 13 || e.which === 10) // Enter key submits
        this.fetchTracks(e.target.value);
    }
  }

  init() {
    try {
      SC.initialize({ client_id: config.client_id });
      console.log('SoundCloud API Initialized');
      return true;
    }
    catch(e) {
      alert('Unable to initialize SoundCloud API');
      return false;
    }
  }

  async fetchTracks(text) {
    this.appendNotice('Loading ...');
    this.showTracks();
    try {
      SC.get('/tracks', { q: text }).then((tracks) => {
        if (tracks.length === 0) {
          this.appendNotice('No results');
          this.showTracks();
          history.pushState({}, 'search', '/');
        }
        else {
          this.appendTracks(tracks);
          this.showTracks();
          history.pushState({}, 'search', '/');
        }
      });
    }
    catch (e) {
      this.appendNotice('Connection error');
      this.showTracks();
      history.pushState({}, 'search', '/');
    }
  }

  appendTracks(tracks) {
    let trackList = '';
    tracks.forEach((track) => {
      trackList += TrackItem(track);
    });
    this.trackContainer.innerHTML = trackList;

  }

  appendNotice(text) {
    this.trackContainer.innerHTML = Notice(text);
  }

  async startPlayer(track) {
    try {
      let player = await SC.stream(`/tracks/${track.id}?client_id=${config.client_id}&`);
      player.options.protocols.reverse();
      return player;
    }
    catch(e) {
      alert(`Connection error, could not stream track`);
      return;
    }
  }

  enqueue(track) {
    if (this.queue.length < 30) {
      this.queue.push(track);
    }
    else {
      alert('The queue has a cap of 30 songs!');
    }
  }

  dequeue() {
    return this.queue.shift();
  }

  async stream(track) {
    if (!this.playing) {
      await this.immediateStream(track);

      this.currentPlayer.on('finish', () => {
        this.toggleControls(false);
        this.togglePlayState(false);
        this.pushToPrevious(track);
        this.trackTitle.textContent = '';
        if (this.queue.length > 0) {
          let nextTrack = this.dequeue();
          this.stream(nextTrack);
        }
      });
    }
    else if (!this.queue.includes(track) && this.currentPlayer.options.soundId != track.id)
      this.enqueue(track);
    else alert(`${track.title} is already in the player or queue`);
  }

  async immediateStream(track) {
    let player = await this.startPlayer(track);
    this.currentPlayer = player;
    this.currentTrack = track;
    this.trackTitle.textContent = track.title;
    this.toggleControls(true);
    this.togglePlayState(true);
  }

  skipTrack() {
    if (this.queue.length > 0) {
      this.currentPlayer.seek(0);
      this.togglePlayState(false);
      this.pushToPrevious(this.currentTrack);
      let nextTrack = this.dequeue();
      this.stream(nextTrack);
    }
  }

  backTrack() {
    let prevTrack = this.previousTracks.pop();
    if (prevTrack) {
      this.currentPlayer.seek(0);
      this.togglePlayState(false);
      this.queue.unshift(this.currentTrack);
      this.stream(prevTrack);
    }
  }

  pushToPrevious(track) {
    if (this.previousTracks.length < 30)
      this.previousTracks.push(track);
    else {
      this.previousTracks.shift();
      this.previousTracks.push(track);
    }
  }

  showSearch() {
    this.trackContainer.style.display      = 'none';
    this.queueContainer.style.display      = 'none';
    this.titleContainer.style.display      = 'flex';
    this.searchContainer.style.display     = 'flex';
    this.appContainer.style.justifyContent = 'center';
    this.queueShowing = false;
    this.currentScreen = 'search';
  }

  showTracks() {
    this.titleContainer.style.display      = 'none';
    this.queueContainer.style.display      = 'none';
    this.searchContainer.style.display     = 'none';
    this.trackContainer.style.display      = 'flex';
    this.appContainer.style.justifyContent = 'flex-end';
    this.queueShowing = false;
    this.currentScreen = 'tracks';
  }

  toggleQueueContainer() {
    if (!this.queueShowing) {
      let queueItems = '';
      this.queue.forEach(track => { queueItems += QueueItem(track) });
      this.queueContainer.innerHTML      = queueItems;
      this.trackContainer.style.display  = 'none';
      this.titleContainer.style.display  = 'none';
      this.searchContainer.style.display = 'none';
      this.queueContainer.style.display  = 'flex';
      this.queueShowing = true;
    }
    else if (this.currentScreen === 'search') {
      this.titleContainer.style.display  = 'flex';
      this.searchContainer.style.display = 'flex';
      this.queueContainer.style.display  = 'none';
      this.queueShowing = false;
    }
    else {
      this.trackContainer.style.display  = 'flex';
      this.queueContainer.style.display  = 'none';
      this.queueShowing = false;
    }
  }

  togglePlayButton(play) {
    // These are dynamically injected into the DOM and might not be there
    // upon instantiation of StreamCloud.
    let playButton = document.getElementById('playButton');
    let pauseButton = document.getElementById('pauseButton');
    if (play) {
      playButton.style.display = 'none';
      pauseButton.style.display = 'block';
    }
    else {
      pauseButton.style.display = 'none';
      playButton.style.display = 'block';
    }
  }

  toggleControls(on) {
    this.playerContainer.style.display = on ? 'flex' : 'none';
  }

  togglePlayState(play) {
    if (play) {
      this.currentPlayer.play();
      this.currentPlayer.pause();
      this.currentPlayer.play();
    }
    else {
      this.currentPlayer.pause();
      this.currentPlayer.play();
      this.currentPlayer.pause();
    }
    this.playing = play;
    this.togglePlayButton(play);
  }

  toggleScreen(screen) {
    if (screen === 'tracks') {
      this.showSearch();
    }
    else {
      this.showTracks();
      history.pushState({}, 'search', '/');
    }
  }

  handleButtonClick(e) {
    switch (e.target.id) {
      case 'enqueue':
        this.stream(e.target.dataset);
        break;
      case 'back':
        this.toggleScreen(this.currentScreen);
        break;
      case 'queue':
        this.toggleQueueContainer();
        break;
      case 'pauseButton':
        this.togglePlayState(false);
        break;
      case 'playButton':
        this.togglePlayState(true);
        break;
      case 'skipTrack':
        this.skipTrack();
        break;
      case 'backTrack':
        this.backTrack();
        break;
    }

    if (e.target.className === 'track-text' || e.target.className === 'track-text username') {
      if (this.currentPlayer) {
        this.currentPlayer.seek(0);
        this.togglePlayState(false);
      }
      this.stream(e.target.dataset);
    }
  }
}

export default StreamCloud;
