window.algorithms.caesar = (() => {
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function process(text, shift, mode) {
        if (isNaN(shift)) {
            Utils.showAlert('错误：偏移量必须是数字。');
            return '';
        }

        if (!/^[a-zA-Z\s]*$/.test(text)) {
            Utils.showAlert('错误：输入文本只能包含英文字母和空格。');
            const outputElement = document.getElementById('caesar-output');
            return outputElement ? outputElement.value : ''; 
        }

        shift = (shift % 26 + 26) % 26; 
        if (mode === 'decrypt') {
            shift = 26 - shift;
        }

        let result = '';
        text = text.toUpperCase();

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const index = ALPHABET.indexOf(char);

            if (index !== -1) {
                const newIndex = (index + shift) % 26;
                result += ALPHABET[newIndex];
            } else {
                result += char; 
            }
        }
        return result;
    }

    function updateAlphabetMap(shift) {
        const mapContainer = document.getElementById('caesar-alphabet-map');
        if (!mapContainer) return;

        shift = (shift % 26 + 26) % 26;
        let html = '<table><thead><tr>';
        for (let char of ALPHABET) { html += `<th>${char}</th>`; }
        html += '</tr></thead><tbody><tr>';
        for (let i = 0; i < ALPHABET.length; i++) { html += `<td>↓</td>`; }
        html += '</tr><tr>';
        for (let i = 0; i < ALPHABET.length; i++) {
            html += `<td>${ALPHABET[(i + shift) % 26]}</td>`;
        }
        html += '</tr></tbody></table>';
        mapContainer.innerHTML = html;
    }

    return {
        getHTML: () => `
            <div class="content-section">
                <h2>凯撒密码 (Caesar Cipher)</h2>
                
                <div class="algo-brief">
                    <h3>算法简介</h3>
                    <p>凯撒密码是历史上最简单的加密技术之一。它是一种替换密码，明文中的所有字母都在字母表上向后（或向前）按照一个固定数目进行偏移后被替换成密文。虽然它很容易被破解，但它是理解现代密码学基础的重要起点。</p>
                </div>

                <h3>加解密操作台</h3>
                <div class="operation-panel">
                    <div class="form-group">
                        <label for="caesar-input">输入文本 (仅限英文字母和空格)</label>
                        <textarea id="caesar-input" placeholder="例如: HELLO WORLD"></textarea>
                    </div>
                    <div class="algo-options">
                        <div class="form-group">
                            <label for="caesar-shift">偏移量 (Shift)</label>
                            <input type="number" id="caesar-shift" value="3">
                        </div>
                        <div class="form-group">
                            <label for="caesar-mode">模式</label>
                            <select id="caesar-mode">
                                <option value="encrypt">加密</option>
                                <option value="decrypt">解密</option>
                            </select>
                        </div>
                    </div>
                    <button id="caesar-execute" class="btn btn-primary" style="margin-bottom: 1.5rem;">执行</button>
                    
                    <div class="form-group">
                        <label>结果</label>
                        <div class="textarea-wrapper">
                            <textarea id="caesar-output" readonly></textarea>
                            <button class="copy-btn" title="复制结果" onclick="Utils.copyToClipboard(document.getElementById('caesar-output').value)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3z"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <h3>过程可视化</h3>
                <div class="visualization-area">
                    <h4>字母映射关系</h4>
                    <div id="caesar-alphabet-map" style="overflow-x: auto;"></div>
                </div>

                <h3>算法详细介绍</h3>
                <div id="algo-details-md" class="algo-details">
                </div>
            </div>
        `,
        init: async () => {
            const detailsContainer = document.getElementById('algo-details-md');
            if (detailsContainer && window.ALGO_CONTENT) {
                detailsContainer.innerHTML = window.ALGO_CONTENT.caesar || '内容加载失败';
            }
            
            const shiftInput = document.getElementById('caesar-shift');
            
            document.getElementById('caesar-execute').addEventListener('click', () => {
                const input = document.getElementById('caesar-input').value;
                const shift = parseInt(shiftInput.value, 10);
                const mode = document.getElementById('caesar-mode').value;
                
                const result = process(input, shift, mode);
                document.getElementById('caesar-output').value = result;
            });

            shiftInput.addEventListener('input', () => {
                const shift = parseInt(shiftInput.value, 10) || 0;
                updateAlphabetMap(shift);
            });
            
            updateAlphabetMap(parseInt(shiftInput.value, 10));
        }
    };
})();