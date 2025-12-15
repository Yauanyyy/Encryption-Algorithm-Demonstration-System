window.algorithms.des = (() => {
    // DES Constants
    const C = {
        IP: [58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7],
        FP: [40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25],
        PC1: [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4],
        PC2: [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32],
        SHIFTS: [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
        E: [32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1],
        P: [16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25],
        S_BOXES: [
            [[14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7], [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8], [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0], [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]],
            [[15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10], [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5], [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15], [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]],
            [[10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8], [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1], [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7], [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]],
            [[7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15], [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9], [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4], [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]],
            [[2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9], [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6], [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14], [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]],
            [[12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11], [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8], [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6], [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]],
            [[4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1], [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6], [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2], [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]],
            [[13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7], [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2], [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8], [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]]
        ]
    };

    // Helper functions
    const permute = (bits, table) => table.map(i => bits[i - 1]);
    const xor = (a, b) => a.map((bit, i) => bit ^ b[i]);
    const rotateLeft = (bits, n) => [...bits.slice(n), ...bits.slice(0, n)];
    const hexToBits = (hex) => hex.split('').flatMap(c => parseInt(c, 16).toString(2).padStart(4, '0').split('').map(Number));
    const toHex = (bits) => {
        let hex = '';
        for (let i = 0; i < bits.length; i += 4) {
            hex += parseInt(bits.slice(i, i + 4).join(''), 2).toString(16).toUpperCase();
        }
        return hex;
    };

    function generateSubkeys(keyBits) {
        let key = permute(keyBits, C.PC1);
        let C_half = key.slice(0, 28);
        let D_half = key.slice(28, 56);
        let subkeys = [];
        let keygenSteps = '';

        for (let i = 0; i < 16; i++) {
            C_half = rotateLeft(C_half, C.SHIFTS[i]);
            D_half = rotateLeft(D_half, C.SHIFTS[i]);
            let combined = [...C_half, ...D_half];
            let subkey = permute(combined, C.PC2);
            subkeys.push(subkey);
            keygenSteps += `<li><strong>K${i + 1}:</strong> ${toHex(subkey)}</li>`;
        }
        return { subkeys, keygenSteps };
    }

    function feistel(R, subkey) {
        let expanded = permute(R, C.E);
        let xored = xor(expanded, subkey);
        let substituted = '';
        for (let i = 0; i < 8; i++) {
            let chunk = xored.slice(i * 6, (i + 1) * 6);
            let row = parseInt(`${chunk[0]}${chunk[5]}`, 2);
            let col = parseInt(chunk.slice(1, 5).join(''), 2);
            substituted += C.S_BOXES[i][row][col].toString(2).padStart(4, '0');
        }
        return permute(substituted.split('').map(Number), C.P);
    }
    
    function process(blockBits, keyBits, mode) {
        const { subkeys, keygenSteps } = generateSubkeys(keyBits);
        if (mode === 'decrypt') subkeys.reverse();

        let block = permute(blockBits, C.IP);
        let L = block.slice(0, 32);
        let R = block.slice(32, 64);
        let steps = `<li><strong>初始置换:</strong><br>L0=${toHex(L)}, R0=${toHex(R)}</li>`;

        for (let i = 0; i < 16; i++) {
            let prevL = L;
            L = R;
            R = xor(prevL, feistel(R, subkeys[i]));
            steps += `<li><strong>第 ${i + 1} 轮:</strong> K=${toHex(subkeys[i])}<br>L=${toHex(L)}, R=${toHex(R)}</li>`;
        }

        let finalBlock = permute([...R, ...L], C.FP);
        return { resultBits: finalBlock, steps, keygenSteps };
    }

    return {
        getHTML: () => `
            <div class="content-section">
                <h2>DES (Data Encryption Standard)</h2>
                
                <div class="algo-brief">
                    <h3>算法简介</h3>
                    <p>数据加密标准（DES）是一种对称密钥分组密码，采用 Feistel 结构。它曾是美国的官方加密标准，使用 56 位密钥对 64 位数据块进行加密。虽然由于密钥过短已被认为不够安全，但它在密码学历史上具有里程碑意义，深刻影响了后世密码算法的设计。</p>
                </div>

                <h3>加解密操作台</h3>
                <div class="operation-panel">
                    <div class="form-group">
                        <label for="des-input">数据块 (16个十六进制字符, 64位)</label>
                        <input type="text" id="des-input" maxlength="16" placeholder="例如: 0123456789ABCDEF">
                    </div>
                    <div class="form-group">
                        <label for="des-key">密钥 (16个十六进制字符, 64位)</label>
                        <input type="text" id="des-key" maxlength="16" placeholder="例如: 133457799BBCDFF1">
                    </div>
                    <div class="form-group">
                        <label for="des-mode">模式</label>
                        <select id="des-mode">
                            <option value="encrypt">加密</option>
                            <option value="decrypt">解密</option>
                        </select>
                    </div>
                    <button id="des-execute" class="btn btn-primary" style="margin-bottom: 1.5rem;">执行</button>
                    
                    <div class="form-group">
                        <label>结果 (十六进制)</label>
                        <div class="textarea-wrapper">
                            <textarea id="des-output" readonly></textarea>
                             <button class="copy-btn" title="复制结果" onclick="Utils.copyToClipboard(document.getElementById('des-output').value)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3z"/></svg>
                             </button>
                        </div>
                    </div>
                </div>

                <h3>过程可视化</h3>
                <div class="visualization-area">
                    <h4>子密钥生成过程</h4>
                    <ul id="des-keygen-steps"></ul>
                    <h4>16轮Feistel网络</h4>
                    <ul id="des-steps"></ul>
                </div>

                <h3>算法详细介绍</h3>
                <div id="algo-details-md" class="algo-details"></div>
            </div>
        `,
        init: async () => {
            const detailsContainer = document.getElementById('algo-details-md');
            if (detailsContainer && window.ALGO_CONTENT) {
                detailsContainer.innerHTML = window.ALGO_CONTENT.des || '内容加载失败';
            }

            document.getElementById('des-execute').addEventListener('click', () => {
                const hexInput = document.getElementById('des-input').value;
                const hexKey = document.getElementById('des-key').value;
                const mode = document.getElementById('des-mode').value;
                const hexRegex = /^[0-9a-fA-F]{16}$/;

                if (!hexRegex.test(hexInput) || !hexRegex.test(hexKey)) {
                    Utils.showAlert('错误：数据块和密钥都必须是16个有效的十六进制字符。');
                    return;
                }
                
                const textBits = hexToBits(hexInput);
                const keyBits = hexToBits(hexKey);

                const { resultBits, steps, keygenSteps } = process(textBits, keyBits, mode);
                
                document.getElementById('des-output').value = toHex(resultBits);
                document.getElementById('des-steps').innerHTML = steps;
                document.getElementById('des-keygen-steps').innerHTML = keygenSteps;
            });
        }
    };
})();