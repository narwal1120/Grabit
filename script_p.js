document.addEventListener('DOMContentLoaded', () => {
  const grabButton = document.getElementById('grabButton');
  const urlInput = document.getElementById('urlInput');
  const errorBox = document.getElementById('errorBox');
  const videoPreview = document.getElementById('videoPreview');
  const videoPreviewContainer = document.getElementById('video-preview-container');
  const videoFooterTitle = document.getElementById('videoFooterTitle');
  const downloadOptions = document.getElementById('download-options');
  const loader = document.getElementById('loader');
  const downloadMp4Button = document.getElementById('downloadMp4');
  window.currentVideoUrl = null; 
  errorBox.classList.add('hidden');
  videoPreviewContainer.classList.add('hidden');
  downloadOptions.classList.add('hidden');
  loader.classList.add('hidden');
  downloadMp4Button.disabled = true;
  grabButton.addEventListener('click', async () => {
    const videoUrl = urlInput.value.trim();
    if (!videoUrl) {
      errorBox.textContent = 'Please enter a valid video URL.';
      errorBox.classList.remove('hidden');
      return;
    }
    errorBox.classList.add('hidden');
    loader.classList.remove('hidden');
    videoPreviewContainer.classList.add('hidden');
    downloadOptions.classList.add('hidden');
    downloadMp4Button.disabled = true;
    window.currentVideoUrl = null;
    try {
      const extractResponse = await fetch('https://grabit-backend-ofjz.onrender.com/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl }),
      });
      const extractData = await extractResponse.json();
      if (!extractResponse.ok) {
        throw new Error(extractData.error || 'Failed to extract video.');
      }
      videoFooterTitle.textContent = extractData.title || 'Video Preview';
      videoPreview.src = extractData.url || extractData.video_url || '';
      videoPreview.type = 'video/mp4';
      videoPreview.load();
      videoPreviewContainer.classList.remove('hidden');
      downloadOptions.classList.remove('hidden');
      window.currentVideoUrl = videoUrl;
      downloadMp4Button.disabled = false;
    } catch (err) {
      errorBox.textContent = err.message;
      errorBox.classList.remove('hidden');
      videoPreviewContainer.classList.add('hidden');
      downloadOptions.classList.add('hidden');
      downloadMp4Button.disabled = true;
      window.currentVideoUrl = null;
    } finally {
      loader.classList.add('hidden');
    }
  });
});
