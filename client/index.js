import config from '../config.json';
import StreamCloud from './StreamCloud';

window.onload = () => {
  const appContainer    = document.getElementById('appContainer');
  const titleContainer  = document.getElementById('titleContainer');
  const searchContainer = document.getElementById('searchContainer');
  const trackContainer  = document.getElementById('trackContainer');
  const searchBox       = document.getElementById('searchBox');
  const submitSearch    = document.getElementById('submitSearch');
  let currentScreen     = 'search';

  StreamCloud.init();

  console.log(StreamCloud);

  trackContainer.onclick = (e) => {
    if (e.target.id === 'play') {
      StreamCloud.appendPlayer(e.target.dataset.id);
    }
  }

  // Allow enter key to submit
  searchBox.onkeydown = (e) => {
    if (e.which === 13 || e.which === 10)
      StreamCloud.fetchTracks(e.target.value);
  }

  submitSearch.onmousedown = (e) => fetchTracks(searchBox.value);

  window.onpopstate = (e) => {
    StreamCloud.toggleScreen(StreamCloud.currentScreen);
  }
}
