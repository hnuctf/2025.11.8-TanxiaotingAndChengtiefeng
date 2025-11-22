// 爱情档案馆导航系统
class LoveNavigation {
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
        this.musicPlaying = false;

        this.init();
    }

    init() {
        this.createNavigation();
        this.createPageTransition();
        this.createFloatingTooltip();
        this.createPetals();
        this.bindEvents();
        this.updateNavigation();
        this.initMusic();

        // 显示欢迎提示
        setTimeout(() => {
            this.showTooltip('欢迎来到峰峰和婷婷的恋爱档案馆 💕');
        }, 1000);
    }

    getCurrentPageIndex() {
        const fileName = window.location.pathname.split('/').pop();
        return this.pages.findIndex(page => page.file === fileName) || 0;
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

    createPetals() {
        // 创建飘落的花瓣效果
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createPetal();
            }, i * 2000);
        }
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

    goToPage(index) {
        if (this.isTransitioning || index < 0 || index >= this.pages.length || index === this.currentPage) {
            return;
        }

        this.isTransitioning = true;

        // 显示过渡动画
        const transition = document.querySelector('.page-transition');
        transition.classList.add('active');

        // 显示提示信息
        const direction = index > this.currentPage ? '继续探索' : '回味美好';
        this.showTooltip(`${direction}：${this.pages[index].title}`);

        setTimeout(() => {
            // 更新当前页面
            this.currentPage = index;

            // 跳转到目标页面
            window.location.href = this.pages[index].file;
        }, 800);
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

    initMusic() {
        // 检查是否有音频元素
        const audio = document.querySelector('audio');
        if (audio) {
            // 从localStorage恢复播放状态
            const wasPlaying = localStorage.getItem('musicPlaying') === 'true';
            const currentTime = localStorage.getItem('audioCurrentTime');

            if (currentTime) {
                audio.currentTime = parseFloat(currentTime);
            }

            if (wasPlaying) {
                audio.play().catch(e => console.log('音频播放失败:', e));
                this.musicPlaying = true;
                document.querySelector('.music-toggle').classList.add('playing');
            }

            // 监听音频事件
            audio.addEventListener('play', () => {
                this.musicPlaying = true;
                document.querySelector('.music-toggle').classList.add('playing');
                localStorage.setItem('musicPlaying', 'true');
            });

            audio.addEventListener('pause', () => {
                this.musicPlaying = false;
                document.querySelector('.music-toggle').classList.remove('playing');
                localStorage.setItem('musicPlaying', 'false');
            });

            audio.addEventListener('timeupdate', () => {
                localStorage.setItem('audioCurrentTime', audio.currentTime);
            });
        }
    }

    toggleMusic() {
        const audio = document.querySelector('audio');
        if (!audio) return;

        if (this.musicPlaying) {
            audio.pause();
            this.showTooltip('音乐已暂停 🎵');
        } else {
            audio.play().then(() => {
                this.showTooltip('音乐已播放 🎵');
            }).catch(e => {
                this.showTooltip('音乐播放失败 😔');
            });
        }
    }

    showTooltip(message) {
        const tooltip = document.querySelector('.floating-tooltip');
        tooltip.textContent = message;
        tooltip.classList.add('show');

        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 3000);
    }

    // 公共方法：跳转到指定页面
    goToPageByName(pageName) {
        const index = this.pages.findIndex(page => page.id === pageName);
        if (index !== -1) {
            this.goToPage(index);
        }
    }

    // 公共方法：获取当前页面信息
    getCurrentPage() {
        return this.pages[this.currentPage];
    }

    // 公共方法：显示特殊提示
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

// 页面加载完成后初始化导航系统
document.addEventListener('DOMContentLoaded', () => {
    window.loveNavigation = new LoveNavigation();

    // 定期创建花瓣
    setInterval(() => {
        if (Math.random() > 0.7) {
            window.loveNavigation.createPetal();
        }
    }, 3000);
});

// 导出给全局使用
window.LoveNavigation = LoveNavigation;