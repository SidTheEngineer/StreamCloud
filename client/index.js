import config from '../config.json';
import StreamCloud from './StreamCloud';

window.onload = () => {
  const appContainer    = document.getElementById('appContainer');
  const titleContainer  = document.getElementById('titleContainer');
  const searchContainer = document.getElementById('searchContainer');
  const trackContainer  = document.getElementById('trackContainer');
  const searchBox       = document.getElementById('searchBox');
  const submitSearch    = document.getElementById('submitSearch');
  const S               = new StreamCloud();

  S.init();

  trackContainer.onclick = (e) => {
    switch (e.target.id) {
      case 'enqueue':
        S.stream(e.target.dataset);
        break;
      case 'back':
        window.history.back();
        break;
    }
  }

  // Allow enter key to submit
  searchBox.onkeydown = (e) => {
    if (e.which === 13 || e.which === 10)
      S.fetchTracks(e.target.value);
  }

  submitSearch.onmousedown = (e) => S.fetchTracks(searchBox.value);

  window.onpopstate = (e) => {
    S.toggleScreen(S.currentScreen);
  }
}
