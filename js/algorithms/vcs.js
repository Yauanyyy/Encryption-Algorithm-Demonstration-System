/* js/algorithms/vcs.js */
window.algorithms.vcs = (() => {
    const MAX_WIDTH = 1000; // 限制处理宽度

    // --- 核心算法辅助函数 ---

    // 预处理：灰度化 + 二值化
    function binarizeImage(ctx, width, height, threshold = 128) {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const binaryMap = new Uint8Array(width * height);

        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            const isWhite = gray > threshold;
            binaryMap[i / 4] = isWhite ? 1 : 0;
            // 更新显示
            const val = isWhite ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = val;
            data[i + 3] = 255; // 确保不透明
        }
        ctx.putImageData(imgData, 0, 0);
        return binaryMap;
    }

    // 生成分存图
    function generateShares(binaryMap, width, height) {
        const newWidth = width * 2;
        const newHeight = height * 2;
        const shareA = new ImageData(newWidth, newHeight);
        const shareB = new ImageData(newWidth, newHeight);

        // 2x2 模式库: 1=黑, 0=透/白
        const patterns = [
            [1, 0, 0, 1], [0, 1, 1, 0], // 对角
            [1, 1, 0, 0], [0, 0, 1, 1], // 上下
            [1, 0, 1, 0], [0, 1, 0, 1]  // 左右
        ];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                const isWhite = binaryMap[idx] === 1;
                
                // 随机选择模式
                const pA = patterns[Math.floor(Math.random() * patterns.length)];
                // 若原像素白，则B与A相同；若黑，则B与A互补
                const pB = isWhite ? pA : pA.map(b => 1 - b);

                setBlock(shareA, x * 2, y * 2, newWidth, pA);
                setBlock(shareB, x * 2, y * 2, newWidth, pB);
            }
        }
        return { shareA, shareB };
    }

    function setBlock(imgData, x, y, width, pattern) {
        setPixel(imgData, x, y, width, pattern[0]);
        setPixel(imgData, x + 1, y, width, pattern[1]);
        setPixel(imgData, x, y + 1, width, pattern[2]);
        setPixel(imgData, x + 1, y + 1, width, pattern[3]);
    }

    function setPixel(imgData, x, y, width, isBlack) {
        const idx = (y * width + x) * 4;
        // 黑=全黑(Alpha255), 白=全透(Alpha0) 方便叠加
        imgData.data[idx] = 0;
        imgData.data[idx+1] = 0;
        imgData.data[idx+2] = 0;
        imgData.data[idx+3] = isBlack ? 255 : 0; 
    }

    // 下载 Canvas 图片辅助函数
    function downloadCanvas(canvasId, fileName) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        // 创建临时链接
        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // --- 界面与交互 ---

    return {
        getHTML: () => `
            <div class="content-section">
                <h2>视觉密码 (Visual Cryptography)</h2>
                
                <div class="algo-brief">
                    <h3>算法简介</h3>
                    <p>将一张图片加密为两张杂乱的噪点图。只有当两张图重叠时，才能通过人眼识别出原始信息。</p>
                </div>

                <div class="vcs-tabs">
                    <button class="btn btn-primary active" id="tab-encrypt">加密 (生成)</button>
                    <button class="btn btn-secondary" id="tab-decrypt">解密 (恢复)</button>
                </div>

                <div id="panel-encrypt" class="operation-panel">
                    <div class="form-group">
                        <label>1. 上传图片 (自动转换为黑白)</label>
                        <input type="file" id="vcs-upload" accept="image/*">
                    </div>
                    
                    <div id="vcs-preview-area" style="display:none; margin-top:1rem; text-align:center;">
                         <canvas id="canvas-original" style="border:1px solid #ccc; max-width:100%;"></canvas>
                         <br>
                         <button id="vcs-execute" class="btn btn-primary" style="margin-top:10px;">生成分存图</button>
                    </div>

                    <div id="vcs-result-area" class="visualization-area" style="display:none;">
                        <div class="vcs-grid">
                            <div class="vcs-card">
                                <label>分存图 A</label>
                                <canvas id="canvas-share-a" class="noise-canvas"></canvas>
                                <button class="btn btn-secondary btn-xs" onclick="window.algorithms.vcs.download('canvas-share-a', 'share_A.png')">下载 A</button>
                            </div>
                            <div class="vcs-card">
                                <label>分存图 B</label>
                                <canvas id="canvas-share-b" class="noise-canvas"></canvas>
                                <button class="btn btn-secondary btn-xs" onclick="window.algorithms.vcs.download('canvas-share-b', 'share_B.png')">下载 B</button>
                            </div>
                            <div class="vcs-card highlight">
                                <label>叠加预览</label>
                                <canvas id="canvas-overlay-preview" class="noise-canvas"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="panel-decrypt" class="operation-panel" style="display:none;">
                    <div class="form-group">
                        <label>上传分存图 A</label>
                        <input type="file" id="vcs-upload-a" accept="image/*">
                    </div>
                    <div class="form-group">
                        <label>上传分存图 B</label>
                        <input type="file" id="vcs-upload-b" accept="image/*">
                    </div>
                    <button id="vcs-decrypt-btn" class="btn btn-primary">执行叠加恢复</button>

                    <div id="vcs-decrypt-result" class="visualization-area" style="display:none; margin-top:20px; text-align:center;">
                        <h4>恢复结果</h4>
                        <canvas id="canvas-decrypt-result" class="noise-canvas"></canvas>
                        <br><br>
                        <button class="btn btn-secondary" onclick="window.algorithms.vcs.download('canvas-decrypt-result', 'recovered_image.png')">下载结果图片</button>
                    </div>
                </div>

                <style>
                    .vcs-tabs { margin-bottom: 20px; border-bottom: 1px solid var(--current-border); padding-bottom: 10px; }
                    .vcs-tabs button { margin-right: 10px; }
                    .vcs-grid { display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; }
                    .vcs-card { text-align: center; background: var(--current-input-bg); padding: 10px; border-radius: 8px; border: 1px solid var(--current-border); max-width: 500px;}
                    .vcs-card label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 0.9rem; }
                    .noise-canvas { border: 1px solid #ccc; background: white; width: 500px; height: auto; image-rendering: pixelated; margin-bottom: 5px; }
                    .vcs-card.highlight { border-color: var(--primary-color); box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                </style>

                <h3>算法详细介绍</h3>
                <div id="algo-details-md" class="algo-details"></div>
            </div>
        `,
        // 暴露给 HTML onclick 使用的下载函数
        download: downloadCanvas,

        init: () => {
            // 加载介绍文字
            const detailsContainer = document.getElementById('algo-details-md');
            if (detailsContainer && window.ALGO_CONTENT) {
                detailsContainer.innerHTML = window.ALGO_CONTENT.vcs || '内容加载失败';
            }

            // --- Tab 切换逻辑 ---
            const tabEnc = document.getElementById('tab-encrypt');
            const tabDec = document.getElementById('tab-decrypt');
            const panelEnc = document.getElementById('panel-encrypt');
            const panelDec = document.getElementById('panel-decrypt');

            function switchTab(mode) {
                if (mode === 'enc') {
                    panelEnc.style.display = 'block';
                    panelDec.style.display = 'none';
                    tabEnc.classList.add('active', 'btn-primary');
                    tabEnc.classList.remove('btn-secondary');
                    tabDec.classList.add('btn-secondary');
                    tabDec.classList.remove('active', 'btn-primary');
                } else {
                    panelEnc.style.display = 'none';
                    panelDec.style.display = 'block';
                    tabDec.classList.add('active', 'btn-primary');
                    tabDec.classList.remove('btn-secondary');
                    tabEnc.classList.add('btn-secondary');
                    tabEnc.classList.remove('active', 'btn-primary');
                }
            }
            tabEnc.onclick = () => switchTab('enc');
            tabDec.onclick = () => switchTab('dec');

            // --- 加密逻辑 ---
            const uploadInput = document.getElementById('vcs-upload');
            const canvasOrg = document.getElementById('canvas-original');
            const ctxOrg = canvasOrg.getContext('2d');
            let binaryData = null;

            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        let w = img.width;
                        let h = img.height;
                        if (w > MAX_WIDTH) {
                            h = Math.round(h * (MAX_WIDTH / w));
                            w = MAX_WIDTH;
                        }
                        canvasOrg.width = w;
                        canvasOrg.height = h;
                        ctxOrg.drawImage(img, 0, 0, w, h);
                        binaryData = binarizeImage(ctxOrg, w, h);
                        document.getElementById('vcs-preview-area').style.display = 'block';
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            });

            document.getElementById('vcs-execute').addEventListener('click', () => {
                if (!binaryData) return;
                const w = canvasOrg.width;
                const h = canvasOrg.height;
                const { shareA, shareB } = generateShares(binaryData, w, h);

                // 绘制 Share A
                const canvasA = document.getElementById('canvas-share-a');
                canvasA.width = w * 2; canvasA.height = h * 2;
                canvasA.getContext('2d').putImageData(shareA, 0, 0);

                // 绘制 Share B
                const canvasB = document.getElementById('canvas-share-b');
                canvasB.width = w * 2; canvasB.height = h * 2;
                canvasB.getContext('2d').putImageData(shareB, 0, 0);

                // 绘制 预览叠加 (模拟)
                const canvasPre = document.getElementById('canvas-overlay-preview');
                canvasPre.width = w * 2; canvasPre.height = h * 2;
                const ctxPre = canvasPre.getContext('2d');
                // 先画A
                ctxPre.putImageData(shareA, 0, 0);
                // 再画B (使用 multiply 混合模式模拟物理叠加)
                // 但由于我们ImageData里白是透明，所以直接画上去即可实现黑遮透
                // 不过为了保险起见，我们重新计算 ImageData 叠加
                const overlayData = new ImageData(w*2, h*2);
                for(let i=0; i<shareA.data.length; i+=4) {
                    // 只要有一个黑(Alpha255)，结果就黑
                    const isBlack = shareA.data[i+3] === 255 || shareB.data[i+3] === 255;
                    overlayData.data[i] = 0;
                    overlayData.data[i+1] = 0;
                    overlayData.data[i+2] = 0;
                    overlayData.data[i+3] = isBlack ? 255 : 0;
                }
                ctxPre.putImageData(overlayData, 0, 0);

                document.getElementById('vcs-result-area').style.display = 'block';
            });

            // --- 解密逻辑 ---
            document.getElementById('vcs-decrypt-btn').addEventListener('click', () => {
                const fileA = document.getElementById('vcs-upload-a').files[0];
                const fileB = document.getElementById('vcs-upload-b').files[0];

                if (!fileA || !fileB) {
                    Utils.showAlert('请先上传两张分存图');
                    return;
                }

                // 辅助：加载图片 Promise
                const loadImg = (file) => new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => resolve(img);
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                });

                Promise.all([loadImg(fileA), loadImg(fileB)]).then(([imgA, imgB]) => {
                    // 以第一张图尺寸为准
                    const w = imgA.width;
                    const h = imgA.height;

                    const canvasRes = document.getElementById('canvas-decrypt-result');
                    canvasRes.width = w;
                    canvasRes.height = h;
                    const ctx = canvasRes.getContext('2d');

                    // 创建临时 Canvas 提取像素数据
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = w; tempCanvas.height = h;
                    const tempCtx = tempCanvas.getContext('2d');

                    // 提取 A 数据
                    tempCtx.clearRect(0, 0, w, h);
                    tempCtx.drawImage(imgA, 0, 0, w, h);
                    const dataA = tempCtx.getImageData(0, 0, w, h).data;

                    // 提取 B 数据
                    tempCtx.clearRect(0, 0, w, h);
                    tempCtx.drawImage(imgB, 0, 0, w, h);
                    const dataB = tempCtx.getImageData(0, 0, w, h).data;

                    // 执行叠加
                    const resultImgData = ctx.createImageData(w, h);
                    for (let i = 0; i < dataA.length; i += 4) {
                        // 判断是否为“黑”。由于用户可能上传 JPG (白底黑字) 或 PNG (透底黑字)
                        // 我们认定：RGB很暗 或者 Alpha很大 且 RGB不亮 为黑
                        const isBlackA = dataA[i+3] > 128 && (dataA[i] < 128); 
                        const isBlackB = dataB[i+3] > 128 && (dataB[i] < 128);

                        // 逻辑或：有一个黑，结果就是黑
                        const resultBlack = isBlackA || isBlackB;

                        resultImgData.data[i] = 0;
                        resultImgData.data[i+1] = 0;
                        resultImgData.data[i+2] = 0;
                        // 结果图：黑=不透，白=透 (或者白=白色，看喜好，这里用白色方便查看)
                        resultImgData.data[i+3] = resultBlack ? 255 : 0; 
                    }
                    
                    // 为了让结果更清晰，把透明背景绘制成白色（可选）
                    // 这里保持透明，CSS里背景是白色，效果一样
                    ctx.putImageData(resultImgData, 0, 0);
                    
                    document.getElementById('vcs-decrypt-result').style.display = 'block';
                }).catch(err => {
                    console.error(err);
                    Utils.showAlert('图片处理出错，请确保上传的是有效的图片文件');
                });
            });
        }
    };
})();