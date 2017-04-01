import EnqueueButton from './EnqueueButton';

const TrackItem = details => (
  `
  <div class="track-item">
    <div class="track-text-container">
      <h2 class="track-text">${details.title}</h2>
    </div>
    ${EnqueueButton(details)}
  </div>
  `
);

// <h3>${details.user.username}</h3>

export default TrackItem;
