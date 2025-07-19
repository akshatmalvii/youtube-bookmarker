import { getActiveTabURL } from "./utils.js";

// Inject enhanced dialog styles with proper z-index and positioning
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
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif !important;
      animation: dialogSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      position: relative !important;
      overflow: visible !important;
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
    body.dialog-open {
      overflow: hidden !important;
    }
  `;
  document.head.appendChild(style);
};

const createEnhancedEditDialog = (currentTitle) => {
  injectStyles();

  // Prevent body scroll
  document.body.classList.add("dialog-open");

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "bookmark-dialog-overlay";

  // Create container
  const container = document.createElement("div");
  container.className = "bookmark-dialog-container";

  // Create title
  const titleElement = document.createElement("div");
  titleElement.className = "bookmark-dialog-title edit";
  titleElement.textContent = "Edit Bookmark Name";

  // Create input
  const inputField = document.createElement("input");
  inputField.className = "bookmark-dialog-input";
  inputField.type = "text";
  inputField.value = currentTitle;
  inputField.maxLength = 50;
  inputField.placeholder = "Enter bookmark name...";

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
  confirmButton.textContent = "Save Changes";

  // Assemble dialog
  buttonsContainer.appendChild(cancelButton);
  buttonsContainer.appendChild(confirmButton);

  container.appendChild(titleElement);
  container.appendChild(inputField);
  container.appendChild(counter);
  container.appendChild(buttonsContainer);

  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // Focus input and select text
  setTimeout(() => {
    inputField.focus();
    inputField.select();
  }, 100);

  const cleanup = () => {
    document.body.classList.remove("dialog-open");
    if (overlay.parentNode) {
      document.body.removeChild(overlay);
    }
  };

  return new Promise((resolve) => {
    const handleConfirm = () => {
      const value = inputField.value.trim();
      const result = value || currentTitle;
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

const addNewBookmark = (bookmarks, bookmark) => {
  const bookmarkTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";
  bookmarkTitleElement.addEventListener("click", () =>
    onEditTitle(bookmark.time, bookmark.desc)
  );

  controlsElement.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  newBookmarkElement.appendChild(bookmarkTitleElement);
  newBookmarkElement.appendChild(controlsElement);
  bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    bookmarksElement.innerHTML = '<div class="row">No bookmarks to show</div>';
  }

  return;
};

const onPlay = async (e) => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: parseFloat(bookmarkTime),
  });
};

const onDelete = async (e) => {
  const activeTab = await getActiveTabURL();
  const bookmarkElement = e.target.closest(".bookmark");

  if (!bookmarkElement) {
    console.error("Could not find bookmark element");
    return;
  }

  const bookmarkTime = bookmarkElement.getAttribute("timestamp");

  // Add deletion animation
  bookmarkElement.style.transition = "all 0.3s ease";
  bookmarkElement.style.transform = "translateX(-100%)";
  bookmarkElement.style.opacity = "0";

  setTimeout(() => {
    if (bookmarkElement.parentNode) {
      bookmarkElement.remove();
    }
  }, 300);

  try {
    await chrome.tabs.sendMessage(activeTab.id, {
      type: "DELETE",
      value: parseFloat(bookmarkTime),
    });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    // If there was an error, re-render the bookmarks to restore the UI
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const currentVideo = urlParameters.get("v");

    if (currentVideo) {
      chrome.storage.sync.get([currentVideo], (data) => {
        const currentVideoBookmarks = data[currentVideo]
          ? JSON.parse(data[currentVideo])
          : [];
        viewBookmarks(currentVideoBookmarks);
      });
    }
  }
};

const onEditTitle = async (timestamp, currentTitle) => {
  const newTitle = await createEnhancedEditDialog(currentTitle);

  if (newTitle !== null && newTitle !== currentTitle) {
    const activeTab = await getActiveTabURL();

    // Update the UI immediately with animation
    const titleElement = document.querySelector(
      `#bookmark-${timestamp} .bookmark-title`
    );
    if (titleElement) {
      titleElement.style.transition = "all 0.3s ease";
      titleElement.style.opacity = "0.5";

      setTimeout(() => {
        titleElement.textContent = newTitle;
        titleElement.style.opacity = "1";
      }, 150);
    }

    // Send the update to the content script
    try {
      await chrome.tabs.sendMessage(activeTab.id, {
        type: "EDIT",
        value: {
          time: parseFloat(timestamp),
          newDesc: newTitle,
        },
      });
    } catch (error) {
      console.error("Error updating bookmark:", error);
      // If there was an error, revert the UI change
      if (titleElement) {
        titleElement.textContent = currentTitle;
        titleElement.style.opacity = "1";
      }
    }
  }
};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");
  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  controlElement.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent event bubbling
    eventListener(e);
  });
  controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
  // Add loading state
  const container = document.getElementsByClassName("container")[0];
  container.classList.add("loading");

  const activeTab = await getActiveTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo]
        ? JSON.parse(data[currentVideo])
        : [];

      viewBookmarks(currentVideoBookmarks);
      container.classList.remove("loading");
    });
  } else {
    container.innerHTML =
      '<div class="title">🚫 YouTube Video Required</div><div style="padding: 20px; text-align: center; color: #6c757d;">Please navigate to a YouTube video page to use bookmarks.</div>';
    container.classList.remove("loading");
  }
});
