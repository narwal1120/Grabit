document.addEventListener("DOMContentLoaded", () => {
  const downloadModal = (() => {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'none';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '10000';
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#1a1a2e';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '12px';
    modalContent.style.textAlign = 'center';
    modalContent.style.width = '300px';
    modalContent.style.color = 'var(--color-text)';
    modalContent.style.fontFamily = "'Poppins', sans-serif";
    modalContent.style.boxShadow = '0 0 20px rgba(37,117,252,0.7)';
    modalContent.innerHTML = `
      <p>Your download is started. Please wait a few seconds.</p>
      <button id="modalOkButton" style="
        padding: 8px 16px; 
        margin-top: 15px; 
        border: none; 
        background: linear-gradient(90deg, var(--color-secondary), var(--color-primary));
        color: white; 
        border-radius: 8px; 
        cursor: pointer;
        font-weight: 600;
      ">OK</button>
    `;
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    const okButton = modalContent.querySelector('#modalOkButton');
    const show = () => {
      return new Promise((resolve) => {
        modal.style.display = 'flex';
        const onClick = () => {
          modal.style.display = 'none';
          okButton.removeEventListener('click', onClick);
          resolve();
        };
        okButton.addEventListener('click', onClick);
      });
    };
    return { show };
  })();
  const downloadMp4Btn = document.getElementById("downloadMp4");
  if (!downloadMp4Btn) {
    console.error("downloadMp4 button not found!");
    return;
  }
  downloadMp4Btn.addEventListener("click", async () => {
    console.log("Download MP4 button clicked");
    await downloadModal.show();
    console.log("Modal closed, starting download");
    let progressContainer = document.getElementById('downloadProgressBarContainerMp4');
    if (!progressContainer) {
      progressContainer = document.createElement('div');
      progressContainer.id = 'downloadProgressBarContainerMp4';
      progressContainer.style.width = '100%';
      progressContainer.style.marginTop = '12px';
      const progressBarBackground = document.createElement('div');
      progressBarBackground.style.width = '100%';
      progressBarBackground.style.height = '12px';
      progressBarBackground.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      progressBarBackground.style.borderRadius = '6px';
      progressBarBackground.style.overflow = 'hidden';
      progressBarBackground.style.position = 'relative';
      const progressBar = document.createElement('div');
      progressBar.id = 'downloadProgressBarMp4';
      progressBar.style.height = '100%';
      progressBar.style.width = '25%';
      progressBar.style.background = `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`;
      progressBar.style.borderRadius = '6px';
      progressBar.style.position = 'absolute';
      progressBar.style.left = '-25%';
      if (!document.getElementById('downloadProgressBarStyleMp4')) {
        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.id = 'downloadProgressBarStyleMp4';
        styleSheet.innerText = `
          @keyframes smoothIndeterminateMp4 {
            0% { left: -25%; }
            100% { left: 100%; }
          }
        `;
        document.head.appendChild(styleSheet);
      }
      progressBar.style.animation = 'smoothIndeterminateMp4 2.5s linear infinite';
      progressBarBackground.appendChild(progressBar);
      const progressText = document.createElement('div');
      progressText.id = 'downloadProgressTextMp4';
      progressText.style.color = 'var(--color-text)';
      progressText.style.fontFamily = "'Poppins', sans-serif";
      progressText.style.fontSize = '0.9rem';
      progressText.style.marginTop = '6px';
      progressText.style.textAlign = 'center';
      progressText.textContent = 'Downloading...';
      progressContainer.appendChild(progressBarBackground);
      progressContainer.appendChild(progressText);
      downloadMp4Btn.insertAdjacentElement('afterend', progressContainer);
    } else {
      progressContainer.style.display = 'block';
    }
    const url = document.getElementById("urlInput").value.trim();
    const quality = document.getElementById("mp4Quality").value;
    const title = document.getElementById("videoFooterTitle").innerText.trim() || 'video';
    if (!url) {
      alert("Please enter a video URL first.");
      progressContainer.style.display = 'none';
      return;
    }
    try {
      console.log("Sending request to backend...", { url, quality, title });   
      const response = await fetch("https://grabit-backend-ofjz.onrender.com/video/download_mp4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, quality, title }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert("Download failed: " + (errorData.error || "Unknown error"));
        progressContainer.style.display = 'none';
        return;
      }
      const blob = await response.blob();
      let filename = `${title}.mp4`;
      const disposition = response.headers.get("content-disposition");
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const match = disposition.match(/filename="?(.+)"?/);
        if (match && match[1]) filename = match[1];
      }
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setTimeout(() => {
        progressContainer.style.display = 'none';
      }, 800);
    } catch (error) {
      alert("Download error: " + error.message);
      progressContainer.style.display = 'none';
    }
  });
});
