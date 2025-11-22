let audio = new Audio('./Love_files/love1.mp3'); // 替换为你的背景音乐文件路径
audio.loop = true; // 循环播放
audio.volume = 0.5; // 设置音量（可以根据需求调整）

// 判断音频是否正在播放
if(localStorage.getItem('musicPlaying') === 'true') {
    // 恢复音频播放
    let currentTime = localStorage.getItem('audioCurrentTime');
    if (currentTime) {
        audio.currentTime = parseFloat(currentTime); // 恢复到上次的播放时间
    }
    audio.play();
} else {
    audio.pause(); // 停止音频播放
}

// 页面卸载时保存播放状态和进度
window.onbeforeunload = function() {
    localStorage.setItem('musicPlaying', 'true'); // 标记音乐正在播放
    localStorage.setItem('audioCurrentTime', audio.currentTime); // 保存当前播放时间
};

// 页面加载时恢复音频状态
window.onload = function() {
    if (localStorage.getItem('musicPlaying') === 'true') {
        audio.play();
    }
};