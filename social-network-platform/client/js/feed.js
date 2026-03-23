const currentUser = getCurrentUser();

async function loadPosts() {
  const container = document.getElementById('posts-container');
  try {
    const posts = await authFetch('/posts');
    if (posts.length === 0) {
      container.innerHTML = '<p class="text-center text-muted" style="padding: 2rem;">No posts yet. Be the first to share something!</p>';
      return;
    }
    container.innerHTML = posts.map(p => renderPost(p, currentUser.id)).join('');
  } catch (err) {
    container.innerHTML = `<p class="error-msg">${err.message}</p>`;
  }
}

const createPostForm = document.getElementById('create-post-form');
if (createPostForm) {
  createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('post-content').value;
    const visibility = document.getElementById('post-visibility').value;
    const imageFile = document.getElementById('post-image').files[0];
    const errorMsg = document.getElementById('post-error');
    const submitBtn = createPostForm.querySelector('button[type="submit"]');

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Posting...';

      const formData = new FormData();
      formData.append('content', content);
      formData.append('visibility', visibility);
      if (imageFile) formData.append('image', imageFile);

      await authFetch('/posts', {
        method: 'POST',
        body: formData
      });
      
      createPostForm.reset();
      document.getElementById('file-name').textContent = '';
      loadPosts(); // Reload to show new post cleanly
    } catch (err) {
      errorMsg.textContent = err.message;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Post';
    }
  });
}

// Sockets specific to new posts only
window.addEventListener('socketNewPost', (e) => {
  const post = e.detail;
  const container = document.getElementById('posts-container');
  if (container.querySelector('.text-muted')) container.innerHTML = '';
  
  // Only add if public or friend (sockets might broadcast broadly, UI filters)
  // For simplicity here, assume we fetched it, but this is a lightweight frontend append
  container.insertAdjacentHTML('afterbegin', renderPost(post, currentUser.id));
  showToast(`${post.author.username} created a new post!`);
});

// Notifications processing
window.loadNotifications = async () => {
  const container = document.getElementById('notifications-container');
  const btn = document.getElementById('mark-read-btn');
  const badge = document.getElementById('notif-badge');
  try {
    const notifications = await authFetch('/notifications');
    const unreadCount = notifications.filter(n => !n.read).length;
    
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
    
    if (notifications.length === 0) {
      container.innerHTML = '<p class="text-muted text-center" style="margin:2rem 0;">You\'re caught up!</p>';
      btn.style.display = 'none';
      return;
    }

    btn.style.display = unreadCount > 0 ? 'block' : 'none';

    container.innerHTML = notifications.map(n => {
      let text = '';
      if (n.type === 'like') text = 'liked your post';
      if (n.type === 'comment') text = 'commented on your post';
      if (n.type === 'friendRequest') text = 'sent a friend request';
      if (n.type === 'friendAccept') text = 'accepted your friend request';
      
      const pPic = n.sender.profilePicture || '/uploads/default.png';
      return `
        <div class="list-item" style="${!n.read ? 'background-color: var(--bg-color); border-radius: var(--radius-md); padding-left: 0.5rem; padding-right: 0.5rem;' : ''}">
          <div class="friend-info">
            <img src="${pPic}" onerror="this.src='/uploads/default.png';">
            <div>
              <a href="profile.html?id=${n.sender._id}" style="font-weight:600;">${n.sender.username}</a>
              <span class="text-muted"> ${text}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<p class="error-msg">${err.message}</p>`;
  }
};

document.getElementById('mark-read-btn')?.addEventListener('click', async () => {
  try {
    await authFetch('/notifications/read', { method: 'PUT' });
    loadNotifications();
  } catch (err) { alert(err.message); }
});

async function loadFriendRequests() {
  const container = document.getElementById('requests-container');
  try {
    const user = await authFetch('/users/me');
    if (user.friendRequests.length === 0) {
      container.innerHTML = '<p class="text-muted text-center" style="margin:2rem 0;">No pending requests</p>';
      return;
    }

    container.innerHTML = user.friendRequests.map(r => `
      <div class="list-item" id="req-${r._id}">
        <div class="friend-info">
          <img src="${r.profilePicture || '/uploads/default.png'}" onerror="this.src='/uploads/default.png';">
          <a href="profile.html?id=${r._id}" style="font-weight:600;">${r.username}</a>
        </div>
        <button class="btn btn-sm btn-primary" onclick="acceptFriend('${r._id}')">Accept</button>
      </div>
    `).join('');
  } catch (err) { console.error(err); }
}

window.acceptFriend = async (id) => {
  try {
    await authFetch(`/users/accept-friend/${id}`, { method: 'POST' });
    document.getElementById(`req-${id}`).remove();
    showToast('Friend request accepted!');
    
    const container = document.getElementById('requests-container');
    if (container.children.length === 0) {
      container.innerHTML = '<p class="text-muted text-center" style="margin:2rem 0;">No pending requests</p>';
    }
  } catch (err) { alert(err.message); }
};

// Search Dropdown UI logic
let searchTimeout;
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const q = e.target.value.trim();
    if (!q) { searchResults.style.display = 'none'; return; }

    searchTimeout = setTimeout(async () => {
      try {
        const users = await authFetch(`/users/search?q=${q}`);
        if (users.length === 0) {
          searchResults.innerHTML = '<div class="search-result-item text-muted">No users found</div>';
        } else {
          searchResults.innerHTML = users.map(u => 
            `<a href="profile.html?id=${u._id}" class="search-result-item">
               <img src="${u.profilePicture || '/uploads/default.png'}" onerror="this.src='/uploads/default.png';"> 
               ${u.username}
             </a>`
          ).join('');
        }
        searchResults.style.display = 'block';
      } catch (err) { console.error(err); }
    }, 300);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-search')) searchResults.style.display = 'none';
  });
}

// Initial Calls
if (window.location.pathname.endsWith('feed.html')) {
  loadPosts();
  loadNotifications();
  loadFriendRequests();
}
