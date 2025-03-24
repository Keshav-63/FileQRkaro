document.addEventListener("DOMContentLoaded", () => {
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const fileSelectBtn = document.getElementById("file-select-btn");
  const uploadProgressContainer = document.getElementById(
    "upload-progress-container"
  );
  const progressBar = document.getElementById("progress-bar");
  const progressPercentage = document.getElementById("progress-percentage");
  const fileName = document.getElementById("file-name");
  const fileSize = document.getElementById("file-size");
  const cancelUploadBtn = document.getElementById("cancel-upload-btn");
  const qrCodeContainer = document.getElementById("qr-code-container");
  const qrImage = document.getElementById("qr-image");
  const copyLinkBtn = document.getElementById("copy-link-btn");

  let selectedFiles = [];
  let isFolder = false;
  let uploadInterval = null;
  let downloadUrl = "";

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit per file

  function initFileUpload() {
    dropzone.style.display = "block";
    uploadProgressContainer.style.display = "none";
    qrCodeContainer.style.display = "none";
    selectedFiles = [];
    isFolder = false;
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  }

  // ✅ Handle file selection (with improved folder detection)
  function handleFileSelection(files, isFolder) {
    if (!files.length) return;
    selectedFiles = [...files];

    let totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0);
    // ✅ Prevent upload if total size exceeds 10MB
    if (totalSize > MAX_FILE_SIZE) {
      alert(
        "Total file/folder size exceeds 10MB. Please select a smaller file."
      );
      return;
    }

    console.log("Is Folder:", isFolder); // ✅ Now correctly detects folders
    console.log("Selected Files:", selectedFiles);

    if (isFolder) {
      fileName.textContent = "Folder Selected";
    } else {
      for (const file of selectedFiles) {
        if (file.size > MAX_FILE_SIZE) {
          alert(`File "${file.name}" exceeds the 10MB limit!`);
          return;
        }
      }
      fileName.textContent = selectedFiles[0].name;
    }

    fileSize.textContent = `${selectedFiles.length} file(s) | ${formatFileSize(
      selectedFiles.reduce((acc, file) => acc + file.size, 0)
    )}`;

    dropzone.style.display = "none";
    uploadProgressContainer.style.display = "block";
    qrCodeContainer.style.display = "none";

    progressBar.style.width = "0%";
    progressPercentage.textContent = "0%";

    simulateUpload(totalSize); // Pass total file size to simulateUpload
    uploadFileToServer(selectedFiles, isFolder);
  }

  async function uploadFileToServer(files, isFolder) {
    console.log("is folder", isFolder);

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("is_folder", isFolder ? "true" : "false");

    // Log form data correctly
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const response = await fetch(
        "https://fileqrkaro.onrender.com/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      console.log("qr_url", data.qr_url);
      completeUpload(data.qr_url, data.file_url);
    } catch (error) {
      alert("Error uploading file: " + error.message);
      resetUpload();
    }
  }

function simulateUpload(totalSize) {
  let progress = 0;
  if (uploadInterval) clearInterval(uploadInterval);

  let intervalTime = 3000; // Default for <1MB

  if (totalSize < 1024 * 1024) intervalTime = 3000; // <1MB → 3 sec
  else if (totalSize < 2 * 1024 * 1024) intervalTime = 4000; // <2MB → 6 sec
  else if (totalSize < 3 * 1024 * 1024) intervalTime = 7000; // <3MB → 9 sec
  else if (totalSize < 5 * 1024 * 1024) intervalTime = 10000; // <5MB → 15 sec
  else if (totalSize < 7 * 1024 * 1024) intervalTime = 15000; // <7MB → 18 sec
  else if (totalSize < 10 * 1024 * 1024) intervalTime = 20000; // <10MB → 22 sec

  uploadInterval = setInterval(() => {
    progress += Math.random() * 10;
    if (progress >= 100) {
      progress = 100;
      clearInterval(uploadInterval);
    }
    progressBar.style.width = `${progress}%`;
    progressPercentage.textContent = `${Math.round(progress)}%`;
  }, intervalTime / 10); // Adjust speed based on interval
}


  function completeUpload(qr_url, fileDownloadUrl) {
    uploadProgressContainer.style.display = "none";
    qrCodeContainer.style.display = "flex";
    downloadUrl = fileDownloadUrl;
    qrImage.style.display = "block";
    qrImage.src = qr_url;
  }

  function resetUpload() {
    if (uploadInterval) clearInterval(uploadInterval);
    selectedFiles = [];
    initFileUpload();
  }

  if (fileSelectBtn) {
    fileSelectBtn.addEventListener("click", () => {
      fileInput.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      if (this.files.length > 0) {
        handleFileSelection(this.files);
      }
    });
  }

  if (dropzone) {
    // ✅ Improved drag-and-drop handling
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", async (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");

      const items = e.dataTransfer.items;
      const files = [];

      if (items) {
        for (const item of items) {
          if (item.kind === "file") {
            const entry = item.webkitGetAsEntry();
            if (entry.isDirectory) {
              isFolder = true;
              await readDirectory(entry, files);
            } else {
              files.push(item.getAsFile());
            }
          }
        }
      }

      handleFileSelection(files, isFolder);
    });

    // ✅ Recursive function to read directory contents
    async function readDirectory(directoryEntry, fileList) {
      const reader = directoryEntry.createReader();
      return new Promise((resolve) => {
        reader.readEntries(async (entries) => {
          for (const entry of entries) {
            if (entry.isFile) {
              entry.file((file) => fileList.push(file));
            } else if (entry.isDirectory) {
              await readDirectory(entry, fileList); // Recursively read nested folders
            }
          }
          resolve();
        });
      });
    }
  }

  if (cancelUploadBtn) {
    cancelUploadBtn.addEventListener("click", resetUpload);
  }

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(downloadUrl).then(() => {
        copyLinkBtn.textContent = "Link Copied!";
        setTimeout(() => (copyLinkBtn.textContent = "Copy Link"), 2000);
      });
    });
  }

  initFileUpload();
});
