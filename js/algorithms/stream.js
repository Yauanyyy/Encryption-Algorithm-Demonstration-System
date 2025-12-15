window.algorithms.stream = (() => {
    // RC4 Key-Scheduling Algorithm (KSA)
    function rc4KSA(key) {
        let S = Array.from(Array(256).keys());
        let j = 0;
        for (let i = 0; i < 256; i++) {
            j = (j + S[i] + key.charCodeAt(i % key.length)) % 256;
            [S[i], S[j]] = [S[j], S[i]]; 
        }
        return S;
    }

    // RC4 Pseudo-Random Generation Algorithm (PRGA)
    function rc4PRGA(S, length) {
        let i = 0;
        let j = 0;
        let keystream = [];
        const s_copy = [...S]; 
        for (let n = 0; n < length; n++) {
            i = (i + 1) % 256;
            j = (j + s_copy[i]) % 256;
            [s_copy[i], s_copy[j]] = [s_copy[j], s_copy[i]];
            const K = s_copy[(s_copy[i] + s_copy[j]) % 256];
            keystream.push(K);
        }
        return keystream;
    }

    function process(text, key, mode) {
        if (!key) {
            Utils.showAlert('错误：密钥不能为空。');
            return { result: '', steps: '', keystreamHex: '' };
        }

        let inputBytes;
        if (mode === 'encrypt') {
            inputBytes = text.split('').map(c => c.charCodeAt(0));
        } else { // decrypt
            const sanitizedText = text.replace(/\s/g, '');
            if (!/^[0-9a-fA-F]*$/.test(sanitizedText) || sanitizedText.length % 2 !== 0) {
                Utils.showAlert('错误：解密时，输入必须是有效的十六进制字符串。');
                return { result: '', steps: '', keystreamHex: '' };
            }
            inputBytes = [];
            for (let i = 0; i < sanitizedText.length; i += 2) {
                inputBytes.push(parseInt(sanitizedText.substring(i, i + 2), 16));
            }
        }

        if (inputBytes.length === 0) {
            Utils.showAlert('错误：请输入有效内容。');
            return { result: '', steps: '', keystreamHex: '' };
        }

        const S = rc4KSA(key);
        const keystream = rc4PRGA(S, inputBytes.length);
        const keystreamHex = keystream.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');

        let resultBytes = [];
        let steps = '';
        const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();

        for (let i = 0; i < inputBytes.length; i++) {
            const resultByte = inputBytes[i] ^ keystream[i];
            resultBytes.push(resultByte);
            steps += `<li>Byte ${i}: ${toHex(inputBytes[i])} XOR ${toHex(keystream[i])} = <strong>${toHex(resultByte)}</strong></li>`;
        }

        let result;
        if (mode === 'encrypt') {
            result = resultBytes.map(b => toHex(b)).join('');
        } else {
            result = String.fromCharCode(...resultBytes);
        }

        return { result, steps, keystreamHex };
    }

    return {
        getHTML: () => `
            <div class="content-section">
                <h2>流密码 (RC4-XOR)</h2>
                
                <div class="algo-brief">
                    <h3>算法简介</h3>
                    <p>流密码通过生成一个伪随机的密钥流（Keystream），并将其与明文数据进行逐位（或逐字节）异或来实现加密。RC4 是其中最著名的流密码算法之一，以简单高效著称。它在 SSL/TLS 等早期网络协议中曾被广泛使用，但现在因安全性问题已逐渐被 Salsa20/ChaCha20 等替代。</p>
                </div>

                <h3>加解密操作台</h3>
                <div class="operation-panel">
                    <div class="form-group">
                        <label for="stream-input">输入</label>
                        <textarea id="stream-input" placeholder="输入文本进行加密, 或输入十六进制字符串进行解密..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="stream-key">密钥 (任意长度)</label>
                        <input type="text" id="stream-key" placeholder="Enter secret key">
                    </div>
                    <div class="form-group">
                        <label for="stream-mode">模式</label>
                        <select id="stream-mode">
                            <option value="encrypt">加密 (输入: 文本)</option>
                            <option value="decrypt">解密 (输入: 十六进制)</option>
                        </select>
                    </div>
                    
                    <button id="stream-execute" class="btn btn-primary" style="margin-bottom: 1.5rem;">执行</button>
                    
                    <div class="form-group">
                        <label id="stream-output-label">结果 (十六进制)</label>
                        <div class="textarea-wrapper">
                            <textarea id="stream-output" readonly></textarea>
                            <button class="copy-btn" title="复制结果" onclick="Utils.copyToClipboard(document.getElementById('stream-output').value)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3z"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <h3>过程可视化</h3>
                <div class="visualization-area">
                    <h4>生成的密钥流 (Hex)</h4>
                    <textarea id="stream-keystream" readonly style="word-break: break-all;"></textarea>
                    <h4>异或运算过程</h4>
                    <ul id="stream-steps" style="max-height: 200px; overflow-y: auto;"></ul>
                </div>

                <h3>算法详细介绍</h3>
                <div id="algo-details-md" class="algo-details"></div>
            </div>
        `,
        init: async () => {
            const detailsContainer = document.getElementById('algo-details-md');
            if (detailsContainer && window.ALGO_CONTENT) {
                detailsContainer.innerHTML = window.ALGO_CONTENT.stream || '内容加载失败';
            }

            document.getElementById('stream-mode').addEventListener('change', (e) => {
                const outputLabel = document.getElementById('stream-output-label');
                outputLabel.textContent = e.target.value === 'encrypt' ? '结果 (十六进制)' : '结果 (文本)';
            });
            
            document.getElementById('stream-execute').addEventListener('click', () => {
                const key = document.getElementById('stream-key').value;
                const text = document.getElementById('stream-input').value;
                const mode = document.getElementById('stream-mode').value;
                
                const { result, steps, keystreamHex } = process(text, key, mode);

                document.getElementById('stream-output').value = result;
                document.getElementById('stream-keystream').value = keystreamHex;
                document.getElementById('stream-steps').innerHTML = steps;
            });
        }
    };
})();