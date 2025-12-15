/**
 * js/main.js
 */
document.addEventListener('DOMContentLoaded', () => {
    const auth = new Auth();
    new ThemeManager('theme-toggle-btn');

    const authOverlay = document.getElementById('auth-overlay');
    const appContainer = document.getElementById('app-container');
    const welcomeMessage = document.getElementById('welcome-message');
    const adminPanelBtn = document.getElementById('admin-panel-btn');

    // --- 登录/注册表单切换 ---
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form-container').style.display = 'none';
        document.getElementById('register-form-container').style.display = 'block';
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form-container').style.display = 'none';
        document.getElementById('login-form-container').style.display = 'block';
    });

    // --- 注册表单处理 ---
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            Utils.showAlert('两次输入的密码不一致');
            return;
        }
        
        const result = await auth.register(username, password);
        Utils.showAlert(result.message, result.success ? 'success' : 'error');
        if (result.success) {
            document.getElementById('show-login').click();
            document.getElementById('register-form').reset();
        }
    });

    // --- 登录表单处理 ---
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const result = await auth.login(username, password);
        if (result.success) {
            initializeApp();
        } else {
            Utils.showAlert(result.message);
        }
    });
    
    // --- 登出处理 ---
    document.getElementById('logout-btn').addEventListener('click', () => {
        auth.logout();
    });

    // --- 初始化应用 ---
    function initializeApp() {
        if (auth.isLoggedIn()) {
            const user = auth.getCurrentUser();
            authOverlay.classList.add('hidden');
            appContainer.classList.remove('hidden');
            welcomeMessage.textContent = `欢迎, ${user.username}`;
            if (user.isAdmin) {
                adminPanelBtn.classList.remove('hidden');
            }
            setupAdminPanel(auth);
            setupSidebar();
        } else {
            authOverlay.classList.remove('hidden');
            appContainer.classList.add('hidden');
        }
    }
    
    // --- 设置侧边栏导航 ---
    function setupSidebar() {
        const sidebarLinks = document.querySelectorAll('#sidebar a');
        const mainDisplay = document.getElementById('main-display');

        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                sidebarLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const algo = link.dataset.algo;
                loadAlgorithmContent(algo, mainDisplay);
            });
        });
    }

    // --- 加载算法内容 ---
    function loadAlgorithmContent(algoName, container) {
        const algo = window.algorithms[algoName];
        if (algo) {
            container.innerHTML = algo.getHTML();
            if (typeof algo.init === 'function') {
                algo.init();
            }
        } else {
            container.innerHTML = `<div class="content-section"><h2>算法未找到</h2><p>无法加载 ${algoName} 算法的演示。</p></div>`;
        }
    }
    
    // --- 管理员面板逻辑 ---
    function setupAdminPanel(auth) {
        const modal = document.getElementById('admin-modal');
        const btn = document.getElementById('admin-panel-btn');
        const span = document.getElementsByClassName('close-btn')[0];
        const searchInput = document.getElementById('user-search-input');

        btn.onclick = function() {
            populateUserTable(auth);
            modal.style.display = "block";
            searchInput.value = '';
            searchInput.focus();
        }
        span.onclick = function() {
            modal.style.display = "none";
        }
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
        searchInput.addEventListener('input', () => {
            populateUserTable(auth, searchInput.value.toLowerCase());
        });
    }

    // --- 填充用户表格 (核心修改：完整显示哈希 + 复制按钮) ---
    function populateUserTable(auth, searchTerm = '') {
        const tableBody = document.querySelector('#user-management-table tbody');
        tableBody.innerHTML = '';
        let users = auth.getAllUsers();
        
        if (searchTerm) {
            users = users.filter(user => user.username.toLowerCase().includes(searchTerm));
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            
            // 密码原文 (用于演示)
            const displayPassword = user.originalPassword 
                ? user.originalPassword 
                : '<span style="color:gray;font-style:italic">未知(旧数据)</span>';

            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.isAdmin ? '管理员' : '普通用户'}</td>
                
                <td style="font-family: monospace; color: var(--error-color); font-weight: bold;">
                    ${displayPassword}
                </td>
                
                <td class="password-hash-col">
                    <span>${user.password}</span>
                    <button class="btn btn-secondary btn-xs copy-hash-btn" data-hash="${user.password}" title="复制哈希值">复制</button>
                </td>
                
                <td>
                    <button class="btn btn-secondary reset-pwd-btn" data-username="${user.username}">重置密码</button>
                    ${user.username !== 'admin' ? `<button class="btn btn-secondary toggle-admin-btn" data-username="${user.username}">${user.isAdmin ? '撤销管理员' : '设为管理员'}</button>` : ''}
                </td>
            `;
            tableBody.appendChild(row);
        });

        // 重新绑定事件
        
        // 1. 绑定复制按钮事件
        tableBody.querySelectorAll('.copy-hash-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const hash = e.target.dataset.hash;
                Utils.copyToClipboard(hash);
            });
        });

        // 2. 绑定重置密码事件
        tableBody.querySelectorAll('.reset-pwd-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const username = e.target.dataset.username;
                const newPassword = prompt(`为用户 "${username}" 输入新密码:`);
                if (newPassword) {
                    const result = await auth.resetPassword(username, newPassword);
                    Utils.showAlert(result.message, result.success ? 'success' : 'error');
                    populateUserTable(auth, searchTerm); // 保持搜索结果
                }
            });
        });

        // 3. 绑定权限切换事件
        tableBody.querySelectorAll('.toggle-admin-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const username = e.target.dataset.username;
                if (confirm(`确定要更改用户 "${username}" 的管理员权限吗？`)) {
                    const result = auth.toggleAdmin(username);
                    Utils.showAlert(result.message, result.success ? 'success' : 'error');
                    populateUserTable(auth, searchTerm); // 保持搜索结果
                }
            });
        });
    }

    // 初始化检查
    initializeApp();
});