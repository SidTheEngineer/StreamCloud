import config     from '../config.json';
import TrackItem  from './components/TrackItem';
import Notice     from './components/Notice';
import Controls   from './components/Controls';
import SC         from 'soundcloud';

class StreamCloud {

  constructor() {
    this.appContainer    = document.getElementById('appContainer');
    this.titleContainer  = document.getElementById('titleContainer');
    this.searchContainer = document.getElementById('searchContainer');
    this.trackContainer  = document.getElementById('trackContainer');
    this.searchBox       = document.getElementById('searchBox');
    this.submitSearch    = document.getElementById('submitSearch');
    this.playerContainer = document.getElementById('playerContainer');
    this.playButton      = document.getElementById('playButton');
    this.pauseButton     = document.getElementById('pauseButton');

    this.currentScreen = 'search';
    this.queue         = [];
    this.playing       = false;
    this.currentPlayer = '';

    this.enqueue          = this.enqueue.bind(this);
    this.dequeue          = this.dequeue.bind(this);
    this.appendTracks     = this.appendTracks.bind(this);
    this.appendNotice     = this.appendNotice.bind(this);
    this.showTracks       = this.showTracks.bind(this);
    this.showSearch       = this.showSearch.bind(this);
    this.startPlayer      = this.startPlayer.bind(this);
    this.toggleControls   = this.toggleControls.bind(this);
    this.togglePlayButton = this.togglePlayButton.bind(this);
    this.stream           = this.stream.bind(this);
    this.toggleScreen     = this.toggleScreen.bind(this);
    this.togglePlayState  = this.togglePlayState.bind(this);

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
        case 'pauseButton':
          this.togglePlayState(false);
          e.stopPropagation();
          break;
        case 'playButton':
          this.togglePlayState(true);
          e.stopPropagation();
      }
    }

    // Allow enter key to submit
    this.searchBox.onkeydown = (e) => {
      if (e.which === 13 || e.which === 10)
        this.fetchTracks(e.target.value);
    }

    this.submitSearch.onmousedown = (e) => this.fetchTracks(this.searchBox.value);

    window.onpopstate = (e) => {
      this.toggleScreen(this.currentScreen);
    }
  }

  init() {
    try { SC.initialize({ client_id: config.client_id }); }
    catch(e) { alert('Unable to initialize SoundCloud API'); }
    console.log('SoundCloud API Initialized');
  }

  async fetchTracks(text) {
    this.appendNotice('Loading ...');
    try {
      SC.get('/tracks', { q: text }).then((tracks) => {
        tracks.length === 0 ? this.appendNotice('No results') : this.appendTracks(tracks);
      });
    }
    catch (e) {
      this.appendNotice('Connection error');
    }
  }

  appendTracks(tracks) {
    let trackList = '';

    tracks.forEach((track) => {
      trackList += TrackItem(track);
    });
    this.trackContainer.innerHTML = trackList;
    this.showTracks();
  }

  appendNotice(text) {
    this.trackContainer.innerHTML = Notice(text);
    this.showTracks();
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
      this.playing = true;
      let player = await this.startPlayer(track);
      this.currentPlayer = player;
      player.play();
      this.toggleControls(true);

      player.on('finish', () => {
        this.playing = false;
        this.toggleControls(false);
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

  showSearch() {
    this.trackContainer.style.display      = 'none';
    this.titleContainer.style.display      = 'flex';
    this.searchContainer.style.display     = 'flex';
    this.appContainer.style.justifyContent = 'center';
  }

  showTracks() {
    this.titleContainer.style.display      = 'none';
    this.searchContainer.style.display     = 'none';
    this.trackContainer.style.display      = 'flex';
    this.appContainer.style.justifyContent = 'flex-end';
    history.pushState({}, 'search', '/');
    this.currentScreen = 'tracks';
  }

  togglePlayButton(play) {
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
    this.togglePlayButton(play);
  }

  toggleScreen(screen) {
    if (screen === 'tracks') {
      this.showSearch();
      this.currentScreen = 'search';
    }
    else {
      this.showTracks();
      this.currentScreen = 'tracks';
    }
  }
}

export default StreamCloud;
