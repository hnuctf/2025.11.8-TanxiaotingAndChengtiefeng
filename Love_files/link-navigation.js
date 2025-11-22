// 链接导航系统 - 解决跨域问题
class LinkLoveNavigation {
    constructor() {
        this.pages = [
            { id: 'index', title: '爱的序章', file: 'index.html' },
            { id: 'page2', title: '甜蜜报告', file: 'page2.html' },
            { id: 'page3', title: '聊天解析', file: 'page3.html' },
            { id: 'page4', title: '回忆相册', file: 'page4.html' },
            { id: 'page5', title: '爱情时间线', file: 'page5.html' },
            { id: 'page6', title: '永恒誓言', file: 'page6.html' }
        ];

        this.currentPage = this.getCurrentPageIndex();
        this.musicPlayer = null;
        this.musicPlaying = false;

        this.init();
    }

    getCurrentPageIndex() {
        const fileName = window.location.pathname.split('/').pop();
        return this.pages.findIndex(page => page.file === fileName) || 0;
    }

    init() {
        console.log('初始化链接导航系统...');
        this.createNavigation();
        this.createFloatingTooltip();
        this.initMusic();
        this.bindEvents();
        this.updateNavigation();
        this.createPetals();

        setTimeout(() => {
            this.showTooltip('欢迎来到峰峰和婷婷的恋爱档案馆 💕');
        }, 1000);
    }

    createNavigation() {
        // 移除旧的导航
        const oldNav = document.querySelector('.navigation');
        if (oldNav) {
            oldNav.remove();
        }

        const navHTML = `
            <nav class="navigation">
                <div class="nav-container">
                    <div class="page-progress">
                        ${this.pages.map((page, index) => `
                            <div class="progress-dot ${index === this.currentPage ? 'active' : ''} ${index < this.currentPage ? 'completed' : ''}"
                                 data-page="${page.title}"
                                 data-index="${index}"
                                 title="${page.title}"
                                 onclick="window.linkNavigation.goToPage(${index})">
                            </div>
                        `).join('')}
                    </div>

                    <button class="nav-btn prev-btn" ${this.currentPage === 0 ? 'disabled' : ''} onclick="window.linkNavigation.goToPage(${this.currentPage - 1})">
                        上一页
                    </button>

                    <div class="page-title">${this.pages[this.currentPage].title}</div>

                    <button class="nav-btn next-btn" ${this.currentPage === this.pages.length - 1 ? 'disabled' : ''} onclick="window.linkNavigation.goToPage(${this.currentPage + 1})">
                        下一页
                    </button>

                    <button class="music-toggle" title="背景音乐" onclick="window.linkNavigation.toggleMusic()">
                        🎵
                    </button>
                </div>
            </nav>
        `;

        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    createFloatingTooltip() {
        const oldTooltip = document.querySelector('.floating-tooltip');
        if (oldTooltip) {
            oldTooltip.remove();
        }

        const tooltipHTML = `
            <div class="floating-tooltip"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', tooltipHTML);
    }

    initMusic() {
        try {
            // 检查是否已有音乐播放器
            const existingAudio = document.getElementById('background-music');
            if (existingAudio) {
                this.musicPlayer = existingAudio;
            } else {
                // 创建全局音乐播放器
                this.musicPlayer = new Audio('./Love_files/love.mp3');
                this.musicPlayer.loop = true;
                this.musicPlayer.volume = 0.5;
                this.musicPlayer.id = 'background-music';

                // 添加到页面
                document.body.appendChild(this.musicPlayer);
            }

            // 恢复播放状态
            const wasPlaying = localStorage.getItem('musicPlaying') === 'true';
            const currentTime = localStorage.getItem('audioCurrentTime');

            if (currentTime) {
                this.musicPlayer.currentTime = parseFloat(currentTime);
            }

            // 监听音频事件
            this.musicPlayer.addEventListener('play', () => {
                this.musicPlaying = true;
                const musicBtn = document.querySelector('.music-toggle');
                if (musicBtn) musicBtn.classList.add('playing');
                localStorage.setItem('musicPlaying', 'true');
            });

            this.musicPlayer.addEventListener('pause', () => {
                this.musicPlaying = false;
                const musicBtn = document.querySelector('.music-toggle');
                if (musicBtn) musicBtn.classList.remove('playing');
                localStorage.setItem('musicPlaying', 'false');
            });

            this.musicPlayer.addEventListener('timeupdate', () => {
                localStorage.setItem('audioCurrentTime', this.musicPlayer.currentTime);
            });

            // 保存音乐状态到全局变量，供新页面使用
            this.saveMusicState();

            // 延迟播放
            setTimeout(() => {
                if (wasPlaying) {
                    this.musicPlayer.play().catch(e => {
                        console.log('音频播放失败:', e);
                        this.showTooltip('点击页面任意位置播放音乐 🎵');
                    });
                }
            }, 1000);

        } catch (error) {
            console.error('音乐初始化失败:', error);
        }
    }

    saveMusicState() {
        // 保存音乐状态到sessionStorage，供新页面使用
        try {
            sessionStorage.setItem('musicTime', this.musicPlayer.currentTime);
            sessionStorage.setItem('musicPlaying', this.musicPlaying);
            sessionStorage.setItem('musicVolume', this.musicPlayer.volume);
        } catch (error) {
            console.error('保存音乐状态失败:', error);
        }
    }

    restoreMusicState() {
        // 从sessionStorage恢复音乐状态
        try {
            const musicTime = sessionStorage.getItem('musicTime');
            const musicPlaying = sessionStorage.getItem('musicPlaying');
            const musicVolume = sessionStorage.getItem('musicVolume');

            if (this.musicPlayer && musicTime !== null) {
                this.musicPlayer.currentTime = parseFloat(musicTime);
            }

            if (musicVolume !== null) {
                this.musicPlayer.volume = parseFloat(musicVolume);
            }

            return musicPlaying === 'true';
        } catch (error) {
            console.error('恢复音乐状态失败:', error);
            return false;
        }
    }

    goToPage(index) {
        if (index < 0 || index >= this.pages.length || index === this.currentPage) {
            console.log('页面跳转被阻止:', { index, currentPage: this.currentPage });
            return;
        }

        console.log(`跳转到页面: ${this.pages[index].title} (索引: ${index})`);

        // 保存当前音乐状态
        this.saveMusicState();

        // 显示提示信息
        const direction = index > this.currentPage ? '继续探索' : '回味美好';
        this.showTooltip(`${direction}：${this.pages[index].title}`);

        // 延迟跳转，让提示显示
        setTimeout(() => {
            window.location.href = this.pages[index].file;
        }, 500);
    }

    updateNavigation() {
        const dots = document.querySelectorAll('.progress-dot');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const titleElement = document.querySelector('.page-title');

        // 更新进度点
        dots.forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === this.currentPage) {
                dot.classList.add('active');
            }
        });

        // 更新按钮状态
        if (prevBtn) prevBtn.disabled = this.currentPage === 0;
        if (nextBtn) nextBtn.disabled = this.currentPage === this.pages.length - 1;

        // 更新页面标题
        if (titleElement) {
            titleElement.textContent = this.pages[this.currentPage].title;
        }
    }

    toggleMusic() {
        if (!this.musicPlayer) return;

        try {
            if (this.musicPlaying) {
                this.musicPlayer.pause();
                this.showTooltip('音乐已暂停 🎵');
            } else {
                this.musicPlayer.play().then(() => {
                    this.showTooltip('音乐已播放 🎵');
                }).catch(e => {
                    this.showTooltip('音乐播放失败 😔 请点击页面任意位置开始播放');
                    // 添加一次性点击事件来启动音乐
                    document.addEventListener('click', function startMusic() {
                        this.musicPlayer.play();
                        document.removeEventListener('click', startMusic);
                    }.bind(this), { once: true });
                });
            }
        } catch (error) {
            console.error('音乐切换失败:', error);
            this.showTooltip('音乐控制失败 😔');
        }
    }

    showTooltip(message) {
        const tooltip = document.querySelector('.floating-tooltip');
        if (!tooltip) return;

        tooltip.textContent = message;
        tooltip.classList.add('show');

        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 3000);
    }

    createPetals() {
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.createPetal();
            }
        }, 3000);
    }

    createPetal() {
        const petal = document.createElement('div');
        petal.className = 'petal';

        const size = Math.random() * 15 + 10;
        petal.style.width = size + 'px';
        petal.style.height = size + 'px';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDuration = (Math.random() * 5 + 10) + 's';
        petal.style.animationDelay = Math.random() * 2 + 's';

        document.body.appendChild(petal);

        setTimeout(() => {
            petal.remove();
        }, 15000);
    }

    bindEvents() {
        // 键盘导航
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    if (this.currentPage > 0) {
                        this.goToPage(this.currentPage - 1);
                    }
                    break;
                case 'ArrowRight':
                    if (this.currentPage < this.pages.length - 1) {
                        this.goToPage(this.currentPage + 1);
                    }
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleMusic();
                    break;
            }
        });

        // 触摸手势支持
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && this.currentPage < this.pages.length - 1) {
                this.goToPage(this.currentPage + 1);
            } else if (diff < 0 && this.currentPage > 0) {
                this.goToPage(this.currentPage - 1);
            }
        }
    }

    // 公共方法
    showSpecialMessage(message, duration = 5000) {
        this.showTooltip(message);

        const nav = document.querySelector('.navigation');
        if (nav) {
            nav.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                nav.style.animation = '';
            }, 500);
        }
    }
}

// 页面加载完成后初始化
let linkNavigationInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化链接导航系统...');

    // 防止重复初始化
    if (linkNavigationInstance) {
        linkNavigationInstance.createNavigation();
        return;
    }

    linkNavigationInstance = new LinkLoveNavigation();
    window.linkNavigation = linkNavigationInstance;

    // 尝试恢复音乐播放
    setTimeout(() => {
        if (linkNavigationInstance.musicPlayer) {
            const wasPlaying = linkNavigationInstance.restoreMusicState();
            if (wasPlaying) {
                linkNavigationInstance.musicPlayer.play().catch(e => {
                    console.log('恢复音乐播放失败:', e);
                });
            }
        }
    }, 500);
});

// 导出给全局使用
window.LinkLoveNavigation = LinkLoveNavigation;