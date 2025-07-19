(() => {
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  // Inject enhanced CSS styles with proper z-index and positioning
  const injectStyles = () => {
    if (document.getElementById("bookmark-dialog-styles")) return;

    const style = document.createElement("style");
    style.id = "bookmark-dialog-styles";
    style.textContent = `
      .bookmark-dialog-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background-color: rgba(0, 0, 0, 0.7) !important;
        z-index: 2147483647 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        backdrop-filter: blur(3px) !important;
        padding: 20px !important;
        box-sizing: border-box !important;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif !important;
      }

      .bookmark-dialog-container {
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
        border-radius: 16px !important;
        padding: 28px !important;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2) !important;
        min-width: 380px !important;
        max-width: 480px !important;
        width: 90vw !important;
        max-height: 90vh !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        font-family: inherit !important;
        animation: dialogSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        position: relative !important;
        overflow: visible !important;
        z-index: 2147483648 !important;
      }

      @keyframes dialogSlideIn {
        from {
          opacity: 0;
          transform: scale(0.8) translateY(-30px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .bookmark-dialog-title {
        font-size: 20px !important;
        font-weight: 700 !important;
        color: #1a202c !important;
        margin: 0 0 24px 0 !important;
        text-align: center !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 10px !important;
        line-height: 1.3 !important;
      }

      .bookmark-dialog-title.create::before {
        content: "🔖" !important;
        font-size: 22px !important;
      }

      .bookmark-dialog-title.edit::before {
        content: "✏️" !important;
        font-size: 22px !important;
      }

      .bookmark-dialog-input {
        width: 100% !important;
        padding: 14px 18px !important;
        font-size: 15px !important;
        border: 2px solid #e2e8f0 !important;
        border-radius: 10px !important;
        margin-bottom: 8px !important;
        font-family: inherit !important;
        transition: all 0.3s ease !important;
        background-color: #ffffff !important;
        box-sizing: border-box !important;
        color: #2d3748 !important;
        line-height: 1.4 !important;
      }

      .bookmark-dialog-input:focus {
        outline: none !important;
        border-color: #667eea !important;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15) !important;
        background-color: #fff !important;
        transform: translateY(-1px) !important;
      }

      .bookmark-dialog-input::placeholder {
        color: #a0aec0 !important;
      }

      .bookmark-dialog-buttons {
        display: flex !important;
        justify-content: flex-end !important;
        gap: 14px !important;
        margin-top: 28px !important;
      }

      .bookmark-dialog-button {
        padding: 12px 24px !important;
        border: none !important;
        border-radius: 8px !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        font-family: inherit !important;
        min-width: 90px !important;
        position: relative !important;
        overflow: hidden !important;
      }

      .bookmark-dialog-button::before {
        content: '' !important;
        position: absolute !important;
        top: 0 !important;
        left: -100% !important;
        width: 100% !important;
        height: 100% !important;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent) !important;
        transition: left 0.5s !important;
      }

      .bookmark-dialog-button:hover::before {
        left: 100% !important;
      }

      .bookmark-dialog-button-cancel {
        background-color: #f7fafc !important;
        color: #4a5568 !important;
        border: 2px solid #e2e8f0 !important;
      }

      .bookmark-dialog-button-cancel:hover {
        background-color: #edf2f7 !important;
        color: #2d3748 !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
      }

      .bookmark-dialog-button-confirm {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
      }

      .bookmark-dialog-button-confirm:hover {
        background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5) !important;
      }

      .bookmark-dialog-button:active {
        transform: translateY(0) !important;
      }

      .bookmark-dialog-counter {
        font-size: 12px !important;
        color: #718096 !important;
        text-align: right !important;
        margin-top: 4px !important;
        margin-bottom: 16px !important;
        font-weight: 500 !important;
      }

      .bookmark-dialog-counter.warning {
        color: #ed8936 !important;
      }

      .bookmark-dialog-counter.error {
        color: #e53e3e !important;
        font-weight: 600 !important;
      }

      @media (max-width: 500px) {
        .bookmark-dialog-container {
          min-width: 300px !important;
          padding: 24px !important;
          margin: 20px !important;
        }
        
        .bookmark-dialog-buttons {
          flex-direction: column-reverse !important;
          gap: 10px !important;
        }
        
        .bookmark-dialog-button {
          width: 100% !important;
        }
      }

      /* Prevent body scroll when dialog is open */
      body.bookmark-dialog-open {
        overflow: hidden !important;
      }

      /* Enhanced bookmark button styling */
      .bookmark-btn {
        opacity: 0.8 !important;
        transition: all 0.2s ease !important;
        filter: brightness(0.9) !important;
      }

      .bookmark-btn:hover {
        opacity: 1 !important;
        transform: scale(1.1) !important;
        filter: brightness(1.1) !important;
      }
    `;
    document.head.appendChild(style);
  };

  const fetchBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  const createEnhancedDialog = (title, defaultValue, isEdit = false) => {
    injectStyles();

    // Prevent body scroll
    document.body.classList.add("bookmark-dialog-open");

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "bookmark-dialog-overlay";

    // Create container
    const container = document.createElement("div");
    container.className = "bookmark-dialog-container";

    // Create title
    const titleElement = document.createElement("div");
    titleElement.className = `bookmark-dialog-title ${
      isEdit ? "edit" : "create"
    }`;
    titleElement.textContent = title;

    // Create input
    const inputField = document.createElement("input");
    inputField.className = "bookmark-dialog-input";
    inputField.type = "text";
    inputField.value = defaultValue;
    inputField.maxLength = 50;
    inputField.placeholder = isEdit
      ? "Enter new bookmark name..."
      : "Enter bookmark name...";

    // Create character counter
    const counter = document.createElement("div");
    counter.className = "bookmark-dialog-counter";

    const updateCounter = () => {
      const length = inputField.value.length;
      counter.textContent = `${length}/50 characters`;

      counter.classList.remove("warning", "error");
      if (length > 40) counter.classList.add("warning");
      if (length >= 50) counter.classList.add("error");
    };

    updateCounter();
    inputField.addEventListener("input", updateCounter);

    // Create buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "bookmark-dialog-buttons";

    // Create cancel button
    const cancelButton = document.createElement("button");
    cancelButton.className =
      "bookmark-dialog-button bookmark-dialog-button-cancel";
    cancelButton.textContent = "Cancel";

    // Create confirm button
    const confirmButton = document.createElement("button");
    confirmButton.className =
      "bookmark-dialog-button bookmark-dialog-button-confirm";
    confirmButton.textContent = isEdit ? "Save Changes" : "Add Bookmark";

    // Assemble dialog
    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(confirmButton);

    container.appendChild(titleElement);
    container.appendChild(inputField);
    container.appendChild(counter);
    container.appendChild(buttonsContainer);

    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // Focus input and select text with slight delay
    setTimeout(() => {
      inputField.focus();
      inputField.select();
    }, 100);

    const cleanup = () => {
      document.body.classList.remove("bookmark-dialog-open");
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
      }
    };

    return new Promise((resolve) => {
      const handleConfirm = () => {
        const value = inputField.value.trim();
        const result = value || defaultValue;
        cleanup();
        resolve(result.substring(0, 50));
      };

      const handleCancel = () => {
        cleanup();
        resolve(null);
      };

      // Event listeners
      confirmButton.addEventListener("click", handleConfirm);
      cancelButton.addEventListener("click", handleCancel);

      inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleConfirm();
        } else if (e.key === "Escape") {
          e.preventDefault();
          handleCancel();
        }
      });

      // Click overlay to close
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          handleCancel();
        }
      });
    });
  };

  const addNewBookmarkEventHandler = async () => {
    const currentTime = youtubePlayer.currentTime;
    const defaultName = `Bookmark at ${getTime(currentTime)}`;

    return await createEnhancedDialog(
      "Create New Bookmark",
      defaultName,
      false
    );
  };

  const addNewBookmark = async () => {
    try {
      const bookmarkName = await addNewBookmarkEventHandler();
      if (bookmarkName === null) return;

      const currentTime = parseFloat(youtubePlayer.currentTime.toFixed(3));
      const newBookmark = {
        time: currentTime,
        desc: bookmarkName,
      };

      currentVideoBookmarks = await fetchBookmarks();

      // Add bookmark and sort by time
      const updatedBookmarks = [...currentVideoBookmarks, newBookmark].sort(
        (a, b) => a.time - b.time
      );

      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify(updatedBookmarks),
      });

      // Update local array
      currentVideoBookmarks = updatedBookmarks;

      // Show success feedback (optional)
      console.log("Bookmark added successfully:", bookmarkName);
    } catch (error) {
      console.error("Error adding bookmark:", error);
    }
  };

  const newVideoLoaded = async () => {
    const bookmarkBtnExists =
      document.getElementsByClassName("bookmark-btn")[0];

    currentVideoBookmarks = await fetchBookmarks();

    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement("img");

      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";

      youtubeLeftControls =
        document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer = document.getElementsByClassName("video-stream")[0];

      if (youtubeLeftControls && youtubePlayer) {
        youtubeLeftControls.appendChild(bookmarkBtn);
        bookmarkBtn.addEventListener("click", addNewBookmark);
      }
    }
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      if (youtubePlayer) {
        youtubePlayer.currentTime = parseFloat(value.toFixed(3));
      }
    } else if (type === "DELETE") {
      currentVideoBookmarks = currentVideoBookmarks.filter(
        (b) => Math.abs(b.time - value) > 0.001
      );
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify(currentVideoBookmarks),
      });
      response(currentVideoBookmarks);
    } else if (type === "EDIT") {
      const bookmarkIndex = currentVideoBookmarks.findIndex(
        (b) => Math.abs(b.time - value.time) < 0.001
      );
      if (bookmarkIndex !== -1) {
        currentVideoBookmarks[bookmarkIndex].desc = value.newDesc;
        chrome.storage.sync.set({
          [currentVideo]: JSON.stringify(currentVideoBookmarks),
        });
        response(currentVideoBookmarks);
      }
    }
  });

  // Initialize when the script loads
  const init = () => {
    // Wait for YouTube to load
    const waitForYouTube = setInterval(() => {
      if (
        document.getElementsByClassName("ytp-left-controls")[0] &&
        document.getElementsByClassName("video-stream")[0]
      ) {
        clearInterval(waitForYouTube);
        newVideoLoaded();
      }
    }, 1000);

    // Clear interval after 30 seconds to prevent infinite checking
    setTimeout(() => {
      clearInterval(waitForYouTube);
    }, 30000);
  };

  // Start initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

// Helper function to format time
const getTime = (t) => {
  const date = new Date(0);
  date.setSeconds(t);
  return date.toISOString().substr(11, 8);
};
