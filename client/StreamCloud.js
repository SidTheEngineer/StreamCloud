import config     from '../config.json';
import TrackItem  from './components/TrackItem';
import Notice     from './components/Notice';
import SC         from 'soundcloud';

class StreamCloud {

  constructor() {
    this.currentScreen = 'search';
    this.queue = [];
    this.player = false;

    StreamCloud.enqueue        = StreamCloud.enqueue.bind(this);
    StreamCloud.dequeue        = StreamCloud.dequeue.bind(this);
    StreamCloud.appendTracks   = StreamCloud.appendTracks.bind(this);
    StreamCloud.showTracks     = StreamCloud.showTracks.bind(this);
    StreamCloud.startPlayer    = StreamCloud.startPlayer.bind(this);

    this.stream       = this.stream.bind(this);
    this.toggleScreen = this.toggleScreen.bind(this);
  }

  static appendTracks(tracks) {
    let trackList = '';

    tracks.forEach((track) => {
      trackList += TrackItem(track);
    });
    trackContainer.innerHTML = trackList;
    StreamCloud.showTracks();
  }

  static appendNotice(text) {
    trackContainer.innerHTML = Notice(text);
    StreamCloud.showTracks();
  }

  static showSearch() {
    trackContainer.style.display      = 'none';
    titleContainer.style.display      = 'flex';
    searchContainer.style.display     = 'flex';
    appContainer.style.justifyContent = 'center';
  }

  static showTracks() {
    titleContainer.style.display      = 'none';
    searchContainer.style.display     = 'none';
    trackContainer.style.display      = 'flex';
    appContainer.style.justifyContent = 'flex-end';
    history.pushState({}, 'search', '/');
    this.currentScreen = 'tracks';
  }

  static async startPlayer(track) {
    try {
      this.player = await SC.stream(`/tracks/${track.id}?client_id=${config.client_id}&`);
    }
    catch(e) {
      alert(`Connection error, could not stream track`);
      return;
    }
    this.player.options.protocols.reverse();
  }

  static enqueue(track) {
    if (this.queue.length < 30) {
      this.queue.push(track);
      console.log(this.queue);
    }
    else {
      alert('The queue has a cap of 30 songs!');
    }
  }

  static dequeue() {
    return this.queue.shift();
  }

  init() {
    try { SC.initialize({ client_id: config.client_id }); }
    catch(e) { alert('Unable to initialize SoundCloud API'); }
    console.log('SoundCloud API Initialized');
  }

  async fetchTracks(text) {
    let tracks;
    try { tracks = await SC.get('/tracks', { q: text }); }
    catch(e) { alert('Connection error, unable to fetch tracks'); }
    tracks.length === 0 ? StreamCloud.appendNotice('No results') : StreamCloud.appendTracks(tracks);
  }

  async stream(track) {
    await StreamCloud.startPlayer(track);
    this.player.play();

    
  }

  toggleScreen(screen) {
    if (screen === 'tracks') {
      StreamCloud.showSearch();
      this.currentScreen = 'search';
    }
    else {
      StreamCloud.showTracks();
      this.currentScreen = 'tracks';
    }
  }
}

export default StreamCloud;
