import EnqueueButton from './EnqueueButton';

const TrackItem = details => (
  `
  <div class="track-item">
    <div id="trackItem" class="track-text-container">
      <h2
        class="track-text"
        data-id="${details.id}"
        data-title="${details.title}"
      >
        ${details.title}
      </h2>
      <h3
        class="track-text username"
        data-id="${details.id}"
        data-title="${details.title}"
      >
        ${details.user.username}
      </h3>
    </div>
    ${EnqueueButton(details)}
  </div>
  `
);

export default TrackItem;
