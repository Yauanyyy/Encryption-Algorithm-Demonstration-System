window.algorithms.playfair = (() => {

    function generateMatrix(key) {
        key = key.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
        let keySet = new Set(key.split(''));
        let alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
        let matrixContent = [...keySet].join('');
        
        for (const char of alphabet) {
            if (!keySet.has(char)) {
                matrixContent += char;
            }
        }
        
        let matrix = [];
        for (let i = 0; i < 5; i++) {
            matrix.push(matrixContent.substring(i * 5, (i + 1) * 5).split(''));
        }
        return matrix;
    }

    function prepareText(text) {
        text = text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
        if (!text) return [];
        
        let preparedText = '';
        for (let i = 0; i < text.length; i++) {
            preparedText += text[i];
            if (i + 1 < text.length) {
                if (text[i] === text[i+1]) {
                    preparedText += 'X';
                }
            }
        }
        
        if (preparedText.length % 2 !== 0) {
            preparedText += 'X';
        }

        return preparedText.match(/.{1,2}/g) || [];
    }

    function findPosition(matrix, char) {
        for (let r = 0; r < 5; r++) {
            for (let c = 0; c < 5; c++) {
                if (matrix[r][c] === char) return { row: r, col: c };
            }
        }
        return null;
    }

    function process(text, key, mode) {
        if (!key) {
            Utils.showAlert('错误：密钥不能为空。');
            return { result: '', steps: '<li>请输入密钥以生成矩阵。</li>' };
        }
        if (!/^[a-zA-Z\s]*$/.test(text)) {
            Utils.showAlert('错误：输入文本只能包含英文字母和空格。');
            return { result: '', steps: '<li>输入无效。</li>' };
        }

        const matrix = generateMatrix(key);
        const pairs = prepareText(text);
        const direction = (mode === 'encrypt') ? 1 : -1;
        let result = '';
        let steps = '';

        steps += `<li><strong>准备文本:</strong> ${text.toUpperCase().replace(/[^A-Z\s]/g, '')} → <strong>分组:</strong> ${pairs.join(' ')}</li><hr>`;

        for (const pair of pairs) {
            const pos1 = findPosition(matrix, pair[0]);
            const pos2 = findPosition(matrix, pair[1]);
            let newChar1, newChar2;

            let step = `<li>处理 <strong>"${pair}"</strong>: `;
            if (pos1.row === pos2.row) { 
                newChar1 = matrix[pos1.row][(pos1.col + direction + 5) % 5];
                newChar2 = matrix[pos2.row][(pos2.col + direction + 5) % 5];
                step += `同行规则 → "<strong>${newChar1}${newChar2}</strong>"`;
            } else if (pos1.col === pos2.col) { 
                newChar1 = matrix[(pos1.row + direction + 5) % 5][pos1.col];
                newChar2 = matrix[(pos2.row + direction + 5) % 5][pos2.col];
                step += `同列规则 → "<strong>${newChar1}${newChar2}</strong>"`;
            } else { 
                newChar1 = matrix[pos1.row][pos2.col];
                newChar2 = matrix[pos2.row][pos1.col];
                step += `矩形规则 → "<strong>${newChar1}${newChar2}</strong>"`;
            }
            result += newChar1 + newChar2;
            steps += `${step}</li>`;
        }
        return { result, steps };
    }

    function displayMatrix(matrix) {
        const container = document.getElementById('playfair-matrix');
        if (!container) return;
        container.innerHTML = '';
        matrix.forEach(row => {
            row.forEach(char => {
                const cell = document.createElement('div');
                cell.className = 'matrix-cell';
                cell.textContent = char;
                container.appendChild(cell);
            });
        });
    }

    return {
        getHTML: () => `
            <div class="content-section">
                <h2>Playfair 密码</h2>
                
                <div class="algo-brief">
                    <h3>算法简介</h3>
                    <p>Playfair 密码是世界上第一个实用的双字母替换密码。它依据一个 5x5 的字母矩阵，将明文拆分为字母对进行加密。相比单字母替换密码，Playfair 能更好地抵抗频率分析攻击，因为它是对双字母组合进行操作。</p>
                </div>

                <h3>加解密操作台</h3>
                <div class="operation-panel">
                    <div class="form-group">
                        <label for="playfair-input">输入文本 (仅限英文字母和空格, J会被替换为I)</label>
                        <textarea id="playfair-input" placeholder="例如: HIDE THE GOLD IN THE TREE STUMP"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="playfair-key">密钥 (Keyword, 仅限英文字母)</label>
                        <input type="text" id="playfair-key" placeholder="例如: MONARCHY">
                    </div>
                    <div class="form-group">
                        <label for="playfair-mode">模式</label>
                        <select id="playfair-mode">
                            <option value="encrypt">加密</option>
                            <option value="decrypt">解密</option>
                        </select>
                    </div>
                    <button id="playfair-execute" class="btn btn-primary" style="margin-bottom: 1.5rem;">执行</button>
                    
                    <div class="form-group">
                        <label>结果</label>
                        <div class="textarea-wrapper">
                            <textarea id="playfair-output" readonly></textarea>
                            <button class="copy-btn" title="复制结果" onclick="Utils.copyToClipboard(document.getElementById('playfair-output').value)">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3z"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <h3>过程可视化</h3>
                <div class="visualization-area">
                    <h4>5x5 字母矩阵 (根据密钥实时生成)</h4>
                    <div id="playfair-matrix" class="matrix-container"></div>
                    <h4>处理步骤</h4>
                    <ul id="playfair-steps" style="list-style: none; padding-left: 0; font-family: var(--monospace-font);"></ul>
                </div>

                <h3>算法详细介绍</h3>
                <div id="algo-details-md" class="algo-details"></div>
            </div>
        `,
        init: async () => {
            const detailsContainer = document.getElementById('algo-details-md');
            if (detailsContainer && window.ALGO_CONTENT) {
                detailsContainer.innerHTML = window.ALGO_CONTENT.playfair || '内容加载失败';
            }

            const keyInput = document.getElementById('playfair-key');
            
            keyInput.addEventListener('input', () => {
                const matrix = generateMatrix(keyInput.value);
                displayMatrix(matrix);
            });

            document.getElementById('playfair-execute').addEventListener('click', () => {
                const text = document.getElementById('playfair-input').value;
                const key = keyInput.value;
                const mode = document.getElementById('playfair-mode').value;
                
                const { result, steps } = process(text, key, mode);
                document.getElementById('playfair-output').value = result;
                document.getElementById('playfair-steps').innerHTML = steps;
            });
            
            displayMatrix(generateMatrix(''));
        }
    };
})();