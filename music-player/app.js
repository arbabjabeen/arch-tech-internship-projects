/* ============================================================
   Pulse — Music Player  |  Application Logic
   Real audio playback + album art images + toast notifications
   ============================================================ */
(function () {
  "use strict";

  // ---- State ----
  let library = [...SONGS];
  let playlist = [];
  let currentSong = null;
  let isPlaying = false;
  let shuffleOn = false;
  let repeatMode = 0; // 0 = off, 1 = all, 2 = one
  let lastVolume = 80;
  let activeGenre = "All";
  let activeSort = "default";
  let searchQuery = "";
  let shuffledOrder = [];
  let shuffleIndex = -1;

  // ---- DOM Refs ----
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const audioEl         = $("#audio-el");
  const libraryEl       = $("#library");
  const noResults       = $("#no-results");
  const searchInput     = $("#search-input");
  const searchClear     = $("#search-clear");
  const genreTabs       = $$("#genre-tabs .genre-tab");
  const sortSelect      = $("#sort-select");

  const npTitle         = $("#np-title");
  const npArtist        = $("#np-artist");
  const npAlbum         = $("#np-album");
  const albumArtDisc    = $("#album-art-disc");

  const btnPlay         = $("#btn-play");
  const btnPrev         = $("#btn-prev");
  const btnNext         = $("#btn-next");
  const btnShuffle      = $("#btn-shuffle");
  const btnRepeat       = $("#btn-repeat");
  const repeatBadge     = $("#repeat-badge");
  const iconPlay        = btnPlay.querySelector(".icon-play");
  const iconPause       = btnPlay.querySelector(".icon-pause");

  const progressBar     = $("#progress-bar");
  const timeCurrent     = $("#time-current");
  const timeTotal       = $("#time-total");

  const volumeBar       = $("#volume-bar");
  const btnMute         = $("#btn-mute");
  const iconVol         = btnMute.querySelector(".icon-vol");
  const iconMuted       = btnMute.querySelector(".icon-muted");

  const playerTitle     = $("#player-track-title");
  const playerArtist    = $("#player-track-artist");
  const playerMiniArt   = $("#player-mini-art");

  const playlistList    = $("#playlist-list");
  const playlistEmpty   = $("#playlist-empty");
  const playlistCount   = $("#playlist-count");
  const playlistDur     = $("#playlist-duration");

  const sidebarEl       = $("#sidebar");
  const sidebarToggle   = $("#sidebar-toggle-btn");
  const sidebarClose    = $("#sidebar-close-btn");

  // Overlay for mobile sidebar
  let overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";
  document.body.appendChild(overlay);

  // Toast container
  let toastContainer = document.createElement("div");
  toastContainer.className = "toast-container";
  toastContainer.id = "toast-container";
  document.body.appendChild(toastContainer);

  // ---- Helpers ----
  function fmtTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function getGradient(id) {
    return COVER_GRADIENTS[(id - 1) % COVER_GRADIENTS.length];
  }

  function getCoverUrl(song) {
    return song.cover || FALLBACK_IMG;
  }

  // ---- Toast Notification ----
  function showToast(message, type = "error") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === "error" ? "⚠" : "✓"}</span>
      <span class="toast-msg">${message}</span>
    `;
    toastContainer.appendChild(toast);
    // Trigger entrance animation
    requestAnimationFrame(() => toast.classList.add("show"));
    // Auto-dismiss after 4s
    setTimeout(() => {
      toast.classList.remove("show");
      toast.addEventListener("transitionend", () => toast.remove());
    }, 4000);
  }

  // ---- Image onerror handler ----
  function handleImgError(img) {
    img.onerror = null; // prevent infinite loop
    img.src = FALLBACK_IMG;
  }

  // ---- Render Library ----
  function getFilteredSongs() {
    let songs = [...library];

    // Genre filter
    if (activeGenre !== "All") {
      songs = songs.filter((s) => s.genre === activeGenre);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      songs = songs.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q) ||
          s.genre.toLowerCase().includes(q)
      );
    }

    // Sort
    if (activeSort === "title") songs.sort((a, b) => a.title.localeCompare(b.title));
    else if (activeSort === "artist") songs.sort((a, b) => a.artist.localeCompare(b.artist));
    else if (activeSort === "duration") songs.sort((a, b) => a.duration - b.duration);

    return songs;
  }

  function renderLibrary() {
    const songs = getFilteredSongs();
    libraryEl.innerHTML = "";

    if (songs.length === 0) {
      noResults.classList.add("show");
      return;
    }
    noResults.classList.remove("show");

    songs.forEach((song) => {
      const card = document.createElement("div");
      card.className = "song-card";
      card.dataset.id = song.id;
      if (currentSong && currentSong.id === song.id) card.classList.add("playing-card");

      const inPlaylist = playlist.some((p) => p.id === song.id);

      card.innerHTML = `
        <button class="card-add ${inPlaylist ? "added" : ""}" data-id="${song.id}" title="${inPlaylist ? "In playlist" : "Add to playlist"}">
          ${inPlaylist ? "✓" : "+"}
        </button>
        <div class="card-art" style="background:${getGradient(song.id)}">
          <img class="card-art-img" src="${getCoverUrl(song)}" alt="${song.title}" onerror="this.onerror=null;this.src=FALLBACK_IMG;" loading="lazy" />
          <div class="card-art-play">
            <div class="card-art-play-icon">▶</div>
          </div>
        </div>
        <div class="card-title">${song.title}</div>
        <div class="card-artist">${song.artist}</div>
        <div class="card-meta">
          <span class="card-duration">${fmtTime(song.duration)}</span>
          <span class="card-genre">${song.genre}</span>
        </div>
      `;

      // Click card to play
      card.addEventListener("click", (e) => {
        if (e.target.closest(".card-add")) return;
        playSong(song);
      });

      // Add to playlist button
      card.querySelector(".card-add").addEventListener("click", (e) => {
        e.stopPropagation();
        togglePlaylist(song);
      });

      libraryEl.appendChild(card);
    });
  }

  // ---- Play Song (REAL audio) ----
  function playSong(song) {
    currentSong = song;
    isPlaying = true;

    // Set the REAL audio source from the song data
    audioEl.src = song.audioUrl;
    audioEl.currentTime = 0;
    audioEl.play().catch((err) => {
      console.error("Audio playback failed:", err);
      showToast(`Could not load audio for "${song.title}"`);
      isPlaying = false;
      updatePlayPauseUI();
    });

    updateNowPlaying();
    updatePlayPauseUI();
    renderLibrary();
    highlightPlaylistItem();
  }

  // ---- Audio error handler ----
  audioEl.addEventListener("error", () => {
    if (currentSong) {
      console.error(`Audio load error for: ${currentSong.title} (${currentSong.audioUrl})`);
      showToast(`Could not load audio for "${currentSong.title}"`);
      isPlaying = false;
      updatePlayPauseUI();
    }
  });

  // ---- Audio timeupdate → drive progress bar from REAL audio ----
  audioEl.addEventListener("timeupdate", () => {
    if (!currentSong || !audioEl.duration || isNaN(audioEl.duration)) return;
    progressBar.max = audioEl.duration;
    progressBar.value = audioEl.currentTime;
    timeCurrent.textContent = fmtTime(audioEl.currentTime);
    timeTotal.textContent = fmtTime(audioEl.duration);
  });

  // ---- Audio loadedmetadata → set total time ----
  audioEl.addEventListener("loadedmetadata", () => {
    if (audioEl.duration && !isNaN(audioEl.duration)) {
      progressBar.max = audioEl.duration;
      timeTotal.textContent = fmtTime(audioEl.duration);
    }
  });

  // ---- Audio ended → handle track end ----
  audioEl.addEventListener("ended", () => {
    onTrackEnd();
  });

  function onTrackEnd() {
    if (repeatMode === 2) {
      // repeat one
      playSong(currentSong);
    } else {
      playNext();
    }
  }

  function updateNowPlaying() {
    if (!currentSong) return;
    npTitle.textContent = currentSong.title;
    npArtist.textContent = currentSong.artist;
    npAlbum.textContent = currentSong.album;
    playerTitle.textContent = currentSong.title;
    playerArtist.textContent = currentSong.artist;

    // Album art disc — set image as background
    const coverUrl = getCoverUrl(currentSong);
    albumArtDisc.style.backgroundImage = `url('${coverUrl}')`;
    albumArtDisc.style.backgroundSize = "cover";
    albumArtDisc.style.backgroundPosition = "center";

    // Player bar mini art
    playerMiniArt.innerHTML = `<img src="${coverUrl}" alt="${currentSong.title}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" onerror="this.onerror=null;this.src=FALLBACK_IMG;" />`;
  }

  function updatePlayPauseUI() {
    if (isPlaying) {
      iconPlay.style.display = "none";
      iconPause.style.display = "block";
      albumArtDisc.classList.add("spinning");
    } else {
      iconPlay.style.display = "block";
      iconPause.style.display = "none";
      albumArtDisc.classList.remove("spinning");
    }
  }

  // ---- Controls ----
  function togglePlay() {
    if (!currentSong) {
      // play first song in library
      const songs = getFilteredSongs();
      if (songs.length) playSong(songs[0]);
      return;
    }
    isPlaying = !isPlaying;
    if (isPlaying) {
      audioEl.play().catch((err) => {
        console.error("Audio play failed:", err);
        showToast(`Could not load audio for "${currentSong.title}"`);
        isPlaying = false;
        updatePlayPauseUI();
      });
    } else {
      audioEl.pause();
    }
    updatePlayPauseUI();
  }

  function getPlayQueue() {
    // If playlist has songs, use playlist. Otherwise use library.
    if (playlist.length > 0) return playlist;
    return getFilteredSongs().length > 0 ? getFilteredSongs() : library;
  }

  function playNext() {
    const queue = getPlayQueue();
    if (!queue.length) return;

    if (shuffleOn) {
      // Fisher-Yates once, then step through
      if (shuffledOrder.length !== queue.length || shuffleIndex < 0) {
        rebuildShuffle(queue);
      }
      shuffleIndex++;
      if (shuffleIndex >= shuffledOrder.length) {
        if (repeatMode >= 1) {
          rebuildShuffle(queue);
          shuffleIndex = 0;
        } else {
          isPlaying = false;
          updatePlayPauseUI();
          return;
        }
      }
      playSong(queue[shuffledOrder[shuffleIndex]]);
      return;
    }

    const idx = queue.findIndex((s) => s.id === (currentSong ? currentSong.id : -1));
    let next = idx + 1;
    if (next >= queue.length) {
      if (repeatMode >= 1) {
        next = 0;
      } else {
        isPlaying = false;
        updatePlayPauseUI();
        return;
      }
    }
    playSong(queue[next]);
  }

  function playPrev() {
    const queue = getPlayQueue();
    if (!queue.length) return;

    // If more than 3 seconds in, restart
    if (audioEl.currentTime > 3) {
      playSong(currentSong);
      return;
    }

    if (shuffleOn && shuffledOrder.length) {
      shuffleIndex--;
      if (shuffleIndex < 0) shuffleIndex = shuffledOrder.length - 1;
      playSong(queue[shuffledOrder[shuffleIndex]]);
      return;
    }

    const idx = queue.findIndex((s) => s.id === (currentSong ? currentSong.id : -1));
    let prev = idx - 1;
    if (prev < 0) prev = queue.length - 1;
    playSong(queue[prev]);
  }

  function rebuildShuffle(queue) {
    shuffledOrder = queue.map((_, i) => i);
    for (let i = shuffledOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOrder[i], shuffledOrder[j]] = [shuffledOrder[j], shuffledOrder[i]];
    }
    shuffleIndex = -1;
  }

  function toggleShuffle() {
    shuffleOn = !shuffleOn;
    btnShuffle.classList.toggle("active-mode", shuffleOn);
    if (shuffleOn) rebuildShuffle(getPlayQueue());
  }

  function cycleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    btnRepeat.classList.toggle("active-mode", repeatMode > 0);
    if (repeatMode === 2) {
      repeatBadge.textContent = "1";
      repeatBadge.style.display = "block";
    } else {
      repeatBadge.style.display = "none";
    }
  }

  // Seek — directly set audioEl.currentTime for REAL seeking
  progressBar.addEventListener("input", () => {
    const seekTo = parseFloat(progressBar.value);
    audioEl.currentTime = seekTo;
    timeCurrent.textContent = fmtTime(seekTo);
  });

  // Volume
  volumeBar.addEventListener("input", () => {
    const v = parseInt(volumeBar.value);
    audioEl.volume = v / 100;
    lastVolume = v;
    updateMuteIcon(v === 0);
  });

  function toggleMute() {
    if (audioEl.volume > 0) {
      lastVolume = parseInt(volumeBar.value);
      audioEl.volume = 0;
      volumeBar.value = 0;
      updateMuteIcon(true);
    } else {
      audioEl.volume = lastVolume / 100;
      volumeBar.value = lastVolume;
      updateMuteIcon(false);
    }
  }

  function updateMuteIcon(muted) {
    iconVol.style.display = muted ? "none" : "block";
    iconMuted.style.display = muted ? "block" : "none";
  }

  // Set initial volume
  audioEl.volume = 0.8;

  // ---- Playlist Management ----
  function togglePlaylist(song) {
    const idx = playlist.findIndex((p) => p.id === song.id);
    if (idx >= 0) {
      playlist.splice(idx, 1);
    } else {
      playlist.push({ ...song });
    }
    renderPlaylist();
    renderLibrary();
  }

  function removeFromPlaylist(id) {
    playlist = playlist.filter((p) => p.id !== id);
    renderPlaylist();
    renderLibrary();
  }

  function renderPlaylist() {
    playlistList.innerHTML = "";
    playlistEmpty.style.display = playlist.length === 0 ? "block" : "none";
    playlistCount.textContent = `${playlist.length} song${playlist.length !== 1 ? "s" : ""}`;

    let totalDur = playlist.reduce((sum, s) => sum + s.duration, 0);
    playlistDur.textContent = fmtTime(totalDur);

    playlist.forEach((song, i) => {
      const li = document.createElement("li");
      li.className = "playlist-item";
      li.dataset.index = i;
      li.draggable = true;
      if (currentSong && currentSong.id === song.id) li.classList.add("active-pl");

      li.innerHTML = `
        <span class="pl-drag-handle" title="Drag to reorder">⠿</span>
        <div class="pl-mini-art">
          <img src="${getCoverUrl(song)}" alt="${song.title}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;" onerror="this.onerror=null;this.src=FALLBACK_IMG;" />
        </div>
        <div class="pl-info">
          <div class="pl-info-title">${song.title}</div>
          <div class="pl-info-artist">${song.artist}</div>
        </div>
        <span class="pl-dur">${fmtTime(song.duration)}</span>
        <button class="pl-remove" data-id="${song.id}" title="Remove">✕</button>
      `;

      // Click to play
      li.addEventListener("click", (e) => {
        if (e.target.closest(".pl-remove") || e.target.closest(".pl-drag-handle")) return;
        playSong(song);
      });

      // Remove
      li.querySelector(".pl-remove").addEventListener("click", (e) => {
        e.stopPropagation();
        removeFromPlaylist(song.id);
      });

      // Drag & Drop
      li.addEventListener("dragstart", onDragStart);
      li.addEventListener("dragover", onDragOver);
      li.addEventListener("dragleave", onDragLeave);
      li.addEventListener("drop", onDrop);
      li.addEventListener("dragend", onDragEnd);

      playlistList.appendChild(li);
    });
  }

  // ---- Drag & Drop ----
  let dragIdx = null;

  function onDragStart(e) {
    dragIdx = parseInt(this.dataset.index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dragIdx);
    this.style.opacity = "0.4";
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    this.classList.add("drag-over");
  }

  function onDragLeave() {
    this.classList.remove("drag-over");
  }

  function onDrop(e) {
    e.preventDefault();
    this.classList.remove("drag-over");
    const from = dragIdx;
    const to = parseInt(this.dataset.index);
    if (from === to) return;

    const [item] = playlist.splice(from, 1);
    playlist.splice(to, 0, item);
    renderPlaylist();
  }

  function onDragEnd() {
    this.style.opacity = "1";
    $$(".playlist-item").forEach((el) => el.classList.remove("drag-over"));
  }

  function highlightPlaylistItem() {
    $$(".playlist-item").forEach((el) => el.classList.remove("active-pl"));
    if (!currentSong) return;
    const idx = playlist.findIndex((p) => p.id === currentSong.id);
    if (idx >= 0) {
      const items = $$(".playlist-item");
      if (items[idx]) items[idx].classList.add("active-pl");
    }
  }

  // ---- Search ----
  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value;
    renderLibrary();
  });
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    renderLibrary();
    searchInput.focus();
  });

  // ---- Genre Tabs ----
  genreTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      genreTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeGenre = tab.dataset.genre;
      renderLibrary();
    });
  });

  // ---- Sort ----
  sortSelect.addEventListener("change", () => {
    activeSort = sortSelect.value;
    renderLibrary();
  });

  // ---- Sidebar Toggle ----
  sidebarToggle.addEventListener("click", openSidebar);
  sidebarClose.addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  function openSidebar() {
    sidebarEl.classList.add("open");
    overlay.classList.add("show");
  }
  function closeSidebar() {
    sidebarEl.classList.remove("open");
    overlay.classList.remove("show");
  }

  // ---- Button Listeners ----
  btnPlay.addEventListener("click", togglePlay);
  btnNext.addEventListener("click", playNext);
  btnPrev.addEventListener("click", playPrev);
  btnShuffle.addEventListener("click", toggleShuffle);
  btnRepeat.addEventListener("click", cycleRepeat);
  btnMute.addEventListener("click", toggleMute);

  // ---- Keyboard Shortcuts ----
  document.addEventListener("keydown", (e) => {
    // Don't trigger if typing in search
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    switch (e.code) {
      case "Space":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowRight":
        e.preventDefault();
        if (currentSong && audioEl.duration) {
          audioEl.currentTime = Math.min(audioEl.currentTime + 5, audioEl.duration);
        }
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (currentSong) {
          audioEl.currentTime = Math.max(audioEl.currentTime - 5, 0);
        }
        break;
      case "KeyM":
        toggleMute();
        break;
    }
  });

  // ---- Init ----
  renderLibrary();
  renderPlaylist();

})();
