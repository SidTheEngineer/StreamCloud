class TrackItem {
  constructor(details) {
    this.details    = details;
    this.handlePlay = this.handlePlay.bind(this);
    this.playButton = document.createElement("div")

    this.playButton.id          = 'play';
    this.playButton.className   = 'play-button';
    this.playButton.onclick     = this.handlePlay;
    this.playButton.dataset.url = details.stream_url;

    this.content = `
      <div class="track-item">
        <div class="track-text-container">
          <h2 class="track-text">${details.title}</h2>
        </div>
        ${this.playButton.outerHTML}
      </div>
    `;
  }

  handlePlay() {
    console.log(this.details);
  }
}

export default TrackItem;
