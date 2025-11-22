// 平滑导航系统 - 无刷新页面切换
class SmoothLoveNavigation {
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
        this.isTransitioning = false;
        this.pageContents = new Map(); // 缓存页面内容
        this.musicPlayer = null;
        this.preloadedPages = new Set();

        this.init();
    }

    getCurrentPageIndex() {
        const fileName = window.location.pathname.split('/').pop();
        return this.pages.findIndex(page => page.file === fileName) || 0;
    }

    init() {
        this.createNavigation();
        this.createPageTransition();
        this.createFloatingTooltip();
        this.initMusic();
        this.bindEvents();
        this.updateNavigation();
        this.preloadAdjacentPages();
        this.createPetals();

        // 显示欢迎提示
        setTimeout(() => {
            this.showTooltip('欢迎来到峰峰和婷婷的恋爱档案馆 💕');
        }, 1000);
    }

    createNavigation() {
        const navHTML = `
            <nav class="navigation">
                <div class="nav-container">
                    <div class="page-progress">
                        ${this.pages.map((page, index) => `
                            <div class="progress-dot ${index === this.currentPage ? 'active' : ''} ${index < this.currentPage ? 'completed' : ''}"
                                 data-page="${page.title}"
                                 data-index="${index}"
                                 title="${page.title}">
                            </div>
                        `).join('')}
                    </div>

                    <button class="nav-btn prev-btn" ${this.currentPage === 0 ? 'disabled' : ''}>
                        上一页
                    </button>

                    <div class="page-title">${this.pages[this.currentPage].title}</div>

                    <button class="nav-btn next-btn" ${this.currentPage === this.pages.length - 1 ? 'disabled' : ''}>
                        下一页
                    </button>

                    <button class="music-toggle" title="背景音乐">
                        🎵
                    </button>
                </div>
            </nav>
        `;

        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    createPageTransition() {
        const transitionHTML = `
            <div class="page-transition">
                <div class="heart-loader"></div>
                <div class="transition-text">正在准备...</div>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', transitionHTML);
    }

    createFloatingTooltip() {
        const tooltipHTML = `
            <div class="floating-tooltip"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', tooltipHTML);
    }

    initMusic() {
        // 创建全局音乐播放器
        this.musicPlayer = new Audio('./Love_files/love.mp3');
        this.musicPlayer.loop = true;
        this.musicPlayer.volume = 0.5;

        // 恢复播放状态
        const wasPlaying = localStorage.getItem('musicPlaying') === 'true';
        const currentTime = localStorage.getItem('audioCurrentTime');

        if (currentTime) {
            this.musicPlayer.currentTime = parseFloat(currentTime);
        }

        // 监听音频事件
        this.musicPlayer.addEventListener('play', () => {
            this.musicPlaying = true;
            document.querySelector('.music-toggle').classList.add('playing');
            localStorage.setItem('musicPlaying', 'true');
        });

        this.musicPlayer.addEventListener('pause', () => {
            this.musicPlaying = false;
            document.querySelector('.music-toggle').classList.remove('playing');
            localStorage.setItem('musicPlaying', 'false');
        });

        this.musicPlayer.addEventListener('timeupdate', () => {
            localStorage.setItem('audioCurrentTime', this.musicPlayer.currentTime);
        });

        // 延迟播放，避免自动播放策略限制
        setTimeout(() => {
            if (wasPlaying) {
                this.musicPlayer.play().catch(e => console.log('音频播放失败:', e));
            }
        }, 1000);
    }

    async preloadPage(pageIndex) {
        if (this.pageContents.has(pageIndex) || this.preloadedPages.has(pageIndex)) {
            return this.pageContents.get(pageIndex);
        }

        try {
            const page = this.pages[pageIndex];
            const response = await fetch(page.file);
            const html = await response.text();

            // 解析HTML并提取主要内容
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 提取主要内容区域
            const content = doc.querySelector('#main, .card, .content-container, body');
            this.pageContents.set(pageIndex, content.innerHTML);
            this.preloadedPages.add(pageIndex);

            return content.innerHTML;
        } catch (error) {
            console.error('页面预加载失败:', error);
            return null;
        }
    }

    async preloadAdjacentPages() {
        // 预加载前后页面
        const prevIndex = this.currentPage - 1;
        const nextIndex = this.currentPage + 1;

        if (prevIndex >= 0) {
            this.preloadPage(prevIndex);
        }
        if (nextIndex < this.pages.length) {
            this.preloadPage(nextIndex);
        }
    }

    async goToPage(index) {
        if (this.isTransitioning || index < 0 || index >= this.pages.length || index === this.currentPage) {
            return;
        }

        this.isTransitioning = true;

        // 显示过渡动画
        const transition = document.querySelector('.page-transition');
        const transitionText = transition.querySelector('.transition-text');
        transition.classList.add('active');
        transitionText.textContent = `正在前往${this.pages[index].title}...`;

        // 显示提示信息
        const direction = index > this.currentPage ? '继续探索' : '回味美好';
        this.showTooltip(`${direction}：${this.pages[index].title}`);

        // 预加载目标页面
        await this.preloadPage(index);

        // 更新URL而不刷新页面
        const newUrl = `${window.location.origin}${window.location.pathname.replace(/[^/]+$/, this.pages[index].file)}`;
        window.history.pushState({ page: index }, '', newUrl);

        // 执行页面切换动画
        await this.performPageTransition(index);

        // 隐藏过渡动画
        setTimeout(() => {
            transition.classList.remove('active');
            this.isTransitioning = false;

            // 预加载新的相邻页面
            this.preloadAdjacentPages();
        }, 300);
    }

    async performPageTransition(newPageIndex) {
        const oldContent = document.querySelector('#main, .card, .content-container');
        const newContent = this.pageContents.get(newPageIndex);

        if (!oldContent || !newContent) return;

        // 淡出旧内容
        oldContent.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        oldContent.style.opacity = '0';
        oldContent.style.transform = 'scale(0.95)';

        // 等待淡出完成
        await new Promise(resolve => setTimeout(resolve, 300));

        // 更新内容
        oldContent.innerHTML = newContent;

        // 重新初始化页面特定的脚本
        this.reinitializePageScripts(newPageIndex);

        // 淡入新内容
        oldContent.style.transition = 'opacity 0.4s ease-in, transform 0.4s ease-in';
        oldContent.style.opacity = '1';
        oldContent.style.transform = 'scale(1)';

        // 更新导航状态
        this.currentPage = newPageIndex;
        this.updateNavigation();

        // 等待淡入完成
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    reinitializePageScripts(pageIndex) {
        // 根据页面索引重新初始化特定的脚本
        switch(pageIndex) {
            case 0: // index.html
                this.reinitializeMainPage();
                break;
            case 2: // page3.html
                this.reinitializeChartPage();
                break;
            case 5: // page6.html
                this.reinitializeTimerPage();
                break;
        }
    }

    reinitializeMainPage() {
        // 重新初始化主页的Canvas动画
        if (typeof runAsync !== 'undefined') {
            try {
                // 重新执行主页面动画
                const canvas = $('#canvas');
                if (canvas.length) {
                    // 这里可以重新初始化Canvas动画
                    console.log('重新初始化主页面动画');
                }
            } catch (error) {
                console.log('主页面动画重新初始化失败:', error);
            }
        }
    }

    reinitializeChartPage() {
        // 重新初始化图表页面
        if (typeof Chart !== 'undefined') {
            // 重新渲染图表
            console.log('重新初始化图表');
        }
    }

    reinitializeTimerPage() {
        // 重新初始化计时器页面
        if (typeof updateTime !== 'undefined') {
            // 重新启动计时器
            console.log('重新初始化计时器');
        }
    }

    updateNavigation() {
        // 更新进度点
        document.querySelectorAll('.progress-dot').forEach((dot, index) => {
            dot.classList.remove('active');
            if (index === this.currentPage) {
                dot.classList.add('active');
            }
        });

        // 更新按钮状态
        document.querySelector('.prev-btn').disabled = this.currentPage === 0;
        document.querySelector('.next-btn').disabled = this.currentPage === this.pages.length - 1;

        // 更新页面标题
        document.querySelector('.page-title').textContent = this.pages[this.currentPage].title;
    }

    toggleMusic() {
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
        // 定期创建花瓣
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

        // 动画结束后移除花瓣
        setTimeout(() => {
            petal.remove();
        }, 15000);
    }

    bindEvents() {
        // 上一页按钮
        document.querySelector('.prev-btn').addEventListener('click', () => {
            this.goToPage(this.currentPage - 1);
        });

        // 下一页按钮
        document.querySelector('.next-btn').addEventListener('click', () => {
            this.goToPage(this.currentPage + 1);
        });

        // 进度点点击
        document.querySelectorAll('.progress-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.goToPage(index);
            });
        });

        // 音乐控制
        document.querySelector('.music-toggle').addEventListener('click', () => {
            this.toggleMusic();
        });

        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (this.isTransitioning) return;

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

        // 浏览器前进后退按钮支持
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page !== undefined) {
                this.currentPage = e.state.page;
                this.performPageTransition(this.currentPage);
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
                // 向左滑动，下一页
                this.goToPage(this.currentPage + 1);
            } else if (diff < 0 && this.currentPage > 0) {
                // 向右滑动，上一页
                this.goToPage(this.currentPage - 1);
            }
        }
    }

    // 公共方法
    showSpecialMessage(message, duration = 5000) {
        this.showTooltip(message);

        // 添加特效
        const nav = document.querySelector('.navigation');
        nav.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            nav.style.animation = '';
        }, 500);
    }
}

// 页面加载完成后初始化平滑导航系统
document.addEventListener('DOMContentLoaded', () => {
    window.smoothLoveNavigation = new SmoothLoveNavigation();
});

// 导出给全局使用
window.SmoothLoveNavigation = SmoothLoveNavigation;