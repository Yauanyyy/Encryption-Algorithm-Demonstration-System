/**
 * 主题切换模块
 */
class ThemeManager {
    constructor(toggleButtonId) {
        this.toggleButton = document.getElementById(toggleButtonId);
        // 优先使用系统主题设置
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.currentTheme = localStorage.getItem('crypto_theme') || (prefersDark ? 'dark' : 'light');
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.toggleButton.addEventListener('click', () => this.toggleTheme());
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }
    
    applyTheme(theme) {
        this.currentTheme = theme;
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(`${theme}-mode`);
        this.toggleButton.innerHTML = theme === 'light' ? '🌙' : '☀️';
        localStorage.setItem('crypto_theme', theme);
    }
}



