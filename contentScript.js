(() => {
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  const fetchBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  const addNewBookmarkEventHandler = async () => {
    const currentTime = youtubePlayer.currentTime;
    const defaultName = `Bookmark at ${getTime(currentTime)}`;

    // Create our own prompt to avoid the browser's additional dialogs checkbox
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
    promptText.textContent = "Enter bookmark name:";
    promptText.style.marginBottom = "10px";

    const inputField = document.createElement("input");
    inputField.type = "text";
    inputField.value = defaultName;
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
        const bookmarkName = inputField.value.trim() || defaultName;
        cleanup();
        resolve(bookmarkName.substring(0, 50)); // Limit to 50 chars
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
    });
  };

  const addNewBookmark = async () => {
    const bookmarkName = await addNewBookmarkEventHandler();
    if (bookmarkName === null) return;

    const currentTime = parseFloat(youtubePlayer.currentTime.toFixed(3)); // Store with 3 decimal places
    const newBookmark = {
      time: currentTime,
      desc: bookmarkName,
    };

    currentVideoBookmarks = await fetchBookmarks();

    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(
        [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
      ),
    });
  };

  const newVideoLoaded = async () => {
    const bookmarkBtnExists =
      document.getElementsByClassName("bookmark-btn")[0];

    currentVideoBookmarks = await fetchBookmarks();

    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement("img");

      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";

      youtubeLeftControls =
        document.getElementsByClassName("ytp-left-controls")[0];
      youtubePlayer = document.getElementsByClassName("video-stream")[0];

      youtubeLeftControls.appendChild(bookmarkBtn);
      bookmarkBtn.addEventListener("click", addNewBookmark);
    }
  };

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, value, videoId } = obj;

    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      youtubePlayer.currentTime = parseFloat(value.toFixed(3));
    } else if (type === "DELETE") {
      currentVideoBookmarks = currentVideoBookmarks.filter(
        (b) => Math.abs(b.time - value) > 0.001 // More reliable float comparison
      );
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify(currentVideoBookmarks),
      });
      response(currentVideoBookmarks);
    } else if (type === "EDIT") {
      const bookmarkIndex = currentVideoBookmarks.findIndex(
        (b) => b.time == value.time
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

  newVideoLoaded();
})();

const getTime = (t) => {
  var date = new Date(0);
  date.setSeconds(t);

  return date.toISOString().substr(11, 8);
};
