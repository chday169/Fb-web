// ✅ 工具函式
function getData(key, defaultValue) {
  return JSON.parse(localStorage.getItem(key) || JSON.stringify(defaultValue));
}
function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

// ✅ 統計功能
function initStats() {
  if (!localStorage.getItem('totalVisits')) {
    localStorage.setItem('totalVisits', 0);
  }
  if (!localStorage.getItem('articleViews')) {
    setData('articleViews', { 'v1a_home': 0, 'about_me': 0, 'comments': 0 });
  }
  if (!localStorage.getItem('likes')) {
    setData('likes', { 'v1a_home': 0, 'about_me': 0, 'comments': 0 });
  }
}

function updateStats() {
  const visits = parseInt(localStorage.getItem('totalVisits')) || 0;
  const visitEl = document.getElementById('totalVisits');
  if (visitEl) visitEl.innerText = visits;

  const views = getData('articleViews', {});
  const likes = getData('likes', {});

  for (let key in views) {
    const viewEl = document.getElementById(`views_${key}`);
    const likeEl = document.getElementById(`likes_${key}`);
    if (viewEl) viewEl.innerText = views[key];
    if (likeEl) likeEl.innerText = likes[key];
  }
}

function simulateView(article) {
  const views = getData('articleViews', {});
  views[article]++;
  setData('articleViews', views);
  updateStats();
}

function simulateLike(article) {
  const likes = getData('likes', {});
  likes[article]++;
  setData('likes', likes);
  updateStats();
}

// ✅ 留言板功能
function loadComments() {
  const comments = getData('comments', []);
  const list = document.getElementById('commentsList');
  if (!list) return;
  list.innerHTML = '';
  comments.forEach(comment => {
    const div = document.createElement('div');
    div.className = 'comment-box';
    div.innerHTML = `<strong>${escapeHTML(comment.name)}</strong> 說：<br>${escapeHTML(comment.message)}`;
    list.appendChild(div);
  });
}

function handleCommentSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const message = document.getElementById('message').value.trim();
  if (name && message) {
    const comments = getData('comments', []);
    comments.push({ name, message });
    setData('comments', comments);
    document.getElementById('commentForm').reset();
    loadComments();
  }
}

// ✅ 搜尋功能
function loadKeywords() {
  const keywords = getData('searchKeywords', []);
  const list = document.getElementById('keywordList');
  if (!list) return;
  list.innerHTML = '';
  keywords.slice(-10).reverse().forEach(keyword => {
    const span = document.createElement('span');
    span.className = 'keyword-tag';
    span.textContent = keyword;
    list.appendChild(span);
  });
}

function showResults(keyword) {
  const results = document.getElementById('searchResults');
  if (results) {
    results.innerHTML = `
      <p>您搜尋的是：<strong>${escapeHTML(keyword)}</strong></p>
      <p>（這裡可顯示相關文章或連結，暫為示範）</p>
    `;
  }
}

function handleSearchSubmit(e) {
  e.preventDefault();
  const keyword = document.getElementById('searchInput').value.trim();
  if (keyword) {
    let keywords = getData('searchKeywords', []);
    keywords.push(keyword);
    setData('searchKeywords', keywords);
    document.getElementById('searchInput').value = '';
    loadKeywords();
    showResults(keyword);
  }
}

// ✅ 自動判斷頁面並執行對應功能
window.onload = function() {
  const path = window.location.pathname;

  if (path.includes('stats.html')) {
    initStats();
    // 訪問數只在 stats.html 載入時增加一次
    let visits = parseInt(localStorage.getItem('totalVisits')) + 1;
    localStorage.setItem('totalVisits', visits);
    updateStats();
  }

  if (path.includes('comments.html')) {
    loadComments();
    const form = document.getElementById('commentForm');
    if (form) form.addEventListener('submit', handleCommentSubmit);
  }

  if (path.includes('search.html')) {
    loadKeywords();
    const form = document.getElementById('searchForm');
    if (form) form.addEventListener('submit', handleSearchSubmit);
  }
};
