import StreamCloud from './StreamCloud';

window.onload = () => {
  const S = new StreamCloud();
  S.init();
  S.searchBox.focus();
}
