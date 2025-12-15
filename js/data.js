/**
 * js/data.js
 * 存放所有算法的详细介绍内容。
 * 整合了 docs/ 文件夹下的 Markdown 内容，并转换为 HTML 格式，
 * 解决本地运行时的跨域加载(CORS)问题，实现即开即用。
 */

const ALGO_CONTENT = {
    // --- 凯撒密码 (Caesar) ---
    caesar: `
        <div class="algo-section">
            <h3>历史背景</h3>
            <p>凯撒密码（Caesar cipher）是以古罗马统帅<strong>尤利乌斯·凯撒（Julius Caesar）</strong>命名的。据记载，凯撒在军事和政府通信中常用这种方法，将字母按固定偏移量（通常是 <code>3</code>）进行替换以保护信息。它旨在为当时的信使传递提供基本的保密性，虽然后来被证明极易破解，但它成为了研究替换密码与密码分析的教学典范。</p>
        </div>
        
        <div class="algo-section">
            <h3>原理</h3>
            <p>凯撒密码是一种最古老、最简单的<strong>单字母替换加密</strong>技术。加密时，将明文中的每个字母替换为字母表中其后第 N 位的字母，N 就是密钥（偏移量）。解密则是反向操作。</p>
            <p>例如，当偏移量为 <code>3</code> 时：
                <ul>
                    <li>明文: <code>A B C</code></li>
                    <li>密文: <code>D E F</code></li>
                </ul>
            </p>
        </div>

        <div class="algo-section">
            <h3>算法流程</h3>
            <ol>
                <li>获取明文和整数偏移量 <code>N</code>。</li>
                <li>遍历明文中的每个字符。</li>
                <li>如果字符是字母，则找到它在字母表中的位置 <code>P</code>。</li>
                <li>计算新位置 <code>P' = (P + N) mod 26</code>。</li>
                <li>新位置 <code>P'</code> 对应的字母即为密文字符。</li>
                <li>如果字符非字母（如空格），则保持不变。</li>
                <li>解密过程则是 <code>P' = (P - N + 26) mod 26</code>。</li>
            </ol>
        </div>

        <div class="algo-section">
            <h3>安全性分析</h3>
            <p>凯撒密码的安全性<strong>极低</strong>。由于密钥空间极小（仅 25 个可能的有效偏移量），攻击者可以通过<strong>穷举法（暴力破解）</strong>在瞬间尝试所有可能性并破解密文。此外，它也无法抵抗频率分析攻击。因此，它仅适用于教学演示，绝不能用于任何实际的安全通信。</p>
        </div>
    `,

    // --- 一次性密码本 (OTP) ---
    onetimepad: `
        <div class="algo-section">
            <h3>历史背景</h3>
            <p>一次性密码本的思想最早可追溯到 20 世纪初的电报加密实践。1917 年，Gilbert Vernam 在 AT&T 提出了一种基于按位异或的机电化加密方案。随后，信息论之父 <strong>Claude Shannon</strong> 在 1949 年从数学上证明了：在满足“密钥真正随机、与明文等长、且只使用一次”的条件下，该系统具有<strong>“完美保密性”</strong>。</p>
        </div>

        <div class="algo-section">
            <h3>原理</h3>
            <p>一次性密码本（One-Time Pad，OTP）是按位（或按字节）将明文与与之等长且真正随机的密钥流逐位做模 2 加（即 <strong>XOR 异或</strong>）的加密方法。</p>
        </div>

        <div class="algo-section">
            <h3>算法流程</h3>
            <ol>
                <li>生成与明文等长且<strong>真正随机</strong>的密钥流 <code>K</code>。</li>
                <li><strong>加密：</strong> 计算密文 <code>C = P XOR K</code>。</li>
                <li><strong>解密：</strong> 计算明文 <code>P = C XOR K</code>（利用异或的自反性）。</li>
                <li><strong>销毁：</strong> 密钥使用后必须立即销毁，绝不复用。</li>
            </ol>
        </div>

        <div class="algo-section">
            <h3>安全性分析</h3>
            <p>在理论上，OTP 是<strong>不可破解</strong>的（Unconditional Security）。因为对于任意一段密文，只要搭配不同的密钥，都可以还原出任何一种有意义的明文，攻击者无法判断哪一个是正确的。</p>
            <p><strong>现实局限：</strong> 在实际应用中，生成“真正随机”的大量密钥、安全地分发和存储这些与明文一样长的密钥是非常困难的。因此，OTP 主要用于极高机密性的场景（如热线电话）。</p>
        </div>
    `,

    // --- Playfair 密码 ---
    playfair: `
        <div class="algo-section">
            <h3>历史背景</h3>
            <p>Playfair 密码实际上由英国物理学家 <strong>Charles Wheatstone</strong> 在 1854 年发明，但以其推广者 Lord Playfair 的名字命名。它是历史上第一个实用的<strong>双字母替换密码</strong>（Digraph Substitution Cipher），曾被英国军队在布尔战争和第一次世界大战中使用。</p>
        </div>

        <div class="algo-section">
            <h3>原理</h3>
            <p>Playfair 密码基于一个 5x5 的字母矩阵（通常将 <code>I</code> 和 <code>J</code> 合并为一格）。与简单替换密码不同，它不是逐个替换字母，而是将明文拆分为<strong>字母对</strong>进行整体替换，从而破坏了单字母的频率特征。</p>
        </div>

        <div class="algo-section">
            <h3>算法流程</h3>
            <ol>
                <li><strong>构造矩阵：</strong> 将密钥去重后填入 5x5 矩阵的前部，剩余格子按字母表顺序填充（跳过已存在的字母，I/J 合并）。</li>
                <li><strong>预处理明文：</strong>
                    <ul>
                        <li>去除空格和标点。</li>
                        <li>将明文按两个字母一组分组。</li>
                        <li>若一组内的两个字母相同（如 "LL"），在中间插入填充字母（如 "X"）变成 "LX", "L..."。</li>
                        <li>若最后剩下一个单字，补一个填充字母。</li>
                    </ul>
                </li>
                <li><strong>替换规则（对每一组字母对）：</strong>
                    <ul>
                        <li><strong>同行：</strong> 替换为各自<strong>右侧</strong>的字母（循环）。</li>
                        <li><strong>同列：</strong> 替换为各自<strong>下方</strong>的字母（循环）。</li>
                        <li><strong>矩形：</strong> 替换为自己同行、但与对方同列的字母（即矩阵对角线互换）。</li>
                    </ul>
                </li>
            </ol>
        </div>

        <div class="algo-section">
            <h3>安全性分析</h3>
            <p>相比凯撒等单字母替换，Playfair 对频率分析有更好的抵抗力，因为它有 600 多种可能的字母对（26x26）。但是，它仍然保留了语言的某些统计特征（如常见的双字母组合 TH, HE），在有足够密文的情况下，现代计算机可以轻易破解它。</p>
        </div>
    `,

    // --- 流密码 (RC4) ---
    stream: `
        <div class="algo-section">
            <h3>历史背景</h3>
            <p>流密码的设计灵感来源于一次性密码本，但它使用“伪随机数生成器”来代替真随机密钥。<strong>RC4</strong> 是其中最著名的算法，由 Ron Rivest 于 1987 年设计。它曾被广泛用于 WEP（WiFi 加密）和 SSL/TLS 协议中，但后来因被发现存在统计偏差而逐渐被弃用。现代流密码推荐使用 ChaCha20。</p>
        </div>

        <div class="algo-section">
            <h3>原理</h3>
            <p>流密码通过一个种子密钥（Key）生成无限长的伪随机字节流（称为<strong>密钥流 Keystream</strong>）。加密过程就是将明文与密钥流进行逐字节的 <strong>XOR（异或）</strong>运算。</p>
        </div>

        <div class="algo-section">
            <h3>算法流程</h3>
            <ol>
                <li><strong>初始化 (KSA)：</strong> 使用用户密钥打乱一个包含 0-255 的状态数组 S。</li>
                <li><strong>生成密钥流 (PRGA)：</strong> 不断交换 S 数组中的元素，并输出伪随机字节 <code>K</code>。</li>
                <li><strong>加密/解密：</strong>
                    <ul>
                        <li>加密：<code>密文字节 = 明文字节 XOR K</code></li>
                        <li>解密：<code>明文字节 = 密文字节 XOR K</code></li>
                    </ul>
                </li>
            </ol>
        </div>

        <div class="algo-section">
            <h3>安全性分析</h3>
            <p>流密码的安全性完全依赖于密钥流的<strong>不可预测性</strong>。
            <br><strong>致命弱点：密钥重用。</strong> 如果使用相同的密钥（和相同的初始向量 IV）加密两条不同的消息，攻击者通过将两段密文异或（C1 XOR C2），就可以消除密钥流，得到（P1 XOR P2），从而极易还原出明文。因此，流密码必须配合唯一的 Nonce 或 IV 使用。</p>
        </div>
    `,

    // --- DES ---
    des: `
        <div class="algo-section">
            <h3>历史背景</h3>
            <p><strong>数据加密标准（DES）</strong>是由 IBM 在 1970 年代基于 Lucifer 算法开发的。1977 年，它被美国国家标准局（NBS）采纳为联邦信息处理标准。DES 是密码学历史上具有里程碑意义的算法，确立了现代对称密码的设计范式。</p>
        </div>

        <div class="algo-section">
            <h3>原理</h3>
            <p>DES 是一种分组密码，采用 <strong>Feistel 网络结构</strong>。它将明文分为 64 位的数据块，使用 56 位的有效密钥，进行 16 轮的迭代变换。每一轮都包含置换、代换（S盒）和异或操作。</p>
        </div>

        <div class="algo-section">
            <h3>算法流程</h3>
            <ol>
                <li><strong>初始置换 (IP)：</strong> 打乱 64 位明文块的顺序。</li>
                <li><strong>16 轮迭代：</strong>
                    <ul>
                        <li>将数据分为左右两半 (L, R)。</li>
                        <li>右半部分 R 经过扩展置换、与子密钥异或、S盒压缩、P盒置换后，与左半部分 L 异或。</li>
                        <li>左右交换，进入下一轮。</li>
                    </ul>
                </li>
                <li><strong>逆初始置换 (IP-1)：</strong> 输出最终密文。</li>
            </ol>
        </div>

        <div class="algo-section">
            <h3>安全性分析</h3>
            <p>DES 的最大弱点是<strong>密钥太短</strong>（仅 56 位）。这意味着密钥空间只有约 7.2 x 10<sup>16</sup>。随着计算机算力的提升，现代计算机可以在几小时内暴力破解 DES。因此，DES 已被认为不再安全，现在通常使用它的增强版 <strong>3DES</strong> 或被 <strong>AES</strong> 取代。</p>
        </div>
    `,

    // --- AES ---
    aes: `
        <div class="algo-section">
            <h3>历史背景</h3>
            <p>由于 DES 的安全性下降，NIST 在 1997 年发起了新一代加密标准的竞赛。比利时密码学家 Joan Daemen 和 Vincent Rijmen 设计的 <strong>Rijndael</strong> 算法最终胜出。2001 年，它被正式发布为<strong>高级加密标准（AES）</strong>。</p>
        </div>

        <div class="algo-section">
            <h3>原理</h3>
            <p>AES 是一种基于<strong>代换-置换网络（SPN）</strong>的分组密码。它处理 128 位的数据块，支持 128、192 或 256 位的密钥长度。与 DES 的 Feistel 结构不同，AES 的每一轮变换都并行作用于整个数据块。</p>
        </div>

        <div class="algo-section">
            <h3>算法流程（以 AES-128 为例，共 10 轮）</h3>
            <ol>
                <li><strong>初始轮：</strong> 轮密钥加（AddRoundKey）。</li>
                <li><strong>普通轮（9 轮）：</strong>
                    <ul>
                        <li><strong>字节代换 (SubBytes)：</strong> 使用 S 盒进行非线性替换。</li>
                        <li><strong>行移位 (ShiftRows)：</strong> 每一行进行不同偏移量的循环左移。</li>
                        <li><strong>列混合 (MixColumns)：</strong> 对每一列进行矩阵乘法（线性变换）。</li>
                        <li><strong>轮密钥加 (AddRoundKey)：</strong> 与生成的轮密钥进行异或。</li>
                    </ul>
                </li>
                <li><strong>最终轮：</strong> 包含 SubBytes, ShiftRows 和 AddRoundKey（无列混合）。</li>
            </ol>
        </div>

        <div class="algo-section">
            <h3>安全性分析</h3>
            <p>AES 目前被认为是极度安全的。对于 128 位密钥，暴力破解需要尝试 3.4 x 10<sup>38</sup> 次，这在现有物理原理下几乎是不可能的。AES 是目前全球金融、政府和商业领域保护机密数据的首选标准。</p>
        </div>
    `,

    // --- 视觉密码 (VCS) ---
    vcs: `
        <div class="algo-section">
            <h3>历史背景</h3>
            <p>视觉密码方案（Visual Cryptography Scheme, VCS）由 Moni Naor 和 Adi Shamir 在 1994 年的欧洲密码年会（Eurocrypt）上首次提出。这是一种颠覆性的加密思想：解密过程<strong>不需要任何数学计算</strong>，甚至不需要计算机，仅依靠人类的视觉系统就能完成。</p>
        </div>
        
        <div class="algo-section">
            <h3>原理</h3>
            <p>该算法的核心思想是<strong>像素扩展（Pixel Expansion）</strong>。我们将原始图像中的每一个像素点，加密（拆分）为 n 张分存图（Shares）上的子像素块。
            <br>以本系统演示的经典 <strong>(2, 2) 方案</strong>为例：</p>
            <ul>
                <li><strong>加密过程：</strong> 每个原图像素被扩展为一个 <strong>2×2</strong> 的黑白子像素矩阵。
                    <ul>
                        <li>如果原像素是<strong>白色</strong>：Share A 和 Share B 获得<strong>相同</strong>的子像素块模式。</li>
                        <li>如果原像素是<strong>黑色</strong>：Share A 和 Share B 获得<strong>互补</strong>（相反）的子像素块模式。</li>
                    </ul>
                </li>
                <li><strong>解密过程：</strong> 将 Share A 和 Share B 打印在透明胶片上并物理重叠。
                    <ul>
                        <li>相同块重叠 → 依然透光（视觉上呈现灰色/白色）。</li>
                        <li>互补块重叠 → 完全遮挡（视觉上呈现全黑）。</li>
                    </ul>
                </li>
            </ul>
        </div>

        <div class="algo-section">
            <h3>特点与安全性</h3>
            <ol>
                <li><strong>完美保密性：</strong> 单独查看任何一张分存图，看到的只是符合随机分布的杂乱噪点，无法获取原图的任何信息（即使拥有无穷大的计算能力）。</li>
                <li><strong>解密便捷：</strong> 物理叠加即可，无需复杂的密钥管理或计算设备。</li>
                <li><strong>代价：</strong> 恢复出的图像会有<strong>对比度损失</strong>（白色区域变成了半透光的灰色），且图像尺寸会变大（因为进行了 2×2 的扩展）。</li>
            </ol>
        </div>
    `
};

// 挂载到 window 对象，确保全局可访问
window.ALGO_CONTENT = ALGO_CONTENT;