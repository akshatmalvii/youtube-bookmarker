import { getActiveTabURL } from "./utils.js";

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
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
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

  // Remove the element immediately for better UX
  bookmarkElement.remove();

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
  const promptContainer = document.createElement("div");
  promptContainer.style.position = "fixed";
  promptContainer.style.top = "50%";
  promptContainer.style.left = "50%";
  promptContainer.style.transform = "translate(-50%, -50%)";
  promptContainer.style.backgroundColor = "white";
  promptContainer.style.padding = "20px";
  promptContainer.style.borderRadius = "5px";
  promptContainer.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  promptContainer.style.zIndex = "9999";

  const promptText = document.createElement("p");
  promptText.textContent = "Edit bookmark name:";
  promptText.style.marginBottom = "10px";

  const inputField = document.createElement("input");
  inputField.type = "text";
  inputField.value = currentTitle;
  inputField.style.width = "100%";
  inputField.style.marginBottom = "10px";
  inputField.style.padding = "5px";

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "flex-end";
  buttonContainer.style.gap = "10px";

  const confirmButton = document.createElement("button");
  confirmButton.textContent = "OK";
  confirmButton.style.padding = "5px 10px";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.style.padding = "5px 10px";

  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(confirmButton);

  promptContainer.appendChild(promptText);
  promptContainer.appendChild(inputField);
  promptContainer.appendChild(buttonContainer);

  document.body.appendChild(promptContainer);
  inputField.focus();

  const cleanup = () => {
    document.body.removeChild(promptContainer);
  };

  return new Promise((resolve) => {
    const handleConfirm = () => {
      const newTitle =
        inputField.value.trim().substring(0, 50) ||
        currentTitle.substring(0, 50);
      cleanup();
      resolve(newTitle);
    };

    const handleCancel = () => {
      cleanup();
      resolve(null);
    };

    confirmButton.addEventListener("click", handleConfirm);
    cancelButton.addEventListener("click", handleCancel);
    inputField.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleConfirm();
    });
  }).then(async (newTitle) => {
    if (newTitle !== null && newTitle !== currentTitle) {
      const activeTab = await getActiveTabURL();
      document.querySelector(
        `#bookmark-${timestamp} .bookmark-title`
      ).textContent = newTitle;

      chrome.tabs.sendMessage(
        activeTab.id,
        {
          type: "EDIT",
          value: {
            time: parseFloat(timestamp),
            newDesc: newTitle,
          },
        },
        viewBookmarks
      );
    }
  });
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
    });
  } else {
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML =
      '<div class="title">This is not a youtube video page.</div>';
  }
});
