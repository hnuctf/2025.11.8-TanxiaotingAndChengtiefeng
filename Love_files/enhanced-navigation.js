// 增强版导航系统 - 优化音乐管理
class EnhancedLoveNavigation {
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
        this.musicInitialized = false;

        this.init();
    }

    getCurrentPageIndex() {
        const fileName = window.location.pathname.split('/').pop();
        return this.pages.findIndex(page => page.file === fileName) || 0;
    }

    init() {
        console.log('初始化增强版导航系统...');
        this.createNavigation();
        this.createFloatingTooltip();
        this.initMusic();
        this.bindEvents();
        this.updateNavigation();
        this.createPetals();

        // 显示欢迎提示
        setTimeout(() => {
            this.showTooltip('欢迎来到峰峰和婷婷的恋爱档案馆 💕');
            // 首次访问时提示音乐状态
            if (this.musicPlaying) {
                setTimeout(() => {
                    this.showTooltip('背景音乐已自动开启 🎵');
                }, 2000);
            }
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
                                 onclick="window.enhancedNavigation.goToPage(${index})">
                            </div>
                        `).join('')}
                    </div>

                    <button class="nav-btn prev-btn" ${this.currentPage === 0 ? 'disabled' : ''} onclick="window.enhancedNavigation.goToPage(${this.currentPage - 1})">
                        上一页
                    </button>

                    <div class="page-title">${this.pages[this.currentPage].title}</div>

                    <button class="nav-btn next-btn" ${this.currentPage === this.pages.length - 1 ? 'disabled' : ''} onclick="window.enhancedNavigation.goToPage(${this.currentPage + 1})">
                        下一页
                    </button>

                    <button class="music-toggle ${this.musicPlaying ? 'playing' : ''}" title="背景音乐" onclick="window.enhancedNavigation.toggleMusic()">
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

    async initMusic() {
        try {
            // 创建或获取全局音乐播放器
            this.musicPlayer = await this.getOrCreateMusicPlayer();
            this.musicInitialized = true;

            // 恢复音乐状态
            await this.restoreMusicState();

            // 自动播放音乐（特别是主页）
            if (this.currentPage === 0) {
                await this.autoPlayMusic();
            }

            // 设置事件监听器
            this.setupMusicEventListeners();

        } catch (error) {
            console.error('音乐初始化失败:', error);
            this.showTooltip('音乐初始化失败，请手动播放 😔');
        }
    }

    async getOrCreateMusicPlayer() {
        // 首先尝试获取已存在的音乐播放器
        let audio = document.getElementById('global-background-music');

        if (!audio) {
            // 创建新的音乐播放器
            audio = new Audio('./Love_files/love.mp3');
            audio.loop = true;
            audio.volume = 0.5;
            audio.id = 'global-background-music';
            audio.preload = 'auto';

            // 添加到页面
            document.body.appendChild(audio);

            // 预加载音频
            await audio.load();

            console.log('创建新的全局音乐播放器');
        } else {
            console.log('使用现有的全局音乐播放器');
        }

        return audio;
    }

    setupMusicEventListeners() {
        if (!this.musicPlayer) return;

        // 播放事件
        this.musicPlayer.addEventListener('play', () => {
            this.musicPlaying = true;
            const musicBtn = document.querySelector('.music-toggle');
            if (musicBtn) musicBtn.classList.add('playing');

            // 保存状态
            localStorage.setItem('musicPlaying', 'true');
            this.saveMusicStateToSession();

            console.log('音乐开始播放');
        });

        // 暂停事件
        this.musicPlayer.addEventListener('pause', () => {
            this.musicPlaying = false;
            const musicBtn = document.querySelector('.music-toggle');
            if (musicBtn) musicBtn.classList.remove('playing');

            // 保存状态
            localStorage.setItem('musicPlaying', 'false');
            this.saveMusicStateToSession();

            console.log('音乐已暂停');
        });

        // 时间更新事件
        this.musicPlayer.addEventListener('timeupdate', () => {
            this.saveMusicStateToSession();
        });

        // 加载完成事件
        this.musicPlayer.addEventListener('loadeddata', () => {
            console.log('音乐加载完成');
        });

        // 错误事件
        this.musicPlayer.addEventListener('error', (e) => {
            console.error('音乐播放错误:', e);
            this.showTooltip('音乐文件加载失败 😔');
        });

        // 缓冲事件
        this.musicPlayer.addEventListener('canplaythrough', () => {
            console.log('音乐缓冲完成，可以播放');
        });
    }

    async restoreMusicState() {
        try {
            // 优先从sessionStorage恢复（页面间临时状态）
            let wasPlaying = sessionStorage.getItem('musicPlaying') === 'true';
            let currentTime = parseFloat(sessionStorage.getItem('musicTime') || '0');
            let volume = parseFloat(sessionStorage.getItem('musicVolume') || '0.5');

            // 如果sessionStorage中没有，从localStorage恢复（持久状态）
            if (currentTime === 0) {
                const storedTime = localStorage.getItem('audioCurrentTime');
                if (storedTime) {
                    currentTime = parseFloat(storedTime);
                }
            }

            if (sessionStorage.getItem('musicPlaying') === null) {
                wasPlaying = localStorage.getItem('musicPlaying') === 'true';
            }

            // 应用状态
            if (this.musicPlayer) {
                this.musicPlayer.volume = volume;

                // 设置播放位置
                if (currentTime > 0 && currentTime < this.musicPlayer.duration) {
                    this.musicPlayer.currentTime = currentTime;
                }

                this.musicPlaying = wasPlaying;

                console.log(`恢复音乐状态: 播放=${wasPlaying}, 时间=${currentTime}s, 音量=${volume}`);
            }

            return wasPlaying;
        } catch (error) {
            console.error('恢复音乐状态失败:', error);
            return false;
        }
    }

    saveMusicStateToSession() {
        try {
            if (this.musicPlayer) {
                sessionStorage.setItem('musicTime', this.musicPlayer.currentTime.toString());
                sessionStorage.setItem('musicPlaying', this.musicPlaying.toString());
                sessionStorage.setItem('musicVolume', this.musicPlayer.volume.toString());
            }
        } catch (error) {
            console.error('保存音乐状态到session失败:', error);
        }
    }

    async autoPlayMusic() {
        try {
            // 检查是否已经播放过
            const hasPlayedBefore = localStorage.getItem('musicEverPlayed') === 'true';

            if (!hasPlayedBefore) {
                // 首次访问，标记为已播放
                localStorage.setItem('musicEverPlayed', 'true');

                // 尝试自动播放
                const playPromise = this.musicPlayer.play();

                if (playPromise !== undefined) {
                    try {
                        await playPromise;
                        console.log('音乐自动播放成功');
                        this.showTooltip('背景音乐已为您开启 🎵');
                    } catch (error) {
                        console.log('自动播放被阻止，需要用户交互');
                        this.showTooltip('请点击页面任意位置开启音乐 🎵');

                        // 添加全局点击事件来启动音乐
                        const startMusicOnce = () => {
                            this.musicPlayer.play().then(() => {
                                this.showTooltip('背景音乐已开启 🎵');
                                document.removeEventListener('click', startMusicOnce);
                                document.removeEventListener('touchstart', startMusicOnce);
                            }).catch(e => {
                                console.error('音乐播放失败:', e);
                            });
                        };

                        document.addEventListener('click', startMusicOnce, { once: true });
                        document.addEventListener('touchstart', startMusicOnce, { once: true });
                    }
                }
            } else {
                // 不是首次访问，根据保存的状态播放
                const wasPlaying = await this.restoreMusicState();
                if (wasPlaying) {
                    this.musicPlayer.play().catch(e => {
                        console.log('恢复播放失败:', e);
                    });
                }
            }
        } catch (error) {
            console.error('自动播放音乐失败:', error);
        }
    }

    goToPage(index) {
        if (index < 0 || index >= this.pages.length || index === this.currentPage) {
            console.log('页面跳转被阻止:', { index, currentPage: this.currentPage });
            return;
        }

        console.log(`跳转到页面: ${this.pages[index].title} (索引: ${index})`);

        // 保存当前音乐状态
        this.saveMusicStateToSession();

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
        const musicBtn = document.querySelector('.music-toggle');

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

        // 更新音乐按钮状态
        if (musicBtn) {
            if (this.musicPlaying) {
                musicBtn.classList.add('playing');
            } else {
                musicBtn.classList.remove('playing');
            }
        }
    }

    toggleMusic() {
        if (!this.musicPlayer || !this.musicInitialized) {
            this.showTooltip('音乐正在加载中，请稍候... 😊');
            return;
        }

        try {
            if (this.musicPlaying) {
                this.musicPlayer.pause();
                this.showTooltip('音乐已暂停 🎵');
            } else {
                const playPromise = this.musicPlayer.play();

                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        this.showTooltip('音乐已播放 🎵');
                    }).catch(error => {
                        console.error('音乐播放失败:', error);
                        this.showTooltip('音乐播放失败，请重试 😔');
                    });
                }
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

        // 页面卸载时保存状态
        window.addEventListener('beforeunload', () => {
            this.saveMusicStateToSession();
            if (this.musicPlayer) {
                localStorage.setItem('audioCurrentTime', this.musicPlayer.currentTime.toString());
            }
        });

        // 页面可见性变化时处理音乐
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面隐藏时暂停音乐（可选）
                // if (this.musicPlaying && this.musicPlayer) {
                //     this.musicPlayer.pause();
                // }
            } else {
                // 页面显示时恢复音乐
                if (this.musicPlaying && this.musicPlayer && this.musicPlayer.paused) {
                    this.musicPlayer.play().catch(e => {
                        console.log('恢复播放失败:', e);
                    });
                }
            }
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

    // 获取音乐状态
    getMusicState() {
        return {
            playing: this.musicPlaying,
            currentTime: this.musicPlayer ? this.musicPlayer.currentTime : 0,
            volume: this.musicPlayer ? this.musicPlayer.volume : 0.5,
            duration: this.musicPlayer ? this.musicPlayer.duration : 0,
            initialized: this.musicInitialized
        };
    }
}

// 页面加载完成后初始化
let enhancedNavigationInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化增强版导航系统...');

    // 防止重复初始化
    if (enhancedNavigationInstance) {
        enhancedNavigationInstance.createNavigation();
        return;
    }

    enhancedNavigationInstance = new EnhancedLoveNavigation();
    window.enhancedNavigation = enhancedNavigationInstance;

    // 全局错误处理
    window.addEventListener('error', (event) => {
        console.error('全局错误:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('未处理的Promise拒绝:', event.reason);
    });
});

// 导出给全局使用
window.EnhancedLoveNavigation = EnhancedLoveNavigation;