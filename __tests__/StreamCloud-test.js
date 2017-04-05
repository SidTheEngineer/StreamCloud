import StreamCloud from '../client/StreamCloud';

describe('StreamCloud', () => {
  document.body.innerHTML =
  `
    <div id="appContainer">
      <div class="bar-row">
        <i class="material-icons md-48" id="back">swap_horiz</i>
        <i class="material-icons md-48" id="queue">list</i>
      </div>
      <div id="queueContainer">
      </div>
      <div id="titleContainer">
        <h1>Stream<strong>Cloud</strong></h1>
      </div>
      <div id="searchContainer">
        <input id="searchBox" type="text" name="track" placeholder="Search for tracks">
        <input id="submitSearch" type="submit" value="Search">
      </div>
      <div id="trackContainer">
      </div>
      <div id="playerContainer">
      </div>
    </div>
  `

  const track = {
    title: 'test',
    id: '123',
    user: {
      username: 'test123'
    }
  }

  const S = new StreamCloud();

  it('initializes', () => {
    expect(S.init()).toBeTruthy();
  });

  it('appends tracks to the DOM', () => {
    S.appendTracks([track]);
    expect(S.trackContainer.innerHTML).toBeTruthy();
  });

  it('appends Notices to the DOM', () => {
    S.appendNotice('test');
    expect(S.trackContainer.innerHTML).toBeTruthy();
  });

  it('enqueues a track', () => {
    S.enqueue(track);
    expect(S.queue).toBeTruthy();
  });

  it('dequeues a track', () => {
    S.queue.push(track);
    let track = S.dequeue();
    expect(track).toBeTruthy();
  });

  it('pushes previous tracks onto stack', () => {
    S.pushToPrevious(track);
    expect(S.previousTracks).toBeTruthy();
  });

  it('shows the tracks screen', () => {
    S.showTracks();
    expect(S.titleContainer.style.display).toBe('none');
    expect(S.queueContainer.style.display).toBe('none');
    expect(S.searchContainer.style.display).toBe('none');
    expect(S.trackContainer.style.display).toBe('flex');
    expect(S.appContainer.style.justifyContent).toBe('flex-end');
    expect(S.queueShowing).toBeFalsy();
    expect(S.currentScreen).toBe('tracks');
  });
});
