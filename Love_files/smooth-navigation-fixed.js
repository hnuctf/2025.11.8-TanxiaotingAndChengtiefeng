// 修复版平滑导航系统
class FixedSmoothLoveNavigation {
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
        this.pageContents = new Map();
        this.musicPlayer = null;
        this.preloadedPages = new Set();
        this.loadingTimeout = null;

        this.init();
    }

    getCurrentPageIndex() {
        const fileName = window.location.pathname.split('/').pop();
        return this.pages.findIndex(page => page.file === fileName) || 0;
    }

    init() {
        console.log('初始化平滑导航系统...');
        this.createNavigation();
        this.createPageTransition();
        this.createFloatingTooltip();
        this.initMusic();
        this.bindEvents();
        this.updateNavigation();
        this.preloadAdjacentPages();
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
        const oldTransition = document.querySelector('.page-transition');
        if (oldTransition) {
            oldTransition.remove();
        }

        const transitionHTML = `
            <div class="page-transition">
                <div class="heart-loader"></div>
                <div class="transition-text">正在准备...</div>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', transitionHTML);
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

    async preloadPage(pageIndex) {
        if (this.pageContents.has(pageIndex) || this.preloadedPages.has(pageIndex)) {
            return this.pageContents.get(pageIndex);
        }

        try {
            const page = this.pages[pageIndex];
            console.log(`正在预加载页面: ${page.file}`);

            const response = await fetch(page.file);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();

            // 解析HTML并提取主要内容
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 尝试多种内容选择器
            const contentSelectors = ['#main', '.card', '.content-container', 'body > div:first-child', 'body'];
            let content = null;

            for (const selector of contentSelectors) {
                content = doc.querySelector(selector);
                if (content) {
                    console.log(`找到内容选择器: ${selector}`);
                    break;
                }
            }

            if (!content) {
                // 如果没有找到特定内容，使用整个body内容
                content = doc.querySelector('body');
            }

            if (content) {
                const contentHTML = content.innerHTML;
                this.pageContents.set(pageIndex, contentHTML);
                this.preloadedPages.add(pageIndex);
                console.log(`页面 ${page.file} 预加载成功`);
                return contentHTML;
            } else {
                throw new Error('无法找到页面内容');
            }
        } catch (error) {
            console.error(`页面预加载失败: ${this.pages[pageIndex].file}`, error);
            return null;
        }
    }

    async preloadAdjacentPages() {
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
            console.log('页面切换被阻止:', { isTransitioning: this.isTransitioning, index, currentPage: this.currentPage });
            return;
        }

        console.log(`开始切换到页面: ${this.pages[index].title} (索引: ${index})`);
        this.isTransitioning = true;

        // 设置超时保护
        this.loadingTimeout = setTimeout(() => {
            this.hideTransition();
            this.isTransitioning = false;
            this.showTooltip('页面加载超时，请重试 😔');
        }, 10000); // 10秒超时

        try {
            // 显示过渡动画
            const transition = document.querySelector('.page-transition');
            const transitionText = transition.querySelector('.transition-text');
            transition.classList.add('active');
            transitionText.textContent = `正在前往${this.pages[index].title}...`;

            // 显示提示信息
            const direction = index > this.currentPage ? '继续探索' : '回味美好';
            this.showTooltip(`${direction}：${this.pages[index].title}`);

            // 预加载目标页面
            const content = await this.preloadPage(index);

            if (!content) {
                throw new Error('页面内容加载失败');
            }

            // 更新URL而不刷新页面
            const newUrl = `${window.location.origin}${window.location.pathname.replace(/[^/]+$/, this.pages[index].file)}`;
            window.history.pushState({ page: index }, '', newUrl);

            // 执行页面切换
            await this.performPageTransition(index, content);

            // 清除超时
            if (this.loadingTimeout) {
                clearTimeout(this.loadingTimeout);
                this.loadingTimeout = null;
            }

            // 隐藏过渡动画
            setTimeout(() => {
                this.hideTransition();
                this.isTransitioning = false;

                // 预加载新的相邻页面
                this.preloadAdjacentPages();
            }, 300);

        } catch (error) {
            console.error('页面切换失败:', error);

            // 清除超时
            if (this.loadingTimeout) {
                clearTimeout(this.loadingTimeout);
                this.loadingTimeout = null;
            }

            this.hideTransition();
            this.isTransitioning = false;
            this.showTooltip('页面加载失败，请重试 😔');
        }
    }

    hideTransition() {
        const transition = document.querySelector('.page-transition');
        if (transition) {
            transition.classList.remove('active');
        }
    }

    async performPageTransition(newPageIndex, content) {
        // 查找当前内容容器
        const contentSelectors = ['#main', '.card', '.content-container', 'body > div:first-child'];
        let oldContent = null;

        for (const selector of contentSelectors) {
            oldContent = document.querySelector(selector);
            if (oldContent) {
                break;
            }
        }

        if (!oldContent) {
            throw new Error('无法找到当前内容容器');
        }

        console.log('开始内容切换动画');

        // 淡出旧内容
        oldContent.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        oldContent.style.opacity = '0';
        oldContent.style.transform = 'scale(0.95)';

        // 等待淡出完成
        await new Promise(resolve => setTimeout(resolve, 300));

        // 更新内容
        oldContent.innerHTML = content;

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

        console.log('内容切换完成');
    }

    reinitializePageScripts(pageIndex) {
        console.log(`重新初始化页面 ${pageIndex} 的脚本`);

        try {
            switch(pageIndex) {
                case 0: // index.html
                    // 重新初始化主页的Canvas动画
                    setTimeout(() => {
                        if (typeof runAsync !== 'undefined') {
                            console.log('重新初始化主页面动画');
                        }
                    }, 500);
                    break;
                case 2: // page3.html
                    setTimeout(() => {
                        if (typeof Chart !== 'undefined') {
                            console.log('重新初始化图表');
                        }
                    }, 500);
                    break;
                case 5: // page6.html
                    setTimeout(() => {
                        if (typeof updateTime !== 'undefined') {
                            console.log('重新初始化计时器');
                        }
                    }, 500);
                    break;
            }
        } catch (error) {
            console.error('脚本重新初始化失败:', error);
        }
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
        // 移除旧的事件监听器
        const oldNav = document.querySelector('.navigation');
        if (oldNav) {
            oldNav.replaceWith(oldNav.cloneNode(true));
        }

        // 重新绑定事件
        const newNav = document.querySelector('.navigation');

        // 上一页按钮
        const prevBtn = newNav.querySelector('.prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.goToPage(this.currentPage - 1);
            });
        }

        // 下一页按钮
        const nextBtn = newNav.querySelector('.next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.goToPage(this.currentPage + 1);
            });
        }

        // 进度点点击
        const dots = newNav.querySelectorAll('.progress-dot');
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.goToPage(index);
            });
        });

        // 音乐控制
        const musicBtn = newNav.querySelector('.music-toggle');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                this.toggleMusic();
            });
        }

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
                // 这里可以添加页面回退的逻辑
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
let navigationInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化导航系统...');

    // 防止重复初始化
    if (navigationInstance) {
        navigationInstance.createNavigation();
        return;
    }

    navigationInstance = new FixedSmoothLoveNavigation();
    window.smoothLoveNavigation = navigationInstance;
});

// 导出给全局使用
window.FixedSmoothLoveNavigation = FixedSmoothLoveNavigation;