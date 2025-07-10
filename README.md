# YouTube Bookmarks Extension

A Chrome extension that lets you save and manage timestamps in YouTube videos with ease.

## Features

- **Timestamp Bookmarks**: Save exact moments in YouTube videos with a single click
- **Smart Organization**: Bookmarks automatically organized by video
- **One-Click Navigation**: Jump to any saved timestamp instantly
- **Easy Management**: Delete bookmarks you no longer need
- **Custom Titles**: Name your bookmarks for easy identification
- **Persistent Storage**: Bookmarks saved across browser sessions
- **Clean Interface**: Simple popup showing all bookmarks for current video

## How to Use

### Saving Bookmarks
1. Navigate to any YouTube video
2. Play the video and pause at your desired timestamp
3. Click the bookmark button in the YouTube player controls
4. Enter a name for your bookmark (or use the default)
5. Click "Save"

### Managing Bookmarks
1. Click the extension icon in your Chrome toolbar
2. View all bookmarks for the current video
3. Click any bookmark title to jump to that timestamp
4. Click the delete icon to remove unwanted bookmarks
5. Click any bookmark title to edit its name

## Technical Details

- **Storage**: Uses Chrome's `chrome.storage.sync` to save bookmarks
- **Compatibility**: Works with all modern YouTube video pages
- **Permissions**: Requires access to YouTube domains and Chrome storage
