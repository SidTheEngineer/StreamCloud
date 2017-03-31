import StreamCloud from '../StreamCloud';

class TrackItem {
  constructor(details) {
    this.details                = details;
    this.playButton             = document.createElement("div");
    this.playButton.id          = 'play';
    this.playButton.dataset.id  = details.id;
    this.playButton.innerHTML   = `<i class="material-icons md-48">play_arrow</i>`

    this.content = `
      <div class="track-item">
        <div class="track-text-container">
          <h2 class="track-text">${details.title}</h2>
        </div>
        ${this.playButton.outerHTML}
      </div>
    `;
  }
}

export default TrackItem;
