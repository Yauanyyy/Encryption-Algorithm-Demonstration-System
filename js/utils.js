/**
 * 工具函数模块
 */
const Utils = {
    /**
     * 使用SHA-256哈希字符串
     * @param {string} str - 要哈希的字符串
     * @returns {Promise<string>} - 返回哈希后的十六进制字符串
     */
    async sha256(str) {
        const textAsBuffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', textAsBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    /**
     * 显示一个短暂的提示消息
     * @param {string} message - 消息内容
     * @param {string} type - 'success' 或 'error'
     */
    showAlert(message, type = 'error') {
        const alertBox = document.createElement('div');
        alertBox.className = `alert-box ${type}`;
        alertBox.textContent = message;
        
        alertBox.style.position = 'fixed';
        alertBox.style.top = '20px';
        alertBox.style.right = '20px';
        alertBox.style.padding = '15px 20px';
        alertBox.style.borderRadius = '8px';
        alertBox.style.color = '#fff';
        alertBox.style.zIndex = '2000';
        alertBox.style.backgroundColor = type === 'success' ? 'var(--success-color)' : 'var(--error-color)';
        alertBox.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        alertBox.style.opacity = '0';
        alertBox.style.transition = 'opacity 0.3s ease';
        
        document.body.appendChild(alertBox);

        // Fade in
        setTimeout(() => alertBox.style.opacity = '1', 10);
        
        // Fade out
        setTimeout(() => {
            alertBox.style.opacity = '0';
            alertBox.addEventListener('transitionend', () => alertBox.remove());
        }, 3000);
    },
    
    /**
     * 复制文本到剪贴板
     * @param {string} text - 要复制的文本
     */
    copyToClipboard(text) {
        if (!text) return;
        navigator.clipboard.writeText(text).then(() => {
            this.showAlert('结果已复制到剪贴板', 'success');
        }).catch(err => {
            this.showAlert('复制失败: ' + err, 'error');
        });
    }
};