import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, push, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyArtybAAgMFeLv1K9b_0GhSh66oYWuDLco',
  authDomain: 'news-82329.firebaseapp.com',
  databaseURL: 'https://news-82329-default-rtdb.firebaseio.com',
  projectId: 'news-82329',
  storageBucket: 'news-82329.appspot.com'
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const PAGE_SIZE = 15;
const CLOUD_NAME = 'dnrtx7xgp';
const UPLOAD_PRESET = 'news_upload';

let currentUser = null;
let posts = {};
let postIds = [];
let renderedCount = 0;
let selectMode = false;
let selectedIds = new Set();
let longPressTimer;

const $ = (id) => document.getElementById(id);
const isVideo = (post) => post.mediaType === 'video' || /\.(mp4|webm|ogg|mov)(?:[?#]|$)/i.test(post.mediaUrl || '');
const thumbUrl = (url, video) => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url || '';
  const transform = video ? 'q_auto:low,f_jpg,w_300,so_0' : 'q_auto:low,f_auto,w_300,c_fill,g_auto';
  return url.replace('/upload/', `/upload/${transform}/`);
};
const fullUrl = (url) => url || '';

function displayName(user) {
  return user?.displayName || `User #${(user?.uid || '').slice(0, 6)}`;
}

function showToast(message, duration = 2800) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), duration);
}

function renderGallery(reset = false) {
  const gallery = $('gallery');
  if (reset) {
    renderedCount = 0;
    gallery.replaceChildren();
  }
  if (!postIds.length) {
    gallery.innerHTML = '<div class="empty-state"><i class="fas fa-camera-retro"></i>No posts yet. Be the first!</div>';
    $('loadMoreBtn').style.display = 'none';
    return;
  }
  const nextIds = postIds.slice(renderedCount, renderedCount + PAGE_SIZE);
  const fragment = document.createDocumentFragment();
  nextIds.forEach((id) => fragment.append(createTile(id, posts[id])));
  gallery.append(fragment);
  renderedCount += nextIds.length;
  const remaining = postIds.length - renderedCount;
  const button = $('loadMoreBtn');
  button.style.display = remaining > 0 ? 'block' : 'none';
  button.disabled = remaining <= 0;
  button.textContent = `Load more${remaining ? ` (${remaining} remaining)` : ''}`;
}

function createTile(id, post) {
  const tile = document.createElement('div');
  tile.className = 'photo';
  tile.dataset.id = id;
  const video = isVideo(post);
  const image = document.createElement('img');
  image.src = thumbUrl(post.mediaUrl, video);
  image.alt = post.title || 'Gallery post';
  image.loading = 'lazy';
  image.onerror = () => { image.src = post.mediaUrl || ''; };
  tile.append(image);
  if (video) {
    const badge = document.createElement('span');
    badge.className = 'video-badge';
    badge.innerHTML = '<i class="fas fa-play" style="font-size:9px;margin-right:3px"></i>Video';
    tile.append(badge);
  }
  const check = document.createElement('div');
  check.className = 'check-icon';
  check.innerHTML = '<i class="fas fa-check"></i>';
  tile.append(check);
  tile.addEventListener('click', () => selectMode ? toggleSelect(id, tile) : openFeed(id));
  tile.addEventListener('pointerdown', () => {
    longPressTimer = window.setTimeout(() => enterSelectMode(id, tile), 550);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((event) => tile.addEventListener(event, () => clearTimeout(longPressTimer)));
  return tile;
}

function loadGallery() {
  onValue(ref(db, 'photos'), (snapshot) => {
    posts = snapshot.val() || {};
    postIds = Object.keys(posts).sort((a, b) => (posts[b].timestamp || 0) - (posts[a].timestamp || 0));
    $('postCount').textContent = postIds.length;
    renderGallery(true);
  }, (error) => {
    console.error('Unable to load gallery:', error);
    $('gallery').innerHTML = '<div class="empty-state"><i class="fas fa-triangle-exclamation"></i>Could not load the gallery. Please try again.</div>';
    showToast('Could not load gallery');
  }, { onlyOnce: false });
}

function enterSelectMode(id, tile) {
  if (!selectMode) {
    selectMode = true;
    $('selectBar').classList.add('visible');
  }
  toggleSelect(id, tile);
}

function toggleSelect(id, tile) {
  if (selectedIds.has(id)) selectedIds.delete(id); else selectedIds.add(id);
  (tile || document.querySelector(`.photo[data-id="${CSS.escape(id)}"]`))?.classList.toggle('selected', selectedIds.has(id));
  $('selectCount').textContent = `${selectedIds.size} selected`;
}

function cancelSelect() {
  selectMode = false;
  selectedIds.clear();
  document.querySelectorAll('.photo.selected').forEach((tile) => tile.classList.remove('selected'));
  $('selectBar').classList.remove('visible');
}

async function downloadFile(url, filename) {
  try {
    const response = await fetch(fullUrl(url));
    if (!response.ok) throw new Error('Download failed');
    const objectUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(fullUrl(url), '_blank', 'noopener');
  }
}

async function downloadSelected() {
  if (!selectedIds.size) return showToast('Select at least one post');
  await Promise.all([...selectedIds].map((id, index) => downloadFile(posts[id]?.mediaUrl, `hirauli-${index + 1}`)));
  cancelSelect();
}

function openFeed(startId) {
  const modal = $('feedModal');
  const container = $('feedContainer');
  container.replaceChildren();
  const ordered = startId ? [startId, ...postIds.filter((id) => id !== startId)] : postIds;
  ordered.forEach((id) => container.append(createPost(id, posts[id])));
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeFeed() {
  $('feedModal').classList.remove('open');
  document.body.style.overflow = '';
}

function createPost(id, post) {
  const article = document.createElement('article');
  article.className = 'feed-post';
  const header = document.createElement('div');
  header.className = 'post-user-row';
  header.innerHTML = `<div class="uname"><i class="fas fa-user-circle"></i>${escapeHtml(post.userName || 'Hirauli user')}</div><span class="tago">${timeAgo(post.timestamp)}</span>`;
  const mediaWrap = document.createElement('div');
  mediaWrap.className = 'media-wrapper';
  if (post.title) {
    const title = document.createElement('div');
    title.className = 'post-title-overlay';
    title.textContent = post.title;
    mediaWrap.append(title);
  }
  const mediaContainer = document.createElement('div');
  mediaContainer.className = 'media-container';
  const media = isVideo(post) ? document.createElement('video') : document.createElement('img');
  media.src = fullUrl(post.mediaUrl);
  if (media.tagName === 'VIDEO') media.controls = true;
  else media.alt = post.title || 'Gallery post';
  mediaContainer.append(media);
  mediaWrap.append(mediaContainer);
  const actions = document.createElement('div');
  actions.className = 'feed-actions';
  const liked = Boolean(currentUser && post.likedBy?.[currentUser.uid]);
  actions.innerHTML = `<button class="action-btn heart ${liked ? 'liked' : ''}" aria-label="Like"><i class="${liked ? 'fas' : 'far'} fa-heart"></i></button><button class="action-btn" aria-label="Share"><i class="fas fa-share"></i></button><button class="action-btn" aria-label="Download"><i class="fas fa-download"></i></button>`;
  const likes = document.createElement('div');
  likes.className = 'likes-count';
  likes.textContent = `${post.likesCount || 0} likes`;
  const comments = document.createElement('div');
  comments.className = 'comment-area';
  comments.append(createComments(post.comments));
  const inputRow = document.createElement('div');
  inputRow.className = 'comment-input-group';
  const input = document.createElement('input'); input.placeholder = 'Add a comment…';
  const send = document.createElement('button'); send.textContent = 'Post';
  inputRow.append(input, send); comments.append(inputRow);
  actions.children[0].addEventListener('click', () => likePost(id, post, actions.children[0], likes));
  actions.children[1].addEventListener('click', () => shareMedia(post.mediaUrl, post.title));
  actions.children[2].addEventListener('click', () => downloadFile(post.mediaUrl, 'hirauli-media'));
  send.addEventListener('click', () => postComment(id, input));
  input.addEventListener('keydown', (event) => { if (event.key === 'Enter') postComment(id, input); });
  article.append(header, mediaWrap, actions, likes, comments);
  return article;
}

function createComments(data) {
  const list = document.createElement('div');
  list.className = 'comments-list';
  Object.values(data || {}).sort((a, b) => (a.timestamp || a.time || 0) - (b.timestamp || b.time || 0)).forEach((comment) => {
    const row = document.createElement('div'); row.className = 'comment';
    const user = document.createElement('span'); user.className = 'cuser'; user.textContent = comment.userName || comment.user || 'User';
    const text = document.createTextNode(comment.text || '');
    row.append(user, text); list.append(row);
  });
  return list;
}

async function likePost(id, post, button, label) {
  if (!currentUser) return showToast('Connecting your account…');
  const liked = Boolean(post.likedBy?.[currentUser.uid]);
  const likesCount = Math.max(0, (post.likesCount || 0) + (liked ? -1 : 1));
  try {
    await update(ref(db, `photos/${id}`), { [`likedBy/${currentUser.uid}`]: liked ? null : true, likesCount });
    post.likedBy ||= {}; if (liked) delete post.likedBy[currentUser.uid]; else post.likedBy[currentUser.uid] = true;
    post.likesCount = likesCount;
    button.classList.toggle('liked', !liked); button.querySelector('i').className = `${liked ? 'far' : 'fas'} fa-heart`;
    label.textContent = `${likesCount} likes`;
  } catch (error) { console.error(error); showToast('Could not update like'); }
}

async function postComment(id, input) {
  const text = input.value.trim();
  if (!text) return;
  if (!currentUser) return showToast('Connecting your account…');
  try {
    await push(ref(db, `photos/${id}/comments`), { text, userName: displayName(currentUser), timestamp: Date.now() });
    input.value = '';
  } catch (error) { console.error(error); showToast('Could not post comment'); }
}

async function shareMedia(url, title = '') {
  try {
    if (navigator.share) await navigator.share({ title: title || 'Hirauli Gallery', url });
    else { await navigator.clipboard.writeText(url); showToast('Link copied'); }
  } catch (error) { if (error.name !== 'AbortError') showToast('Could not share media'); }
}

function onFileChosen(event) {
  const file = event.target.files?.[0];
  const preview = $('previewThumb');
  if (!file) { preview.style.display = 'none'; return; }
  $('fileLabel').textContent = file.name;
  const media = file.type.startsWith('video/') ? document.createElement('video') : document.createElement('img');
  media.src = URL.createObjectURL(file); if (media.tagName === 'VIDEO') media.controls = true;
  preview.replaceChildren(media); preview.style.display = 'block';
}

async function uploadToCloudinary() {
  const file = $('fileInput').files?.[0];
  if (!file) return showToast('Choose a photo or video first');
  if (!currentUser) return showToast('Connecting your account…');
  const button = $('shareBtn'); button.disabled = true;
  $('progBox').style.display = 'block'; $('progressText').textContent = 'Uploading…';
  try {
    const form = new FormData(); form.append('file', file); form.append('upload_preset', UPLOAD_PRESET);
    const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${file.type.startsWith('video/') ? 'video' : 'image'}/upload`;
    const response = await fetch(endpoint, { method: 'POST', body: form });
    if (!response.ok) throw new Error('Upload failed');
    const uploaded = await response.json();
    await push(ref(db, 'photos'), { mediaUrl: uploaded.secure_url, mediaType: file.type.startsWith('video/') ? 'video' : 'image', title: $('titleInput').value.trim(), userName: displayName(currentUser), uid: currentUser.uid, timestamp: Date.now(), likesCount: 0 });
    closeUpload(); showToast('Posted to the gallery');
  } catch (error) { console.error(error); showToast('Upload failed. Please try again.'); }
  finally { button.disabled = false; $('progBox').style.display = 'none'; }
}

function openUpload() { $('uploadModal').classList.add('open'); }
function closeUpload() { $('uploadModal').classList.remove('open'); $('fileInput').value = ''; $('titleInput').value = ''; $('previewThumb').replaceChildren(); $('previewThumb').style.display = 'none'; }
function timeAgo(timestamp) {
  const seconds = Math.max(0, Math.floor((Date.now() - (timestamp || Date.now())) / 1000));
  if (seconds < 60) return 'just now'; if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`; return `${Math.floor(seconds / 86400)}d`;
}
function escapeHtml(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }

Object.assign(window, { loadMore: () => renderGallery(), cancelSelect, downloadSelected, openFeed, closeFeed, openUpload, closeUpload, onFileChosen, uploadToCloudinary });
onAuthStateChanged(auth, (user) => {
  if (user) { currentUser = user; $('userNameDisplay').textContent = displayName(user); loadGallery(); }
  else signInAnonymously(auth).catch((error) => { console.error(error); showToast('Could not sign in to gallery'); loadGallery(); });
});
