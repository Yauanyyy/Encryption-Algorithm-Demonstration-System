window.algorithms.onetimepad = (() => {
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function process(text, key, mode) {
        if (!/^[a-zA-Z]+$/.test(text) || !/^[a-zA-Z]+$/.test(key)) {
            Utils.showAlert('错误：输入文本和密钥都只能包含英文字母。');
            return { result: '', steps: '<li>输入无效。</li>' };
        }
        text = text.toUpperCase();
        key = key.toUpperCase();
        if (text.length !== key.length) {
            Utils.showAlert(`错误：文本长度 (${text.length}) 与密钥长度 (${key.length}) 必须相同。`);
            return { result: '', steps: `<li>长度不匹配。</li>` };
        }

        let result = '', steps = '';
        for (let i = 0; i < text.length; i++) {
            const textIndex = ALPHABET.indexOf(text[i]);
            const keyIndex = ALPHABET.indexOf(key[i]);
            let newIndex, operation;
            if (mode === 'encrypt') {
                newIndex = (textIndex + keyIndex) % 26;
                operation = '+';
            } else {
                newIndex = (textIndex - keyIndex + 26) % 26;
                operation = '-';
            }
            const newChar = ALPHABET[newIndex];
            result += newChar;
            steps += `<li>'${text[i]}' (${textIndex}) ${operation} '${key[i]}' (${keyIndex}) = ${newIndex} → '<strong>${newChar}</strong>'</li>`;
        }
        return { result, steps };
    }

    function generateKey(length) {
        let key = '';
        for (let i = 0; i < length; i++) key += ALPHABET[Math.floor(Math.random() * 26)];
        return key;
    }

    return {
        getHTML: () => `
            <div class="content-section">
                <h2>一次性密码本 (One-time Pad)</h2>
                
                <div class="algo-brief">
                    <h3>算法简介</h3>
                    <p>一次性密码本是一种理论上绝对安全的加密算法。它使用一个与明文等长的随机密钥与明文进行异或运算（或模运算）。只要密钥是真正的随机数且仅使用一次，密文就无法被破译，因为任何可能的明文都具有相同的概率。</p>
                </div>

                <h3>加解密操作台</h3>
                <div class="operation-panel">
                    <div class="form-group"><label for="otp-input">输入文本 (仅限英文字母)</label><textarea id="otp-input" placeholder="Enter plaintext here..."></textarea></div>
                    <div class="form-group"><label for="otp-key">密钥 (仅限英文字母, 长度需与文本相同)</label><textarea id="otp-key" placeholder="Enter key here or generate one..."></textarea></div>
                    <div class="algo-options"><button id="otp-generate-key" class="btn btn-secondary">根据输入文本生成随机密钥</button></div>
                    <div class="form-group"><label for="otp-mode">模式</label><select id="otp-mode"><option value="encrypt">加密</option><option value="decrypt">解密</option></select></div>
                    <button id="otp-execute" class="btn btn-primary" style="margin-bottom: 1.5rem;">执行</button>
                    
                    <div class="form-group">
                        <label>结果</label>
                        <div class="textarea-wrapper">
                            <textarea id="otp-output" readonly></textarea>
                            <button class="copy-btn" title="复制结果" onclick="Utils.copyToClipboard(document.getElementById('otp-output').value)"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3z"/></svg></button>
                        </div>
                    </div>
                </div>

                <h3>过程可视化</h3>
                <div class="visualization-area"><h4>逐字符处理过程</h4><ul id="otp-steps"></ul></div>

                <h3>算法详细介绍</h3>
                <div id="algo-details-md" class="algo-details"></div>
            </div>
        `,
        init: async () => {
            const detailsContainer = document.getElementById('algo-details-md');
            if (detailsContainer && window.ALGO_CONTENT) {
                detailsContainer.innerHTML = window.ALGO_CONTENT.onetimepad || '内容加载失败';
            }

            document.getElementById('otp-generate-key').addEventListener('click', () => {
                const text = document.getElementById('otp-input').value.replace(/[^a-zA-Z]/g, '');
                if (text.length === 0) {
                    Utils.showAlert('请输入文本以确定密钥长度。');
                    return;
                }
                document.getElementById('otp-key').value = generateKey(text.length);
            });
            document.getElementById('otp-execute').addEventListener('click', () => {
                const { result, steps } = process(document.getElementById('otp-input').value, document.getElementById('otp-key').value, document.getElementById('otp-mode').value);
                document.getElementById('otp-output').value = result;
                document.getElementById('otp-steps').innerHTML = steps;
            });
        }
    };
})();