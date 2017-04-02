import EnqueueButton from './EnqueueButton';

const TrackItem = details => (
  `
  <div class="track-item">
    <div class="track-text-container">
      <h2 class="track-text">${details.title}</h2>
      <h3 class="track-text username">${details.user.username}</h3>
    </div>
    ${EnqueueButton(details)}
  </div>
  `
);

export default TrackItem;
