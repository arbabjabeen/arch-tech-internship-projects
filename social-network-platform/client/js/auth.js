// API Base URL
const API_URL = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');
const getCurrentUser = () => JSON.parse(localStorage.getItem('user'));

if (!getToken() && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/' && !window.location.pathname.endsWith('/')) {
  window.location.href = 'index.html';
}

const authFetch = async (url, options = {}) => {
  const token = getToken();
  if (!options.headers) options.headers = {};
  
  // Only set Content-Type if not sending FormData
  if (!(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
  }

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${url}`, options);
  
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
    throw new Error('Not authorized');
  }

  // Debug: Prevent trying to parse HTML as JSON
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("text/html")) {
    const rawText = await res.text();
    console.error("Server returned HTML instead of JSON:", rawText);
    throw new Error("Unexpected HTML response from server. See console for details.");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  
  return data;
};

// Global Nav Setup
const navUser = getCurrentUser();
if (navUser) {
  const nameSpan = document.getElementById('current-username');
  if (nameSpan) nameSpan.textContent = navUser.username;
  
  const picImg = document.getElementById('nav-profile-pic');
  if (picImg && navUser.profilePicture) {
    picImg.src = navUser.profilePicture;
  }
}

document.getElementById('logout-btn')?.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Auth Forms
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  try {
    const data = await authFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'feed.html';
  } catch (err) {
    document.getElementById('login-error').textContent = err.message;
  }
});

document.getElementById('register-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  try {
    const data = await authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = 'feed.html';
  } catch (err) {
    document.getElementById('register-error').textContent = err.message;
  }
});

// Render Post helper
function renderPost(post, currentUserId) {
  const isLiked = post.likes.includes(currentUserId);
  const authorPic = post.author.profilePicture || '/uploads/default.png';
  const postImageHtml = post.image ? `<img src="${post.image}" class="post-image" alt="Post Request">` : '';

  return `
    <div class="card" id="post-${post._id}">
      <div class="post-header">
        <a href="profile.html?id=${post.author._id}" class="post-author-info">
          <img src="${authorPic}" class="post-author-pic" onerror="this.src='/uploads/default.png';">
          <span class="post-author-name">${post.author.username}</span>
        </a>
        <span class="post-date" title="${new Date(post.createdAt).toLocaleString()}">
          ${new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <div class="post-content">${escapeHTML(post.content)}</div>
      ${postImageHtml}
      
      <div class="post-actions">
        <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="window.toggleLike('${post._id}')">
          ${isLiked ? '♥' : '♡'} <span class="like-count" id="like-count-${post._id}">${post.likes.length}</span>
        </button>
        <button class="action-btn" onclick="window.toggleComments('${post._id}')">
          💬 <span class="comment-count" id="comment-count-${post._id}">${post.comments.length}</span> Comments
        </button>
        ${post.visibility === 'friends' ? '<span class="text-muted" style="font-size:0.75rem; margin-left:auto;">👥 Friends Only</span>' : ''}
      </div>

      <div class="comments-section" id="comments-${post._id}" style="display:none;">
        <div class="comments-list" id="comments-list-${post._id}">
          ${post.comments.map(c => `
            <div class="comment">
              <a href="profile.html?id=${c.user._id || c.user}" title="${c.user.username}">
                <img src="${c.user.profilePicture || '/uploads/default.png'}" class="comment-author-pic" onerror="this.src='/uploads/default.png';">
              </a>
              <div class="comment-body">
                <span class="comment-author">${c.user.username || 'User'}</span>
                <span class="comment-text">${escapeHTML(c.text)}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <form class="comment-form" onsubmit="window.submitComment(event, '${post._id}')">
          <input type="text" placeholder="Write a comment..." required autocomplete="off">
          <button type="submit" class="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  `;
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Global functions for inline DOM clicking
window.toggleLike = async (postId) => {
  try {
    const res = await authFetch(`/posts/${postId}/like`, { method: 'POST' });
    // DOM will update via socket event locally if desired, or here:
    // We update instantly here for perceived performance, socket syncs others.
    const likeBtn = document.querySelector(`#post-${postId} .action-btn`);
    const countSpan = document.getElementById(`like-count-${postId}`);
    countSpan.textContent = res.likes.length;
    
    if (res.likes.includes(getCurrentUser().id)) {
      likeBtn.classList.add('liked');
      likeBtn.childNodes[0].nodeValue = '♥ ';
    } else {
      likeBtn.classList.remove('liked');
      likeBtn.childNodes[0].nodeValue = '♡ ';
    }
  } catch (err) { alert(err.message); }
};

window.toggleComments = (postId) => {
  const section = document.getElementById(`comments-${postId}`);
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
};

window.submitComment = async (event, postId) => {
  event.preventDefault();
  const form = event.target;
  const input = form.querySelector('input');
  const text = input.value;
  try {
    // Optimistic UI could be here, but we'll wait for API for real ID
    await authFetch(`/posts/${postId}/comment`, { method: 'POST', body: JSON.stringify({ text }) });
    input.value = '';
    // The socket 'postCommented' event will actually append the UI visually!
  } catch (err) { alert(err.message); }
};
