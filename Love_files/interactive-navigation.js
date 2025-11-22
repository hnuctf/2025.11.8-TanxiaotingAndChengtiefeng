// 交互式导航系统 - 用户交互后开始音乐
class InteractiveLoveNavigation {
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
        this.userInteracted = false;
        this.musicStarted = false;

        this.init();
    }

    getCurrentPageIndex() {
        const fileName = window.location.pathname.split('/').pop();
        return this.pages.findIndex(page => page.file === fileName) || 0;
    }

    init() {
        console.log('初始化交互式导航系统...');
        this.createNavigation();
        this.createFloatingTooltip();
        this.initMusic();
        this.bindEvents();
        this.updateNavigation();
        this.createPetals();

        // 检查用户是否已经与页面交互过
        this.checkUserInteraction();

        // 显示欢迎提示
        setTimeout(() => {
            if (this.currentPage === 0 && !this.musicStarted) {
                this.showTooltip('💕 点击种子或任意位置开始我们的故事...（音乐将在第一次交互后播放）');
            } else if (this.musicPlaying) {
                this.showTooltip('欢迎回到峰峰和婷婷的恋爱档案馆 💕');
            } else {
                this.showTooltip('欢迎来到峰峰和婷婷的恋爱档案馆 💕');
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
                                 onclick="window.interactiveNavigation.goToPage(${index})">
                            </div>
                        `).join('')}
                    </div>

                    <button class="nav-btn prev-btn" ${this.currentPage === 0 ? 'disabled' : ''} onclick="window.interactiveNavigation.goToPage(${this.currentPage - 1})">
                        上一页
                    </button>

                    <div class="page-title">${this.pages[this.currentPage].title}</div>

                    <button class="nav-btn next-btn" ${this.currentPage === this.pages.length - 1 ? 'disabled' : ''} onclick="window.interactiveNavigation.goToPage(${this.currentPage + 1})">
                        下一页
                    </button>

                    <button class="music-toggle ${this.musicPlaying ? 'playing' : ''}" title="背景音乐" onclick="window.interactiveNavigation.toggleMusic()">
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

            // 设置事件监听器
            this.setupMusicEventListeners();

            // 尝试恢复之前的播放状态
            await this.restorePreviousMusicState();

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
            audio = new Audio('./Love_files/love1.mp3');
            audio.loop = true;
            audio.volume = 0.4; // 稍微降低音量
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
            this.musicStarted = true;

            const musicBtn = document.querySelector('.music-toggle');
            if (musicBtn) musicBtn.classList.add('playing');

            // 保存状态
            localStorage.setItem('musicPlaying', 'true');
            localStorage.setItem('musicEverStarted', 'true');
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
            console.log('音乐加载完成，等待用户交互...');
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

    async restorePreviousMusicState() {
        try {
            // 检查音乐是否已经启动过
            const musicEverStarted = localStorage.getItem('musicEverStarted') === 'true';

            if (musicEverStarted) {
                // 音乐已经启动过，恢复播放状态
                const wasPlaying = localStorage.getItem('musicPlaying') === 'true';
                const currentTime = parseFloat(localStorage.getItem('audioCurrentTime') || '0');
                const volume = parseFloat(sessionStorage.getItem('musicVolume') || '0.4');

                // 应用状态
                if (this.musicPlayer) {
                    this.musicPlayer.volume = volume;

                    // 设置播放位置
                    if (currentTime > 0 && currentTime < this.musicPlayer.duration) {
                        this.musicPlayer.currentTime = currentTime;
                    }

                    this.musicStarted = true;
                    this.musicPlaying = wasPlaying;

                    console.log(`恢复音乐状态: 启动过=true, 播放=${wasPlaying}, 时间=${currentTime}s, 音量=${volume}`);

                    // 如果之前在播放，尝试恢复播放
                    if (wasPlaying) {
                        setTimeout(() => {
                            this.startMusicWithUserInteraction();
                        }, 1000);
                    }
                }
            } else {
                console.log('音乐尚未启动，等待用户首次交互...');
                this.musicStarted = false;
                this.musicPlaying = false;
            }

            return musicEverStarted;
        } catch (error) {
            console.error('恢复音乐状态失败:', error);
            return false;
        }
    }

    checkUserInteraction() {
        // 检查是否已经有用户交互记录
        this.userInteracted = sessionStorage.getItem('userInteracted') === 'true';

        if (this.userInteracted) {
            console.log('检测到用户已有交互记录');
        }
    }

    startMusicWithUserInteraction() {
        // 在用户交互后启动音乐
        if (!this.musicStarted && this.musicPlayer && !this.musicPlayer.paused) {
            return; // 已经在播放
        }

        if (this.musicPlayer && this.userInteracted && !this.musicStarted) {
            this.musicPlayer.play().then(() => {
                console.log('音乐在用户交互后成功启动');
                this.showTooltip('🎵 背景音乐已为您开启');
            }).catch(error => {
                console.error('启动音乐失败:', error);
                this.showTooltip('音乐启动失败，请手动点击音乐按钮 😔');
            });
        }
    }

    setupUserInteractionListeners() {
        // 设置各种用户交互监听器
        const interactions = [
            'click', 'touchstart', 'keydown', 'mousedown', 'pointerdown'
        ];

        const handleInteraction = (e) => {
            if (!this.userInteracted) {
                this.userInteracted = true;
                sessionStorage.setItem('userInteracted', 'true');
                console.log('检测到用户首次交互:', e.type);

                // 如果是主页且音乐尚未启动，启动音乐
                if (this.currentPage === 0 && !this.musicStarted) {
                    setTimeout(() => {
                        this.startMusicOnFirstInteraction();
                    }, 500);
                }
            }
        };

        interactions.forEach(eventType => {
            document.addEventListener(eventType, handleInteraction, { once: false, passive: true });
        });

        // 特殊处理Canvas点击（主页的种子点击）
        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                if (!this.userInteracted) {
                    this.userInteracted = true;
                    sessionStorage.setItem('userInteracted', 'true');
                    console.log('检测到Canvas种子点击');
                    setTimeout(() => {
                        this.startMusicOnFirstInteraction();
                    }, 1000); // 延迟1秒，在动画开始后播放音乐
                }
            }, { once: true });
        }
    }

    startMusicOnFirstInteraction() {
        if (!this.musicStarted && this.musicPlayer) {
            console.log('首次用户交互，启动音乐...');

            // 标记音乐已启动
            this.musicStarted = true;
            localStorage.setItem('musicEverStarted', 'true');

            // 播放音乐
            this.musicPlayer.play().then(() => {
                console.log('首次交互后音乐播放成功');
                this.showTooltip('🎵 背景音乐已开启，享受我们的故事吧！');
            }).catch(error => {
                console.error('首次交互后音乐播放失败:', error);
                this.showTooltip('音乐启动失败，请手动点击音乐按钮 😔');
            });
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

    goToPage(index) {
        if (index < 0 || index >= this.pages.length || index === this.currentPage) {
            console.log('页面跳转被阻止:', { index, currentPage: this.currentPage });
            return;
        }

        console.log(`跳转到页面: ${this.pages[index].title} (索引: ${index})`);

        // 保存当前音乐状态
        this.saveMusicStateToSession();
        if (this.musicPlayer) {
            localStorage.setItem('audioCurrentTime', this.musicPlayer.currentTime.toString());
        }

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
                // 如果音乐还未启动过，这是第一次手动启动
                if (!this.musicStarted) {
                    this.musicStarted = true;
                    localStorage.setItem('musicEverStarted', 'true');
                }

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
        // 设置用户交互监听器
        this.setupUserInteractionListeners();

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
            if (!document.hidden && this.musicStarted && this.musicPlaying && this.musicPlayer && this.musicPlayer.paused) {
                // 页面重新可见时，如果音乐应该播放，尝试恢复
                setTimeout(() => {
                    this.musicPlayer.play().catch(e => {
                        console.log('页面可见时恢复播放失败:', e);
                    });
                }, 500);
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
            started: this.musicStarted,
            currentTime: this.musicPlayer ? this.musicPlayer.currentTime : 0,
            volume: this.musicPlayer ? this.musicPlayer.volume : 0.4,
            duration: this.musicPlayer ? this.musicPlayer.duration : 0,
            initialized: this.musicInitialized,
            userInteracted: this.userInteracted
        };
    }
}

// 页面加载完成后初始化
let interactiveNavigationInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化交互式导航系统...');

    // 防止重复初始化
    if (interactiveNavigationInstance) {
        interactiveNavigationInstance.createNavigation();
        return;
    }

    interactiveNavigationInstance = new InteractiveLoveNavigation();
    window.interactiveNavigation = interactiveNavigationInstance;

    // 全局错误处理
    window.addEventListener('error', (event) => {
        console.error('全局错误:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('未处理的Promise拒绝:', event.reason);
    });
});

// 导出给全局使用
window.InteractiveLoveNavigation = InteractiveLoveNavigation;