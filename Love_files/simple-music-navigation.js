// 简化音乐导航系统 - 专注于音乐播放功能
class SimpleMusicNavigation {
    constructor() {
        this.pages = [
            { id: 'index', title: '爱的序章', file: 'index.html' },
            { id: 'page2', title: '甜蜜报告', file: 'page2.html' },
            { id: 'page3', title: '聊天解析', file: 'page3.html' },
            { id: 'page4', title: '回忆相册', file: 'page4.html' },
            { id: 'page5', title: '爱情时间线', file: 'page5.html' },
            { id: 'page6', title: '永恒誓言', file: 'page6.html' },
            { id: 'page7', title: '永恒周年', file: 'page7.html' }
        ];

        this.currentPage = this.getCurrentPageIndex();
        this.musicPlayer = null;
        this.musicPlaying = false;
        this.userInteracted = false;

        this.init();
    }

    getCurrentPageIndex() {
        const fileName = window.location.pathname.split('/').pop();
        return this.pages.findIndex(page => page.file === fileName) || 0;
    }

    init() {
        console.log('初始化简化音乐导航系统...');
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
            if (this.currentPage === 0 && !this.musicPlaying) {
                this.showTooltip('💕 点击种子或任意位置开始我们的故事...（点击后音乐开始播放）');
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
                                 onclick="window.simpleMusicNavigation.goToPage(${index})">
                            </div>
                        `).join('')}
                    </div>

                    <button class="nav-btn prev-btn" ${this.currentPage === 0 ? 'disabled' : ''} onclick="window.simpleMusicNavigation.goToPage(${this.currentPage - 1})">
                        上一页
                    </button>

                    <div class="page-title">${this.pages[this.currentPage].title}</div>

                    <button class="nav-btn next-btn" ${this.currentPage === this.pages.length - 1 ? 'disabled' : ''} onclick="window.simpleMusicNavigation.goToPage(${this.currentPage + 1})">
                        下一页
                    </button>

                    <button class="music-toggle ${this.musicPlaying ? 'playing' : ''}" title="背景音乐" onclick="window.simpleMusicNavigation.toggleMusic()">
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
            console.log('初始化音乐播放器...');

            // 首先检查是否已存在全局音乐播放器
            let existingPlayer = document.getElementById('simple-background-music');

            if (existingPlayer) {
                // 使用现有的音乐播放器，确保连续播放
                this.musicPlayer = existingPlayer;
                console.log('使用现有音乐播放器，确保连续播放');
            } else {
                // 创建新的全局音乐播放器
                this.musicPlayer = new Audio('Love_files/love1.mp3');
                this.musicPlayer.loop = true;
                this.musicPlayer.volume = 0.4;
                this.musicPlayer.id = 'simple-background-music';
                this.musicPlayer.preload = 'auto';

                // 添加到页面
                document.body.appendChild(this.musicPlayer);
                console.log('创建新的音乐播放器');
            }

            // 设置事件监听器
            this.setupMusicEventListeners();

            // 恢复播放状态和进度
            this.restoreMusicState();

            console.log('音乐播放器初始化完成');

        } catch (error) {
            console.error('音乐初始化失败:', error);
            this.showTooltip('音乐初始化失败，请手动播放 😔');
        }
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
            localStorage.setItem('musicEverStarted', 'true');
            sessionStorage.setItem('musicPlaying', 'true');

            console.log('音乐开始播放');
        });

        // 暂停事件
        this.musicPlayer.addEventListener('pause', () => {
            this.musicPlaying = false;
            const musicBtn = document.querySelector('.music-toggle');
            if (musicBtn) musicBtn.classList.remove('playing');

            // 保存状态
            localStorage.setItem('musicPlaying', 'false');
            sessionStorage.setItem('musicPlaying', 'false');

            console.log('音乐已暂停');
        });

        // 时间更新事件
        this.musicPlayer.addEventListener('timeupdate', () => {
            sessionStorage.setItem('musicTime', this.musicPlayer.currentTime.toString());
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

        // 可以播放事件
        this.musicPlayer.addEventListener('canplay', () => {
            console.log('音乐可以播放');
        });
    }

    restoreMusicState() {
        try {
            console.log('开始恢复音乐状态...');

            // 检查音乐是否已经启动过
            const musicEverStarted = localStorage.getItem('musicEverStarted') === 'true';

            if (musicEverStarted && this.musicPlayer) {
                // 音乐已经启动过，恢复播放状态
                const wasPlaying = localStorage.getItem('musicPlaying') === 'true';

                // 优先从sessionStorage获取最新的播放时间
                let currentTime = parseFloat(sessionStorage.getItem('musicTime') || '0');

                // 如果sessionStorage中没有，从localStorage获取
                if (currentTime === 0) {
                    currentTime = parseFloat(localStorage.getItem('audioCurrentTime') || '0');
                }

                console.log(`恢复音乐状态: 启动过=true, 播放=${wasPlaying}, 时间=${currentTime}s`);

                // 等待音频元数据加载完成
                if (this.musicPlayer.readyState >= 1) {
                    this.applyMusicState(wasPlaying, currentTime);
                } else {
                    // 音频尚未加载完成，等待加载
                    this.musicPlayer.addEventListener('loadedmetadata', () => {
                        this.applyMusicState(wasPlaying, currentTime);
                    }, { once: true });
                }

            } else {
                console.log('音乐尚未启动，等待用户首次交互...');
                this.musicPlaying = false;
            }

        } catch (error) {
            console.error('恢复音乐状态失败:', error);
        }
    }

    applyMusicState(wasPlaying, currentTime) {
        try {
            if (!this.musicPlayer) return;

            // 设置播放位置，确保在有效范围内
            if (currentTime > 0 && currentTime < this.musicPlayer.duration) {
                this.musicPlayer.currentTime = currentTime;
                console.log(`设置播放位置: ${currentTime}s / ${this.musicPlayer.duration}s`);
            }

            // 更新播放状态
            this.musicPlaying = wasPlaying;

            // 如果之前在播放，尝试恢复播放
            if (wasPlaying && this.musicPlayer.paused) {
                console.log('尝试恢复音乐播放...');
                setTimeout(() => {
                    this.attemptResumePlay();
                }, 500);
            }

            // 更新音乐按钮状态
            const musicBtn = document.querySelector('.music-toggle');
            if (musicBtn) {
                if (this.musicPlaying) {
                    musicBtn.classList.add('playing');
                } else {
                    musicBtn.classList.remove('playing');
                }
            }

        } catch (error) {
            console.error('应用音乐状态失败:', error);
        }
    }

    attemptResumePlay() {
        if (this.musicPlayer && !this.musicPlayer.paused) {
            return; // 已经在播放
        }

        if (this.musicPlayer) {
            this.musicPlayer.play().then(() => {
                console.log('音乐恢复播放成功');
            }).catch(error => {
                console.log('恢复播放失败，需要用户交互:', error);
            });
        }
    }

    checkUserInteraction() {
        // 检查是否已经有用户交互记录
        this.userInteracted = sessionStorage.getItem('userInteracted') === 'true';

        if (this.userInteracted) {
            console.log('检测到用户已有交互记录');
        }
    }

    startMusicOnInteraction() {
        if (this.musicPlayer && !this.musicPlaying) {
            console.log('用户交互，启动音乐...');

            // 播放音乐
            this.musicPlayer.play().then(() => {
                console.log('交互后音乐播放成功');
                this.showTooltip('🎵 背景音乐已开启，享受我们的故事吧！');

                // 标记音乐已启动
                localStorage.setItem('musicEverStarted', 'true');
                localStorage.setItem('musicPlaying', 'true');
                sessionStorage.setItem('musicPlaying', 'true');

            }).catch(error => {
                console.error('交互后音乐播放失败:', error);
                this.showTooltip('音乐启动失败，请手动点击音乐按钮 😔');
            });
        }
    }

    goToPage(index) {
        if (index < 0 || index >= this.pages.length || index === this.currentPage) {
            console.log('页面跳转被阻止:', { index, currentPage: this.currentPage });
            return;
        }

        console.log(`跳转到页面: ${this.pages[index].title} (索引: ${index})`);

        // 立即保存当前音乐状态和进度
        this.saveMusicStateForNavigation();

        // 显示提示信息
        const direction = index > this.currentPage ? '继续探索' : '回味美好';
        this.showTooltip(`${direction}：${this.pages[index].title}`);

        // 延迟跳转，让状态保存完成
        setTimeout(() => {
            console.log('执行页面跳转...');
            window.location.href = this.pages[index].file;
        }, 300);
    }

    saveMusicStateForNavigation() {
        try {
            if (this.musicPlayer) {
                // 保存播放状态
                const isPlaying = !this.musicPlayer.paused;
                localStorage.setItem('musicPlaying', isPlaying.toString());
                sessionStorage.setItem('musicPlaying', isPlaying.toString());

                // 保存播放进度（使用多个存储位置确保可靠性）
                const currentTime = this.musicPlayer.currentTime;
                localStorage.setItem('audioCurrentTime', currentTime.toString());
                sessionStorage.setItem('musicTime', currentTime.toString());

                // 保存音量设置
                localStorage.setItem('musicVolume', this.musicPlayer.volume.toString());
                sessionStorage.setItem('musicVolume', this.musicPlayer.volume.toString());

                // 标记音乐已启动（如果已经开始播放）
                if (isPlaying || this.musicPlayer.currentTime > 0) {
                    localStorage.setItem('musicEverStarted', 'true');
                }

                console.log(`音乐状态已保存: 播放=${isPlaying}, 时间=${currentTime.toFixed(2)}s`);
            }
        } catch (error) {
            console.error('保存音乐状态失败:', error);
        }
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
        if (!this.musicPlayer) {
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
                        localStorage.setItem('musicEverStarted', 'true');
                    }).catch(error => {
                        console.error('音乐播放失败:', error);
                        this.showTooltip('音乐播放失败，请重试 😔');

                        // 如果播放失败，提示用户
                        if (error.name === 'NotAllowedError') {
                            this.showTooltip('请先点击页面任意位置，然后再次点击音乐按钮 😊');
                        }
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
        // 用户交互事件监听器
        const interactions = [
            'click', 'touchstart', 'keydown', 'mousedown', 'pointerdown'
        ];

        const handleInteraction = (e) => {
            if (!this.userInteracted) {
                this.userInteracted = true;
                sessionStorage.setItem('userInteracted', 'true');
                console.log('检测到用户首次交互:', e.type);

                // 如果是主页且音乐尚未播放，启动音乐
                if (this.currentPage === 0 && !this.musicPlaying) {
                    setTimeout(() => {
                        this.startMusicOnInteraction();
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
                        this.startMusicOnInteraction();
                    }, 1000); // 延迟1秒，在动画开始后播放音乐
                }
            }, { once: true });
        }

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
            if (this.musicPlayer) {
                localStorage.setItem('audioCurrentTime', this.musicPlayer.currentTime.toString());
                sessionStorage.setItem('musicTime', this.musicPlayer.currentTime.toString());
            }
        });

        // 页面可见性变化时处理音乐
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.musicPlaying && this.musicPlayer && this.musicPlayer.paused) {
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
            currentTime: this.musicPlayer ? this.musicPlayer.currentTime : 0,
            volume: this.musicPlayer ? this.musicPlayer.volume : 0.4,
            duration: this.musicPlayer ? this.musicPlayer.duration : 0,
            userInteracted: this.userInteracted
        };
    }
}

// 页面加载完成后初始化
let simpleMusicNavigationInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化简化音乐导航系统...');

    // 防止重复初始化
    if (simpleMusicNavigationInstance) {
        simpleMusicNavigationInstance.createNavigation();
        return;
    }

    simpleMusicNavigationInstance = new SimpleMusicNavigation();
    window.simpleMusicNavigation = simpleMusicNavigationInstance;

    // 全局错误处理
    window.addEventListener('error', (event) => {
        console.error('全局错误:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('未处理的Promise拒绝:', event.reason);
    });
});

// 导出给全局使用
window.SimpleMusicNavigation = SimpleMusicNavigation;