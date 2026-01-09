// 影音播放控制 - 修正版
// 加大顯示框，改善錯誤處理

let videoList = [];

async function loadVideoList() {
  const select = document.getElementById('videoSelect');
  const player = document.getElementById('videoPlayer');
  const errorBox = document.getElementById('videoError');

  try {
    errorBox.textContent = '';
    
    // 載入影音清單
    const res = await fetch(`data/videos.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP 錯誤：${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('videos.json 格式錯誤：應為陣列');

    videoList = data;
    select.innerHTML = '<option value="">請選擇影音內容</option>';

    if (data.length === 0) {
      player.innerHTML = '<p style="color: #666; text-align: center;">目前沒有可用的影音內容</p>';
      errorBox.textContent = '⚠️ 目前沒有可用的影音內容（videos.json 為空）';
      return;
    }

    // 填入選項
    data.forEach((item, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = item.title || `影音項目 ${index + 1}`;
      select.appendChild(option);
    });

    // 顯示第一個項目（如果有）
    if (data.length > 0) {
      select.value = 0;
      showVideo();
    }
  } catch (err) {
    console.error('影片清單載入錯誤：', err);
    
    // 顯示友善的錯誤訊息
    player.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #666;">
        <div style="font-size: 3em; margin-bottom: 20px;">🎬</div>
        <h3>無法載入影音清單</h3>
        <p>請檢查網路連線或影音設定檔</p>
      </div>
    `;
    
    const msg = `
      ❌ 無法載入影片清單
      
      錯誤訊息：${err.message}
      
      請檢查：
      1) 是否使用 HTTP 伺服器開啟（不要用 file://）
      2) data/videos.json 路徑與檔名是否正確
      3) videos.json 是否為有效 JSON 陣列
      4) 快取是否清除（Ctrl/Cmd+Shift+R）
    `;
    
    errorBox.textContent = msg;
  }
}

function showVideo() {
  const select = document.getElementById('videoSelect');
  const index = parseInt(select.value);
  if (isNaN(index) || !videoList || !videoList[index]) {
    document.getElementById('videoPlayer').innerHTML = '<p style="color: #666; text-align: center;">請選擇影音內容</p>';
    return;
  }

  const item = videoList[index];
  let html = '';
  const player = document.getElementById('videoPlayer');
  const errorBox = document.getElementById('videoError');

  // 清除錯誤訊息
  errorBox.textContent = '';

  try {
    if (item.type === 'youtube') {
      // YouTube 影片 - 加大顯示框
      html = `
        <div style="width: 100%; max-width: 800px; margin: 0 auto;">
          <iframe 
            width="100%" 
            height="450" 
            src="${item.url}?rel=0&modestbranding=1" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          </iframe>
          <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <strong>${item.title}</strong>
            <div style="margin-top: 5px; color: #666; font-size: 0.9em;">
              🎬 YouTube 影片
            </div>
          </div>
        </div>
      `;
    } else if (item.type === 'mp4') {
      // 本地 MP4 影片 - 加大顯示框
      html = `
        <div style="width: 100%; max-width: 800px; margin: 0 auto; text-align: center;">
          <video 
            controls 
            width="100%"
            height="450"
            style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <source src="${item.url}" type="video/mp4">
            您的瀏覽器不支援影片播放，建議使用 Chrome、Firefox 或 Edge。
          </video>
          <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <strong>${item.title}</strong>
            <div style="margin-top: 5px; color: #666; font-size: 0.9em;">
              🎥 本地影片檔案
            </div>
          </div>
        </div>
      `;
    } else if (item.type === 'audio') {
      // 本地音訊 - 加大顯示框
      html = `
        <div style="width: 100%; max-width: 600px; margin: 0 auto; text-align: center;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <div style="font-size: 3em; color: #3498db; margin-bottom: 20px;">🎵</div>
            <strong style="font-size: 1.2em;">${item.title}</strong>
          </div>
          <audio 
            controls 
            style="width: 100%;"
            preload="metadata">
            <source src="${item.url}" type="audio/mpeg">
            您的瀏覽器不支援音訊播放。
          </audio>
          <div style="margin-top: 15px; color: #666; font-size: 0.9em;">
            🔊 音訊檔案
          </div>
        </div>
      `;
    } else {
      throw new Error(`不支援的媒體類型：${item.type}`);
    }

    player.innerHTML = html;
    
  } catch (err) {
    console.error('顯示影片失敗：', err);
    player.innerHTML = `
      <div style="text-align: center; padding: 40px; background: #ffebee; border-radius: 8px;">
        <div style="font-size: 3em; color: #f44336; margin-bottom: 20px;">❌</div>
        <h3>無法播放影音內容</h3>
        <p style="color: #666;">${err.message}</p>
        <p style="margin-top: 10px; font-size: 0.9em;">檔案：${item.url}</p>
      </div>
    `;
    errorBox.textContent = `播放失敗：${err.message}`;
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('videoSelect')) {
    loadVideoList();
  }
});