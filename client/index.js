import config from '../config.json';
import TrackItem from './TrackItem';

window.onload = () => {

  const SC = require('soundcloud');

  // SoundCloud node package seems to be coupled to the browser. Can at least
  // try to keep the client_id out of VC.
  SC.initialize({ client_id: config.client_id });

  const titleContainer  = document.getElementById('titleContainer');
  const searchContainer = document.getElementById('searchContainer');
  const trackContainer  = document.getElementById('trackContainer');
  const searchBox       = document.getElementById('searchBox');
  const submitSearch    = document.getElementById('submitSearch');
  let currentScreen     = 'search';

  trackContainer.onclick = (e) => {
    if (e.target.id === 'play') console.log(e.target.dataset.url);
  }

  searchBox.onkeydown = (e) => {
    if (e.which === 13 || e.which === 10)
      fetchTracks(e.target.value);
  }

  submitSearch.onmousedown = (e) => fetchTracks(searchBox.value);

  async function fetchTracks(text) {
    const tracks = await SC.get('/tracks', { q: text });
    console.log(tracks);

    tracks.map((t) => {
      let track = new TrackItem(t);
      trackContainer.innerHTML += track.content;
    });
    
    showTracks();
    history.pushState({ text }, 'search', '/');
    currentScreen = 'tracks';
  }

  const showSearch = () => {
    trackContainer.style.display  = 'none';
    titleContainer.style.display  = 'flex';
    searchContainer.style.display = 'flex';
  }

  const showTracks = () => {
    titleContainer.style.display  = 'none';
    searchContainer.style.display = 'none';
    trackContainer.style.display  = 'flex';
  }

  // This is a little lazy but this app will be pretty small until
  // a frontend framework gets involved.
  window.onpopstate = (e) => {
    console.log(event);
    if (currentScreen === 'tracks') {
      showSearch();
      trackContainer.innerHTML = '';
      currentScreen = 'search';
    }
    else {
      showTracks();
      currentScreen = 'tracks';
    }
  }
}
