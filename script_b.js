document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('videoPreview');
  const playOverlay = document.getElementById('playOverlay');
  if (video.paused) {
    playOverlay.classList.remove('playing');
    playOverlay.style.opacity = '1';
    playOverlay.style.pointerEvents = 'auto';
  } else {
    playOverlay.classList.add('playing');
    setTimeout(() => {
      if (!video.paused) {
        playOverlay.style.opacity = '0';
        playOverlay.style.pointerEvents = 'none';
      }
    }, 2000);
  }
  playOverlay.addEventListener('click', () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', () => {
    playOverlay.classList.add('playing');
    playOverlay.style.opacity = '1';
    playOverlay.style.pointerEvents = 'auto';

    setTimeout(() => {
      if (!video.paused) {
        playOverlay.style.opacity = '0';
        playOverlay.style.pointerEvents = 'none';
      }
    }, 2000);
  });
  const showOverlay = () => {
    playOverlay.classList.remove('playing');
    playOverlay.style.opacity = '1';
    playOverlay.style.pointerEvents = 'auto';
  };
  video.addEventListener('pause', showOverlay);
  video.addEventListener('ended', showOverlay);
});
