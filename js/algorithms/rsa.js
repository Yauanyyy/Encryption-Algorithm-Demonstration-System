window.algorithms.rsa = (() => {
    // --- 数学辅助函数 (基于 BigInt) ---

    // 模幂运算: (base ^ exp) % mod
    function modPow(base, exp, mod) {
        let result = 1n;
        base = base % mod;
        while (exp > 0n) {
            if (exp % 2n === 1n) result = (result * base) % mod;
            exp = exp / 2n;
            base = (base * base) % mod;
        }
        return result;
    }

    // 扩展欧几里得算法求模逆元: d * e ≡ 1 (mod phi)
    function modInverse(e, phi) {
        let m0 = phi, t, q;
        let x0 = 0n, x1 = 1n;
        if (phi === 1n) return 0n;
        while (e > 1n) {
            q = e / phi;
            t = phi;
            phi = e % phi;
            e = t;
            t = x0;
            x0 = x1 - q * x0;
            x1 = t;
        }
        if (x1 < 0n) x1 += m0;
        return x1;
    }

    // 最大公约数
    function gcd(a, b) {
        if (!b) return a;
        return gcd(b, a % b);
    }

    // 简单的素数判断 (用于演示输入的小数)
    function isPrime(num) {
        if (num <= 1n) return false;
        if (num <= 3n) return true;
        if (num % 2n === 0n || num % 3n === 0n) return false;
        for (let i = 5n; i * i <= num; i += 6n) {
            if (num % i === 0n || num % (i + 2n) === 0n) return false;
        }
        return true;
    }

    // --- 核心处理逻辑 ---

    let keyState = {
        p: null, q: null, n: null, phi: null, e: null, d: null,
        publicKey: null, privateKey: null
    };

    function generateKeysInput(pVal, qVal, eVal) {
        try {
            const p = BigInt(pVal);
            const q = BigInt(qVal);
            const e = BigInt(eVal);

            if (!isPrime(p) || !isPrime(q)) return { error: 'P 和 Q 必须是素数。' };
            if (p === q) return { error: 'P 和 Q 不能相同。' };

            const n = p * q;
            const phi = (p - 1n) * (q - 1n);

            if (e <= 1n || e >= phi) return { error: `E 必须在 1 < E < φ(${phi}) 之间。` };
            if (gcd(e, phi) !== 1n) return { error: `E (${e}) 与 φ(${phi}) 必须互质。` };

            const d = modInverse(e, phi);

            keyState = { p, q, n, phi, e, d, publicKey: `(${e}, ${n})`, privateKey: `(${d}, ${n})` };
            return { success: true, keys: keyState };
        } catch (err) {
            return { error: '输入无效，请输入正整数。' };
        }
    }

    function process(text, mode) {
        if (!keyState.n) {
            Utils.showAlert('请先在上方生成有效的 RSA 密钥对。');
            return { result: '', steps: '' };
        }

        let result = '';
        let steps = '';
        
        // 为了演示清晰，我们处理每个字符的 Unicode 编码 (code point)
        // 注意：如果字符编码 > n，解密将失败。演示时建议使用较小的字符或较大的素数。
        
        const codes = mode === 'encrypt' 
            ? text.split('').map(c => BigInt(c.charCodeAt(0)))
            : text.trim().split(/\s+/).map(s => BigInt(s)); // 解密时输入应为数字序列

        let resultArr = [];

        steps += `<li style="word-break: break-all;"><strong>当前参数:</strong> N=${keyState.n}, E=${keyState.e}, D=${keyState.d}</li>`;

        for (let i = 0; i < codes.length; i++) {
            const m = codes[i];
            
            // 检查消息大小
            if (mode === 'encrypt' && m >= keyState.n) {
                Utils.showAlert(`警告：字符 '${String.fromCharCode(Number(m))}' (编码 ${m}) 大于模数 N (${keyState.n})，无法正确加解密。请选择更大的素数 P 和 Q。`);
            }

            let c, calcStr;
            if (mode === 'encrypt') {
                // 加密: c = m^e mod n
                c = modPow(m, keyState.e, keyState.n);
                calcStr = `${m}<sup>${keyState.e}</sup> mod ${keyState.n} = <strong>${c}</strong>`;
                resultArr.push(c);
                steps += `<li>字符 '<strong>${String.fromCharCode(Number(m))}</strong>' (${m}): ${calcStr}</li>`;
            } else {
                // 解密: m = c^d mod n
                c = modPow(m, keyState.d, keyState.n);
                calcStr = `${m}<sup>${keyState.d}</sup> mod ${keyState.n} = <strong>${c}</strong>`;
                resultArr.push(String.fromCharCode(Number(c)));
                steps += `<li>密文 ${m}: ${calcStr} → '<strong>${String.fromCharCode(Number(c))}</strong>'</li>`;
            }
        }

        result = mode === 'encrypt' ? resultArr.join(' ') : resultArr.join('');
        return { result, steps };
    }

    return {
        getHTML: () => `
            <div class="content-section">
                <h2>RSA 非对称加密</h2>
                
                <div class="algo-brief">
                    <h3>算法简介</h3>
                    <p>RSA 是目前最有影响力的公钥加密算法。它基于一个十分简单的数论事实：将两个大素数相乘十分容易，但想要对其乘积进行因式分解却极其困难。RSA 拥有两把钥匙：<strong>公钥</strong>用于加密，<strong>私钥</strong>用于解密。</p>
                </div>

                <h3>1. 密钥生成 (Key Generation)</h3>
                <div class="operation-panel">
                    <div class="algo-options" style="align-items: flex-end;">
                        <div class="form-group" style="flex: 1;">
                            <label for="rsa-p">素数 P</label>
                            <input type="number" id="rsa-p" value="61" placeholder="素数1">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="rsa-q">素数 Q</label>
                            <input type="number" id="rsa-q" value="53" placeholder="素数2">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label for="rsa-e">公钥指数 E (通常为 17, 65537)</label>
                            <input type="number" id="rsa-e" value="17" placeholder="与 φ(n) 互质">
                        </div>
                        <button id="rsa-gen-keys" class="btn btn-primary" style="margin-bottom: 1rem;">生成密钥对</button>
                    </div>
                    
                    <div class="visualization-area" id="rsa-key-info" style="display:none; margin-top:0;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-family: var(--monospace-font);">
                            <div><strong>模数 N (P×Q):</strong> <span id="disp-n"></span></div>
                            <div><strong>欧拉函数 φ(N):</strong> <span id="disp-phi"></span></div>
                            <div style="color: var(--primary-color);"><strong>公钥 (E, N):</strong> <span id="disp-pub"></span></div>
                            <div style="color: var(--error-color);"><strong>私钥 (D, N):</strong> <span id="disp-priv"></span></div>
                        </div>
                    </div>
                </div>

                <h3>2. 加解密操作台</h3>
                <div class="operation-panel">
                    <div class="form-group">
                        <label for="rsa-input">输入</label>
                        <textarea id="rsa-input" placeholder="加密模式输入文本 (如 'HI'); 解密模式输入数字序列 (空格分隔)"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="rsa-mode">模式</label>
                        <select id="rsa-mode">
                            <option value="encrypt">使用公钥加密 (Encrypt)</option>
                            <option value="decrypt">使用私钥解密 (Decrypt)</option>
                        </select>
                    </div>
                    <button id="rsa-execute" class="btn btn-primary" style="margin-bottom: 1.5rem;">执行</button>
                    
                    <div class="form-group">
                        <label>结果</label>
                        <div class="textarea-wrapper">
                            <textarea id="rsa-output" readonly></textarea>
                            <button class="copy-btn" title="复制结果" onclick="Utils.copyToClipboard(document.getElementById('rsa-output').value)">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/><path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3z"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <h3>过程可视化</h3>
                <div class="visualization-area">
                    <h4>计算步骤 (模幂运算)</h4>
                    <ul id="rsa-steps" style="max-height: 300px; overflow-y: auto;"></ul>
                </div>

                <h3>算法详细介绍</h3>
                <div id="algo-details-md" class="algo-details"></div>
            </div>
        `,
        init: async () => {
            const detailsContainer = document.getElementById('algo-details-md');
            if (detailsContainer && window.ALGO_CONTENT) {
                detailsContainer.innerHTML = window.ALGO_CONTENT.rsa || '内容加载失败';
            }

            // 绑定密钥生成事件
            document.getElementById('rsa-gen-keys').addEventListener('click', () => {
                const p = document.getElementById('rsa-p').value;
                const q = document.getElementById('rsa-q').value;
                const e = document.getElementById('rsa-e').value;
                
                const res = generateKeysInput(p, q, e);
                const infoArea = document.getElementById('rsa-key-info');

                if (res.error) {
                    Utils.showAlert(res.error);
                    infoArea.style.display = 'none';
                } else {
                    document.getElementById('disp-n').textContent = res.keys.n;
                    document.getElementById('disp-phi').textContent = res.keys.phi;
                    document.getElementById('disp-pub').textContent = res.keys.publicKey;
                    document.getElementById('disp-priv').textContent = res.keys.privateKey;
                    infoArea.style.display = 'block';
                    Utils.showAlert('密钥生成成功！', 'success');
                }
            });

            // 绑定执行事件
            document.getElementById('rsa-execute').addEventListener('click', () => {
                const text = document.getElementById('rsa-input').value;
                const mode = document.getElementById('rsa-mode').value;
                
                if (!text) {
                    Utils.showAlert('请输入需要处理的内容。');
                    return;
                }

                const { result, steps } = process(text, mode);
                document.getElementById('rsa-output').value = result;
                document.getElementById('rsa-steps').innerHTML = steps;
            });
            
            // 默认触发一次密钥生成，方便演示
            document.getElementById('rsa-gen-keys').click();
        }
    };
})();