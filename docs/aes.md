### 算法详细介绍

**历史背景：**
AES 源自比利时密码学家 Joan Daemen 与 Vincent Rijmen 在 1998 年提出的密码算法 Rijndael。美国国家标准与技术研究院（NIST）在 1997 年发起新分组加密标准的公开竞赛以替代已逐渐显露弱点的 DES；Rijndael 在经过公开评审后，于 2000 年被 NIST 采纳并命名为 AES（Advanced Encryption Standard）。设计目标包括在多种硬件/软件平台上实现高效、安全且易于实现的对称分组加密。

**原理：**
AES（Advanced Encryption Standard，先进加密标准）是一种对称分组密码，基于置换-替换网络（SPN）。AES 对 128 位的数据块进行加密，密钥长度可为 `128`、`192` 或 `256` 位，分别对应不同轮数（`Nr`）。每轮由字节替代（SubBytes）、行移位（ShiftRows）、列混合（MixColumns）和轮密钥加（AddRoundKey）等操作组成（最后一轮省略 MixColumns）。

**流程：**
1. 输入：一个 128 位明文块和一个密钥（128/192/256 位）。
2. 扩展密钥（Key Expansion）生成 `Nr+1` 个轮密钥。
3. 初始轮：对状态执行 `AddRoundKey`（与第 0 轮轮密钥异或）。
4. 对于轮 `1..Nr-1`，依次执行：
	- `SubBytes`：对每个字节应用 S 盒替换。
	- `ShiftRows`：按行循环移位（行内字节位移不同）。
	- `MixColumns`：按列做线性混合（有限域 GF(2^8) 上多项式乘法）。
	- `AddRoundKey`：与当前轮的轮密钥异或。
5. 最后一轮（轮 `Nr`）只执行 `SubBytes`、`ShiftRows`、`AddRoundKey`（不做 `MixColumns`）。
6. 输出为密文块。解密过程按逆顺序使用逆变换 `InvSubBytes`、`InvShiftRows`、`InvMixColumns` 和相应轮密钥。

**安全性分析：**
AES 在广泛分析后被认为在实用密钥长度下是安全的（目前没有已知可行的公开数学攻击能在不穷举密钥的情况下破解 AES）。实际风险主要来自实现或使用层面：
- **实现侧信道攻击**（如时序或功耗分析）可能泄露密钥。
- **不安全的分组模式**（例如直接使用 `ECB`）会泄露数据模式。
- **密钥管理不当**（弱密钥、密钥重用、IV 管理错误）会降低安全性。

推荐遵循最佳实践：使用 `AES-GCM` 等带认证的加密模式或在分组模式中正确使用随机 IV 与认证（如 `CBC` + HMAC 或直接使用 AEAD）。

