import config     from '../config.json';
import TrackItem  from './components/TrackItem';
import QueueItem  from './components/QueueItem';
import Notice     from './components/Notice';
import Controls   from './components/Controls';
import SC         from 'soundcloud';

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

    // Default state
    this.currentScreen  = 'search';
    this.queue          = [];
    this.previousTracks = [];
    this.playing        = false;
    this.currentPlayer  = null;
    this.currentTrack   = null;
    this.seenTracks     = {}

    this.enqueue              = this.enqueue.bind(this);
    this.dequeue              = this.dequeue.bind(this);
    this.appendTracks         = this.appendTracks.bind(this);
    this.appendNotice         = this.appendNotice.bind(this);
    this.showTracks           = this.showTracks.bind(this);
    this.showSearch           = this.showSearch.bind(this);
    this.toggleQueueContainer = this.toggleQueueContainer.bind(this);
    this.startPlayer          = this.startPlayer.bind(this);
    this.toggleControls       = this.toggleControls.bind(this);
    this.togglePlayButton     = this.togglePlayButton.bind(this);
    this.stream               = this.stream.bind(this);
    this.immediateStream      = this.immediateStream.bind(this);
    this.toggleScreen         = this.toggleScreen.bind(this);
    this.togglePlayState      = this.togglePlayState.bind(this);
    this.skipTrack            = this.skipTrack.bind(this);
    this.backTrack            = this.backTrack.bind(this);
    this.pushToPrevious       = this.pushToPrevious.bind(this);

    // Listeners
    this.appContainer.onclick = (e) => {
      switch (e.target.id) {
        case 'enqueue':
          this.stream(e.target.dataset);
          e.stopPropagation();
          break;
        case 'back':
          window.history.back();
          e.stopPropagation();
          break;
        case 'queue':
          this.toggleQueueContainer();
          e.stopPropagation();
          break;
        case 'pauseButton':
          this.togglePlayState(false);
          console.log(this.currentPlayer);
          e.stopPropagation();
          break;
        case 'playButton':
          this.togglePlayState(true);
          e.stopPropagation();
          break;
        case 'skipTrack':
          this.skipTrack();
          e.stopPropagation();
          break;
        case 'backTrack':
          this.backTrack();
          e.stopPropagation();
      }
    }

    // Allow enter key to submit
    this.searchBox.onkeydown = (e) => {
      if (e.which === 13 || e.which === 10)
        this.fetchTracks(e.target.value);
    }

    this.submitSearch.onmousedown = (e) => this.fetchTracks(this.searchBox.value);

    window.onpopstate = (e) => this.toggleScreen(this.currentScreen);
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
      let player = await require('soundcloud').stream(`/tracks/${track.id}?client_id=${config.client_id}&`);
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
    this.seenTracks[track] = true;
    if (!this.playing) {
      await this.immediateStream(track);

      this.currentPlayer.on('finish', () => {
        this.toggleControls(false);
        this.pushToPrevious(track);
        if (this.queue.length > 0) {
          let nextTrack = this.dequeue();
          this.stream(nextTrack);
        }
      });
    }
    else if (this.playing && !this.queue.includes(track) && this.currentPlayer.options.soundId != track.id)
      this.enqueue(track);
    else alert(`${track.title} is already in the queue`);
  }

  async immediateStream(track) {
    this.playing = true;
    let player = await this.startPlayer(track);
    this.currentPlayer = player;
    this.currentTrack = track;
    player.play();
    this.toggleControls(true);
  }

  skipTrack() {
    if (this.queue.length > 0) {
      this.currentPlayer.seek(0);
      this.togglePlayState(false);
      this.pushToPrevious(this.currentTrack);
      let nextTrack = this.dequeue();
      this.immediateStream(nextTrack);
    }
  }

  backTrack() {
    let prevTrack = this.previousTracks.pop();
    if (!!prevTrack) {
      this.currentPlayer.seek(0);
      this.togglePlayState(false);
      this.queue.unshift(this.currentTrack);
      this.immediateStream(prevTrack);
    }
  }

  pushToPrevious(track) {
    if (this.previousTracks.length < 30) this.previousTracks.push(track);
    else {
      this.previousTracks.shift();
      this.previousTracks.push(track);
    }

    console.log(...this.previousTracks);
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
    on ? this.playerContainer.innerHTML = Controls() : this.playerContainer.innerHTML = ``;
  }

  togglePlayState(play) {
    play ? this.currentPlayer.play() : this.currentPlayer.pause();
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
}

export default StreamCloud;
