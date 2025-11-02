// script.js — Grabit Client (dynamic video container, no autoplay, always highest-quality preview)
document.addEventListener("DOMContentLoaded", () => {
  const BACKEND_BASE = "http://127.0.0.1:8000";

  const urlInput = document.getElementById("urlInput");
  const grabButton = document.getElementById("grabButton");
  const loader = document.getElementById("loader");
  const errorBox = document.getElementById("errorBox");
  const downloadOptions = document.getElementById("download-options");
  const videoPreviewContainer = document.getElementById("video-preview-container");
  const videoPreview = document.getElementById("videoPreview");
  const videoFooterTitle = document.getElementById("videoFooterTitle");
  const playOverlay = document.getElementById("playOverlay");

  function show(el) { el.classList.remove("hidden"); }
  function hide(el) { el.classList.add("hidden"); }
  function setError(msg) { errorBox.textContent = msg; show(errorBox); }
  function clearError() { errorBox.textContent = ""; hide(errorBox); }

  function resetPlayer() {
    if (videoPreview._hls) {
      videoPreview._hls.destroy();
      videoPreview._hls = null;
    }
    videoPreview.pause();
    try { videoPreview.removeAttribute("src"); } catch {}
    videoPreview.load();
    hide(videoPreviewContainer);
    show(playOverlay);
    videoPreviewContainer.classList.remove("portrait", "landscape", "square");
  }

  grabButton.addEventListener("click", async () => {
    const url = urlInput.value.trim();
    if (!url) return setError("Please paste a video URL.");

    clearError();
    resetPlayer();
    hide(downloadOptions);
    show(loader);

    try {
      const res = await fetch(`${BACKEND_BASE}/api/info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const data = await res.json();
      hide(loader);

      if (!res.ok || data.error) {
        setError(data.error || "Failed to fetch info");
        return;
      }

      videoFooterTitle.textContent = data.title || "Untitled";
      show(downloadOptions);

      let previewUrl = null;
      if (data.video_url && data.audio_url) {
        previewUrl = `${BACKEND_BASE}/api/preview_merge?video=${encodeURIComponent(data.video_url)}&audio=${encodeURIComponent(data.audio_url)}`;
      } else if (data.combined_url) {
        previewUrl = `${BACKEND_BASE}/api/preview?url=${encodeURIComponent(data.combined_url)}`;
      } else if (data.formats && Array.isArray(data.formats)) {
        const highRes = data.formats
          .filter(f => f.vcodec && f.acodec && f.ext === "mp4")
          .sort((a, b) => (b.height || 0) - (a.height || 0));
        if (highRes.length > 0) {
          previewUrl = highRes[0].url;
        }
      } else if (data.preview_url) {
        previewUrl = `${BACKEND_BASE}/api/preview?url=${encodeURIComponent(data.preview_url)}`;
      }

      if (!previewUrl) return setError("No playable preview found.");
      await loadPreview(previewUrl);
    } catch (err) {
      hide(loader);
      console.error(err);
      setError("Server or network error: " + err.message);
    }
  });

  async function loadPreview(proxyUrl) {
    clearError();
    resetPlayer();
    show(videoPreviewContainer);

    const isHls = proxyUrl.toLowerCase().includes(".m3u8");

    if (isHls && window.Hls && Hls.isSupported()) {
      const hls = new Hls({ maxBufferLength: 60, enableWorker: true });
      hls.loadSource(proxyUrl);
      hls.attachMedia(videoPreview);
      videoPreview._hls = hls;
    } else {
      videoPreview.src = proxyUrl;
      videoPreview.load();
    }

    videoPreview.addEventListener("loadedmetadata", () => {
      const w = videoPreview.videoWidth;
      const h = videoPreview.videoHeight;
      if (w && h) {
        if (h / w > 1.2) videoPreviewContainer.classList.add("portrait");
        else if (w / h > 1.2) videoPreviewContainer.classList.add("landscape");
        else videoPreviewContainer.classList.add("square");
      }
      show(playOverlay);
    });
  }

  playOverlay.addEventListener("click", () => {
    playOverlay.style.display = "none";
    videoPreview.play().catch(() => {});
  });

  videoPreview.addEventListener("play", () => playOverlay.style.display = "none");
  videoPreview.addEventListener("pause", () => {
    if (videoPreview.currentTime > 0 && !videoPreview.ended)
      playOverlay.style.display = "flex";
  });

  // ==========================================================
  // 🚀 DOWNLOAD FEATURE — MP4 & MP3 + Aurora Progress + Title Fix
  // ==========================================================

  function showDownloadOverlay(title = "Your download is starting...") {
    let overlay = document.getElementById("downloadOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "downloadOverlay";
      overlay.innerHTML = `
        <div class="download-popup">
          <div class="aurora-bar">
            <div class="aurora-glow"></div>
          </div>
          <p id="downloadText">${title}</p>
        </div>
      `;
      document.body.appendChild(overlay);

      const style = document.createElement("style");
      style.innerHTML = `
        #downloadOverlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; animation: fadeIn 0.4s ease-in-out;
        }
        .download-popup {
          background: linear-gradient(135deg,#0b132b,#1c2541);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          padding: 35px 50px;
          text-align: center;
          color: #fff;
          font-family: 'Poppins', sans-serif;
          animation: popIn 0.4s ease-out;
        }
        .aurora-bar {
          position: relative;
          width: 280px; height: 6px;
          background: rgba(255,255,255,0.1);
          overflow: hidden;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        .aurora-glow {
          position: absolute;
          width: 40%; height: 100%;
          background: linear-gradient(90deg,#00eaff,#90e0ef,#00eaff);
          background-size: 200% 100%;
          animation: auroraMove 1.6s infinite linear;
          box-shadow: 0 0 15px #00eaff;
        }
        #downloadText { font-size: 1rem; opacity: 0.9; }
        @keyframes auroraMove {
          0% { left: -40%; opacity: 0.8; }
          50% { left: 60%; opacity: 1; }
          100% { left: 100%; opacity: 0.8; }
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    overlay.style.display = "flex";
  }

  function hideDownloadOverlay() {
    const overlay = document.getElementById("downloadOverlay");
    if (overlay) overlay.style.display = "none";
  }

  function sanitizeFilename(name) {
    return name.replace(/[<>:"/\\|?*]+/g, "").trim();
  }

  async function startDownload(mode) {
    const url = urlInput.value.trim();
    if (!url) return setError("Missing URL");

    const q = document.getElementById(mode === "mp4" ? "mp4Quality" : "mp3Quality").value;
    showDownloadOverlay();

    try {
      const res = await fetch(`${BACKEND_BASE}/api/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode, quality: q })
      });

      if (!res.ok) {
        const err = await res.json();
        hideDownloadOverlay();
        return setError(err.error || "Download failed");
      }

      const blob = await res.blob();

      // ✅ Extract filename from backend or fallback to video title
      let filename = mode === "mp4" ? "video.mp4" : "audio.mp3";
      const disposition = res.headers.get("Content-Disposition");
      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1].replace(/"/g, "");
      } else if (videoFooterTitle.textContent) {
        const safeTitle = sanitizeFilename(videoFooterTitle.textContent);
        filename = `${safeTitle}.${mode}`;
      }

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();

      document.getElementById("downloadText").textContent = "✨ Download Started!";
      setTimeout(() => hideDownloadOverlay(), 2000);
    } catch (e) {
      hideDownloadOverlay();
      setError("Download error: " + e.message);
    }
  }

  document.getElementById("downloadMp4").addEventListener("click", () => startDownload("mp4"));
  document.getElementById("downloadMp3").addEventListener("click", () => startDownload("mp3"));
});
