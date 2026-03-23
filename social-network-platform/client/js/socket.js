let socket;

if (getToken()) {
  const user = getCurrentUser();
  socket = io('http://localhost:3000');
  
  socket.on('connect', () => {
    socket.emit('join', user.id);
  });

  socket.on('newNotification', (data) => {
    showToast(data.message);
    if (typeof loadNotifications === 'function') loadNotifications();
  });

  socket.on('newPost', (post) => {
    if (post.author._id !== user.id) {
       window.dispatchEvent(new CustomEvent('socketNewPost', { detail: post }));
    }
  });

  // Granular Socket Events
  socket.on('postLiked', (data) => {
    // Only update if it's not us (our local UI already updated instantly)
    if (data.byUser !== user.id) {
      const countSpan = document.getElementById(`like-count-${data.postId}`);
      if (countSpan) countSpan.textContent = data.likes.length;
    }
  });

  socket.on('postCommented', (data) => {
    const list = document.getElementById(`comments-list-${data.postId}`);
    const countSpan = document.getElementById(`comment-count-${data.postId}`);
    
    if (list && countSpan) {
      countSpan.textContent = data.count;
      const c = data.comment;
      const newHtml = `
            <div class="comment">
              <a href="profile.html?id=${c.user._id}" title="${c.user.username}">
                <img src="${c.user.profilePicture || '/uploads/default.png'}" class="comment-author-pic" onerror="this.src='/uploads/default.png';">
              </a>
              <div class="comment-body">
                <span class="comment-author">${c.user.username}</span>
                <span class="comment-text">${escapeHTML(c.text)}</span>
              </div>
            </div>`;
      list.insertAdjacentHTML('beforeend', newHtml);
    }
  });
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s';
    setTimeout(() => toast.remove(), 500);
  }, 5000);
}
