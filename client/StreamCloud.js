import config from '../config.json';
import TrackItem from './components/TrackItem';
import SC from 'soundcloud';

class StreamCloud {

  constructor() {
    this.currentScreen = 'search';
  }

  static init() {
    try { SC.initialize({ client_id: config.client_id }); }
    catch(e) { alert('Unable to initialize SoundCloud API'); }

    console.log("SoundCloud initialized");
  }

  static async fetchTracks(text) {
    let tracks;
    try { tracks = await SC.get('/tracks', { q: text }); }
    catch(e) { alert('Connection error, unable to fetch tracks'); }

    console.log(tracks);
    StreamCloud.appendTracks(tracks);
  }

  static appendTracks(tracks) {
    let temp;
    let trackList = '';

    tracks.forEach((track) => {
      temp = new TrackItem(track);
      trackList += temp.content;
    });
    trackContainer.innerHTML = trackList;
    StreamCloud.showTracks();
    history.pushState({}, 'search', '/');
    this.currentScreen = 'tracks';
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
  }

  static toggleScreen(screen) {
    if (screen === 'tracks') {
      StreamCloud.showSearch();
      this.currentScreen = 'search';
    }
    else {
      StreamCloud.showTracks();
      this.currentScreen = 'tracks';
    }
  }

  static appendPlayer(trackId) {
    console.log(trackId);
    const player = document.getElementById('player');
    player.src = `http://w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/${trackId}&auto_play=true`
    player.style.display = 'block';
  }
}

export default StreamCloud;
