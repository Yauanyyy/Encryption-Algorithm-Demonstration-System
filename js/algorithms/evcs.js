/**
 * js/algorithms/evcs.js
 * 扩展视觉密码 (Extended Visual Cryptography Scheme) - 完整版
 * 包含：文本生成分存图、上传图片解密恢复
 */
window.algorithms.evcs = (() => {
    // 画布尺寸配置 (生成用)
    const GEN_WIDTH = 300;
    const GEN_HEIGHT = 100;
    const FONT_STYLE = 'bold 50px sans-serif';

    // --- 核心矩阵库 (2x2) ---
    // 0 = 透明/白, 1 = 黑
    const PATTERNS_2 = [[1, 1, 0, 0], [0, 0, 1, 1], [1, 0, 1, 0], [0, 1, 0, 1], [1, 0, 0, 1], [0, 1, 1, 0]];
    const PATTERNS_3 = [[1, 1, 1, 0], [1, 1, 0, 1], [1, 0, 1, 1], [0, 1, 1, 1]];
    const PATTERN_4 = [1, 1, 1, 1];

    const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const complement = (p) => p.map(b => 1 - b);
    
    // --- 图像处理工具函数 ---

    // 1. 文本转二值化 Data
    function textToBinaryMap(text, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white'; ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = 'black'; ctx.font = FONT_STYLE;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);
        const data = ctx.getImageData(0, 0, width, height).data;
        const binaryMap = new Uint8Array(width * height);
        for (let i = 0; i < data.length; i += 4) {
            binaryMap[i / 4] = ((data[i] + data[i+1] + data[i+2]) / 3) < 128 ? 1 : 0; 
        }
        return binaryMap;
    }

    // 2. 生成分存图核心逻辑
    function generateShares(secretMap, cover1Map, cover2Map, width, height) {
        const outWidth = width * 2;
        const outHeight = height * 2;
        const bufA = new Uint8ClampedArray(outWidth * outHeight * 4);
        const bufB = new Uint8ClampedArray(outWidth * outHeight * 4);

        for (let i = 0; i < width * height; i++) {
            const s = secretMap[i], c1 = cover1Map[i], c2 = cover2Map[i];
            let b1, b2;

            if (s === 0) { // Secret=White
                if (c1 === 0 && c2 === 0) { const p = rand(PATTERNS_2); b1 = p; b2 = p; }
                else if (c1 === 1 && c2 === 0) { b1 = rand(PATTERNS_3); b2 = [...b1]; b2[b1.indexOf(1)] = 0; } // 简化的移除逻辑
                else if (c1 === 0 && c2 === 1) { b2 = rand(PATTERNS_3); b1 = [...b2]; b1[b2.indexOf(1)] = 0; }
                else { const p = rand(PATTERNS_3); b1 = p; b2 = p; }
            } else { // Secret=Black
                if (c1 === 0 && c2 === 0) { b1 = rand(PATTERNS_2); b2 = complement(b1); }
                else if (c1 === 1 && c2 === 0) { 
                    b1 = rand(PATTERNS_3); 
                    b2 = [0,0,0,0]; 
                    const z = b1.indexOf(0); b2[z] = 1; 
                    b2[(z+1)%4] = 1; // 随机选另一个点
                }
                else if (c1 === 0 && c2 === 1) {
                    b2 = rand(PATTERNS_3);
                    b1 = [0,0,0,0];
                    const z = b2.indexOf(0); b1[z] = 1;
                    b1[(z+1)%4] = 1;
                }
                else {
                    const k = Math.floor(Math.random()*4);
                    let j = (k + 1 + Math.floor(Math.random()*3)) % 4;
                    b1 = [1,1,1,1]; b1[k] = 0;
                    b2 = [1,1,1,1]; b2[j] = 0;
                }
            }
            writeBlock(bufA, i, width, outWidth, b1);
            writeBlock(bufB, i, width, outWidth, b2);
        }
        return { 
            imgDataA: new ImageData(bufA, outWidth, outHeight), 
            imgDataB: new ImageData(bufB, outWidth, outHeight) 
        };
    }

    function writeBlock(buffer, pixelIndex, srcWidth, destWidth, pattern) {
        const x = (pixelIndex % srcWidth) * 2;
        const y = Math.floor(pixelIndex / srcWidth) * 2;
        const coords = [[0,0], [1,0], [0,1], [1,1]];
        for (let i = 0; i < 4; i++) {
            const idx = ((y + coords[i][1]) * destWidth + (x + coords[i][0])) * 4;
            const isBlack = pattern[i] === 1;
            buffer[idx] = 0; buffer[idx+1] = 0; buffer[idx+2] = 0; buffer[idx+3] = isBlack ? 255 : 0; 
        }
    }

    // --- UI 与 交互逻辑 ---
    return {
        getHTML: () => `
            <div class="content-section">
                <h2>扩展视觉密码 (EVCS)</h2>
                
                <style>
                    .evcs-tabs { margin-bottom: 20px; border-bottom: 1px solid var(--current-border); padding-bottom: 10px; }
                    .evcs-tabs button { margin-right: 10px; }
                    .vcs-grid { display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; }
                    .vcs-card { text-align: center; background: var(--current-input-bg); padding: 10px; border-radius: 8px; border: 1px solid var(--current-border); max-width: 800px;}
                    .vcs-card label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9rem; }
                    .noise-canvas { border: 1px solid #ccc; background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="white"><rect width="5" height="5" fill="%23eee"/></svg>'); width: 100%; height: auto; image-rendering: pixelated; margin-bottom: 5px; }
                    .vcs-card.highlight { border-color: var(--primary-color); box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                </style>

                <div class="algo-brief">
                    <h3>算法简介</h3>
                    <p>EVCS 生成的两张分存图本身具有欺骗性的“掩盖含义”，叠加后才会显示真正的秘密。</p>
                </div>

                <div class="evcs-tabs">
                    <button class="btn btn-primary active" id="tab-evcs-enc">加密 (生成)</button>
                    <button class="btn btn-secondary" id="tab-evcs-dec">解密 (恢复)</button>
                </div>

                <div id="panel-evcs-enc" class="operation-panel">
                    <div class="form-group">
                        <label>1. 输入秘密文本 (Secret)</label>
                        <input type="text" id="evcs-text-secret" value="中山大学" maxlength="6">
                    </div>
                    <div class="form-group" style="display:flex; gap:10px;">
                        <div style="flex:1;">
                            <label>2. 输入掩盖文本 A</label>
                            <input type="text" id="evcs-text-c1" value="ABCD" maxlength="6">
                        </div>
                        <div style="flex:1;">
                            <label>3. 输入掩盖文本 B</label>
                            <input type="text" id="evcs-text-c2" value="6A0三" maxlength="6">
                        </div>
                    </div>
                    <button id="evcs-generate-btn" class="btn btn-primary">生成分存图</button>

                    <div id="evcs-result-area" class="visualization-area" style="display:none; margin-top:20px;">
                        <h4>生成结果</h4>
                        <div class="vcs-grid">
                            <div class="vcs-card">
                                <label>分存图 A</label>
                                <canvas id="cvs-share-a" class="noise-canvas"></canvas>
                                <button class="btn btn-secondary btn-xs" onclick="window.algorithms.evcs.download('cvs-share-a', 'share_A.png')">下载 A</button>
                            </div>
                            <div class="vcs-card">
                                <label>分存图 B</label>
                                <canvas id="cvs-share-b" class="noise-canvas"></canvas>
                                <button class="btn btn-secondary btn-xs" onclick="window.algorithms.evcs.download('cvs-share-b', 'share_B.png')">下载 B</button>
                            </div>
                            <div class="vcs-card highlight">
                                <label>自动叠加预览</label>
                                <canvas id="cvs-overlay" class="noise-canvas" style="background:white;"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="panel-evcs-dec" class="operation-panel" style="display:none;">
                    <p class="security-note">请上传之前生成的两张分存图（图片尺寸必须一致）。</p>
                    <div class="form-group">
                        <label>上传分存图 A</label>
                        <input type="file" id="evcs-upload-a" accept="image/*">
                    </div>
                    <div class="form-group">
                        <label>上传分存图 B</label>
                        <input type="file" id="evcs-upload-b" accept="image/*">
                    </div>
                    <button id="evcs-decrypt-btn" class="btn btn-primary">执行叠加恢复</button>

                    <div id="evcs-decrypt-result-area" class="visualization-area" style="display:none; text-align:center;">
                        <h4>恢复结果</h4>
                        <div class="vcs-card highlight" style="margin:0 auto;">
                            <canvas id="cvs-decrypt-result" class="noise-canvas" style="background:white;"></canvas>
                        </div>
                        <br>
                        <button class="btn btn-secondary" onclick="window.algorithms.evcs.download('cvs-decrypt-result', 'recovered_secret.png')">下载结果</button>
                    </div>
                </div>

                <h3>算法详细介绍</h3>
                <div id="algo-details-md" class="algo-details"></div>
            </div>
        `,
        download: (id, name) => {
            const cvs = document.getElementById(id);
            if(cvs) {
                const link = document.createElement('a');
                link.download = name; link.href = cvs.toDataURL(); link.click();
            }
        },
        init: async () => {
            const detailsContainer = document.getElementById('algo-details-md');
            if (detailsContainer && window.ALGO_CONTENT) {
                detailsContainer.innerHTML = window.ALGO_CONTENT.evcs || '暂无介绍';
            }

            // --- Tab 切换 ---
            const tabEnc = document.getElementById('tab-evcs-enc');
            const tabDec = document.getElementById('tab-evcs-dec');
            const panelEnc = document.getElementById('panel-evcs-enc');
            const panelDec = document.getElementById('panel-evcs-dec');

            function switchTab(t) {
                if (t === 'enc') {
                    panelEnc.style.display = 'block'; panelDec.style.display = 'none';
                    tabEnc.className = 'btn btn-primary active'; tabDec.className = 'btn btn-secondary';
                } else {
                    panelEnc.style.display = 'none'; panelDec.style.display = 'block';
                    tabDec.className = 'btn btn-primary active'; tabEnc.className = 'btn btn-secondary';
                }
            }
            tabEnc.onclick = () => switchTab('enc');
            tabDec.onclick = () => switchTab('dec');

            // --- 加密逻辑 ---
            document.getElementById('evcs-generate-btn').addEventListener('click', () => {
                const txtS = document.getElementById('evcs-text-secret').value || " ";
                const txt1 = document.getElementById('evcs-text-c1').value || " ";
                const txt2 = document.getElementById('evcs-text-c2').value || " ";

                const mapS = textToBinaryMap(txtS, GEN_WIDTH, GEN_HEIGHT);
                const map1 = textToBinaryMap(txt1, GEN_WIDTH, GEN_HEIGHT);
                const map2 = textToBinaryMap(txt2, GEN_WIDTH, GEN_HEIGHT);

                const { imgDataA, imgDataB } = generateShares(mapS, map1, map2, GEN_WIDTH, GEN_HEIGHT);

                const draw = (id, data) => {
                    const c = document.getElementById(id);
                    c.width = GEN_WIDTH * 2; c.height = GEN_HEIGHT * 2;
                    c.getContext('2d').putImageData(data, 0, 0);
                };
                draw('cvs-share-a', imgDataA);
                draw('cvs-share-b', imgDataB);

                // 生成叠加预览
                const cvsO = document.getElementById('cvs-overlay');
                cvsO.width = GEN_WIDTH * 2; cvsO.height = GEN_HEIGHT * 2;
                const ctxO = cvsO.getContext('2d');
                const outData = ctxO.createImageData(cvsO.width, cvsO.height);
                const dA = imgDataA.data;
                const dB = imgDataB.data;
                for(let i=0; i<dA.length; i+=4) {
                    // 只要有一个是黑(Alpha=255)，结果就是黑
                    const isBlack = (dA[i+3] > 128) || (dB[i+3] > 128);
                    outData.data[i] = 0; outData.data[i+1] = 0; outData.data[i+2] = 0;
                    outData.data[i+3] = isBlack ? 255 : 0;
                }
                ctxO.putImageData(outData, 0, 0);
                document.getElementById('evcs-result-area').style.display = 'block';
            });

            // --- 解密逻辑 ---
            document.getElementById('evcs-decrypt-btn').addEventListener('click', () => {
                const fileA = document.getElementById('evcs-upload-a').files[0];
                const fileB = document.getElementById('evcs-upload-b').files[0];
                if (!fileA || !fileB) { Utils.showAlert('请先上传两张图片'); return; }

                const loadImg = (f) => new Promise(r => {
                    const reader = new FileReader();
                    reader.onload = (e) => { const img = new Image(); img.onload=()=>r(img); img.src=e.target.result; };
                    reader.readAsDataURL(f);
                });

                Promise.all([loadImg(fileA), loadImg(fileB)]).then(([imgA, imgB]) => {
                    if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
                        Utils.showAlert('两张图片尺寸不一致，无法解密'); return;
                    }
                    const w = imgA.width; const h = imgA.height;
                    const cvs = document.getElementById('cvs-decrypt-result');
                    cvs.width = w; cvs.height = h;
                    const ctx = cvs.getContext('2d');

                    // 提取像素
                    const getBytes = (img) => {
                        const t = document.createElement('canvas'); t.width=w; t.height=h;
                        const tc = t.getContext('2d'); tc.drawImage(img,0,0);
                        return tc.getImageData(0,0,w,h).data;
                    };
                    const dA = getBytes(imgA);
                    const dB = getBytes(imgB);
                    const out = ctx.createImageData(w, h);

                    for (let i = 0; i < dA.length; i += 4) {
                        // 判定黑色: Alpha大 或者 RGB暗
                        const isBlackA = dA[i+3] > 128 && (dA[i] < 200);
                        const isBlackB = dB[i+3] > 128 && (dB[i] < 200);
                        // OR 运算
                        const resultBlack = isBlackA || isBlackB;
                        
                        out.data[i] = 0; out.data[i+1] = 0; out.data[i+2] = 0;
                        out.data[i+3] = resultBlack ? 255 : 0; // 黑字透明底(或配合背景色)
                    }
                    ctx.putImageData(out, 0, 0);
                    document.getElementById('evcs-decrypt-result-area').style.display = 'block';
                }).catch(e => {
                    console.error(e);
                    Utils.showAlert('图片读取失败');
                });
            });
        }
    };
})();