const EnqueueButton = details => (
  `
    <div class="button-container">
      <i
        id="enqueue"
        class="material-icons
        md-48"
        data-id="${details.id}"
        data-title="${details.title}"
      >
        playlist_add
    </i>
    </div>
  `
);

export default EnqueueButton;
