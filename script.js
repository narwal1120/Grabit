const grabButton = document.getElementById('grabButton');
const urlInput = document.getElementById('urlInput');
const downloadOptions = document.getElementById('download-options');
const loader = document.getElementById('loader');

// 🆕 Video preview elements
const videoContainer = document.getElementById('video-preview-container');
const videoElement = document.getElementById('videoPreview');
const playOverlay = document.getElementById('playOverlay');
const footerTitle = document.getElementById('videoFooterTitle');

// 🎯 Fetch video info
grabButton.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return alert('Please enter a video URL');

    downloadOptions.classList.add('hidden');
    loader.classList.remove('hidden');
    videoContainer.classList.add('hidden');

    try {
        // 🆕 Added mode: 'cors' and cache: 'no-cache'
        const res = await fetch(`https://linux-grabit.onrender.com/video_info?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });
        const data = await res.json();

        if (!data.videoUrl) throw new Error('No playable video found');

        videoElement.src = data.videoUrl;
        footerTitle.textContent = data.title || 'Untitled Video';

        videoContainer.classList.remove('hidden');
        loader.classList.add('hidden');
        downloadOptions.classList.remove('hidden');

        downloadOptions.dataset.url = url;
        downloadOptions.dataset.title = data.title || 'video';
    } catch (err) {
        loader.classList.add('hidden');
        alert('⚠️ Server not responding — failed to fetch video');
        console.error(err);
    }
});

// ✅ Trigger browser download (works for both mp3/mp4)
function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// 🎥 MP4 Download
document.querySelectorAll('.format-section')[0]
    .querySelector('.download-btn')
    .addEventListener('click', (e) => {
        e.preventDefault();
        const url = downloadOptions.dataset.url;
        const title = downloadOptions.dataset.title;
        const quality = document.getElementById('mp4Quality').value;

        const downloadUrl = `https://linux-grabit.onrender.com/download_video?url=${encodeURIComponent(url)}&quality=${quality}&title=${encodeURIComponent(title)}`;
        const filename = `${title}-${quality}p.mp4`;

        triggerDownload(downloadUrl, filename);
    });

// 🎵 MP3 Download
document.querySelectorAll('.format-section')[1]
    .querySelector('.download-btn')
    .addEventListener('click', (e) => {
        e.preventDefault();
        const url = downloadOptions.dataset.url;
        const title = downloadOptions.dataset.title;
        const quality = document.getElementById('mp3Quality').value;

        const downloadUrl = `https://linux-grabit.onrender.com/download_audio?url=${encodeURIComponent(url)}&quality=${quality}&title=${encodeURIComponent(title)}`;
        const filename = `${title}-${quality}kbps.mp3`;

        triggerDownload(downloadUrl, filename);
    });

// ▶ Overlay play/pause logic
playOverlay.addEventListener('click', () => {
    if (videoElement.paused) {
        videoElement.play();
        playOverlay.style.display = 'none';
    } else {
        videoElement.pause();
        playOverlay.style.display = 'block';
    }
});

videoElement.addEventListener('play', () => (playOverlay.style.display = 'none'));
videoElement.addEventListener('pause', () => (playOverlay.style.display = 'block'));
videoElement.addEventListener('ended', () => (playOverlay.style.display = 'block'));
