const currentUserProfile = getCurrentUser();
const urlParamsProfile = new URLSearchParams(window.location.search);
const profileId = urlParamsProfile.get('id') || currentUserProfile.id;

async function loadProfile() {
  try {
    const data = await authFetch(`/users/${profileId}`);
    const { user, posts, message } = data;

    document.getElementById('profile-username').textContent = user.username;
    if (user.bio) document.getElementById('profile-bio').textContent = user.bio;
    if (user.profilePicture) document.getElementById('profile-picture-large').src = user.profilePicture;
    document.title = `${user.username} | Social Network`;

    const friendsCount = document.getElementById('friends-count');
    if (friendsCount) friendsCount.textContent = `(${user.friends.length})`;

    const addFriendBtn = document.getElementById('add-friend-btn');
    const friendStatus = document.getElementById('friend-status');
    const editBtn = document.getElementById('edit-profile-btn');

    if (profileId === currentUserProfile.id) {
      // Self Profile - Can Edit
      editBtn.style.display = 'inline-flex';
      editBtn.onclick = () => {
         document.getElementById('edit-profile-form').style.display = 'block';
         document.getElementById('edit-bio').value = user.bio || '';
         document.getElementById('edit-private').checked = user.isPrivate || false;
      };
    } else {
      // Other user
      const isFriend = user.friends.some(f => f._id === currentUserProfile.id);
      if (isFriend) {
        friendStatus.style.display = 'inline-block';
      } else {
        addFriendBtn.style.display = 'inline-flex';
        addFriendBtn.onclick = () => sendFriendRequest(profileId, addFriendBtn);
      }
    }

    const postsContainer = document.getElementById('user-posts-container');
    if (message === 'This account is private') {
      postsContainer.innerHTML = `
        <div class="card text-center" style="padding: 3rem;">
          <h3 style="margin-bottom:0.5rem;">🔒 This Account is Private</h3>
          <p class="text-muted">You must be friends to see their posts.</p>
        </div>`;
    } else if (posts.length === 0) {
      postsContainer.innerHTML = '<p class="text-center text-muted" style="padding: 2rem;">No posts yet.</p>';
    } else {
      postsContainer.innerHTML = posts.map(p => renderPost(p, currentUserProfile.id)).join('');
    }

    const friendsContainer = document.getElementById('friends-container');
    if (user.friends.length === 0) {
      friendsContainer.innerHTML = '<p class="text-muted text-center" style="margin:2rem 0;">No friends yet.</p>';
    } else {
      friendsContainer.innerHTML = user.friends.map(f => `
        <div class="list-item">
          <div class="friend-info">
             <img src="${f.profilePicture || '/uploads/default.png'}" onerror="this.src='/uploads/default.png';">
             <a href="profile.html?id=${f._id}" style="font-weight:500;">${f.username}</a>
          </div>
        </div>
      `).join('');
    }

  } catch (err) {
    document.querySelector('main').innerHTML = `
      <div class="card text-center text-danger" style="padding:3rem;">
        <h3>User not found</h3>
        <p>${err.message}</p>
      </div>`;
    document.querySelector('aside').innerHTML = '';
  }
}

// Edit Profile Submit
document.getElementById('update-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const bio = document.getElementById('edit-bio').value;
  const isPrivate = document.getElementById('edit-private').checked;
  const pictureFile = document.getElementById('edit-pic').files[0];
  const submitBtn = form.querySelector('button[type="submit"]');

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    // 1. Update Bio and Privacy separately
    const updatedUser = await authFetch('/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, isPrivate })
    });

    const lUser = JSON.parse(localStorage.getItem('user'));
    
    // 2. Handle specific profile picture upload via new endpoint
    if (pictureFile) {
      const picData = new FormData();
      picData.append('profilePicture', pictureFile);
      // NOTE: Do NOT set Content-Type header manually for FormData! authFetch handles this.
      const picRes = await authFetch('/users/profile-pic', {
        method: 'POST',
        body: picData
      });
      lUser.profilePicture = picRes.profilePic;
    }

    localStorage.setItem('user', JSON.stringify(lUser));

    document.getElementById('edit-profile-form').style.display = 'none';
    showToast('Profile updated!');
    window.location.reload(); 
  } catch (err) {
    document.getElementById('edit-error').textContent = err.message;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Changes';
  }
});

document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
   document.getElementById('edit-profile-form').style.display = 'none';
});

async function sendFriendRequest(id, btnElement) {
  try {
    await authFetch(`/users/friend-request/${id}`, { method: 'POST' });
    btnElement.style.display = 'none';
    const status = document.getElementById('friend-status');
    status.textContent = 'Request Sent';
    status.style.display = 'inline-block';
    showToast('Friend request sent!');
  } catch (err) { alert(err.message); }
}

// Same search hook
let searchTimeoutProfile;
const searchInputProfile = document.getElementById('search-input');
const searchResultsProfile = document.getElementById('search-results');

if (searchInputProfile) {
  searchInputProfile.addEventListener('input', (e) => {
    clearTimeout(searchTimeoutProfile);
    const q = e.target.value.trim();
    if (!q) { searchResultsProfile.style.display = 'none'; return; }

    searchTimeoutProfile = setTimeout(async () => {
      try {
        const users = await authFetch(`/users/search?q=${q}`);
        if (users.length === 0) {
          searchResultsProfile.innerHTML = '<div class="search-result-item text-muted">No users found</div>';
        } else {
          searchResultsProfile.innerHTML = users.map(u => 
            `<a href="profile.html?id=${u._id}" class="search-result-item">
               <img src="${u.profilePicture || '/uploads/default.png'}" onerror="this.src='/uploads/default.png';"> 
               ${u.username}
             </a>`
          ).join('');
        }
        searchResultsProfile.style.display = 'block';
      } catch (err) { console.error(err); }
    }, 300);
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-search')) searchResultsProfile.style.display = 'none';
  });
}

loadProfile();
