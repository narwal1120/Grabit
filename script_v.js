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
document.getElementById("downloadMp3").addEventListener("click", async () => {
  await downloadModal.show();
  let progressContainer = document.getElementById('downloadProgressBarContainer');
  if (!progressContainer) {
    progressContainer = document.createElement('div');
    progressContainer.id = 'downloadProgressBarContainer';
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
    progressBar.id = 'downloadProgressBar';
    progressBar.style.height = '100%';
    progressBar.style.width = '25%';
    progressBar.style.background = `linear-gradient(90deg, var(--color-primary), var(--color-secondary))`;
    progressBar.style.borderRadius = '6px';
    progressBar.style.position = 'absolute';
    progressBar.style.left = '-25%';
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.id = 'downloadProgressBarStyle';
    styleSheet.innerText = `
      @keyframes smoothIndeterminate {
        0% { left: -25%; }
        100% { left: 100%; }
      }
    `;
    document.head.appendChild(styleSheet);
    progressBar.style.animation = 'smoothIndeterminate 2.5s linear infinite';
    progressBarBackground.appendChild(progressBar);
    const progressText = document.createElement('div');
    progressText.id = 'downloadProgressText';
    progressText.style.color = 'var(--color-text)';
    progressText.style.fontFamily = "'Poppins', sans-serif";
    progressText.style.fontSize = '0.9rem';
    progressText.style.marginTop = '6px';
    progressText.style.textAlign = 'center';
    progressText.textContent = 'Downloading...';
    progressContainer.appendChild(progressBarBackground);
    progressContainer.appendChild(progressText);
    const downloadBtn = document.getElementById("downloadMp3");
    downloadBtn.insertAdjacentElement('afterend', progressContainer);
  } else {
    progressContainer.style.display = 'block';
  }
  const url = document.getElementById("urlInput").value.trim();
  const quality = document.getElementById("mp3Quality").value;
  if (!url) {
    alert("Please enter a video URL first.");
    progressContainer.style.display = 'none';
    return;
  }
  const apiUrl = `https://grabit-backend-ofjz.onrender.com/download/mp3?url=${encodeURIComponent(url)}&quality=${quality}`;
  console.log("Fetching:", apiUrl);
  try {
    const response = await fetch(apiUrl);
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const errorData = await response.json();
      alert("Error: " + (errorData.error || "Unknown error"));
      progressContainer.style.display = 'none';
      return;
    }
    if (!response.ok) {
      alert(`Server error: ${response.statusText}`);
      progressContainer.style.display = 'none';
      return;
    }
    const blob = await response.blob();
    let filename = "audio.mp3";
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
    alert("Failed to fetch audio: " + error.message);
    progressContainer.style.display = 'none';
  }
});
