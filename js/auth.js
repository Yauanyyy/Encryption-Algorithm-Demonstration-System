/**
 * js/auth.js
 * 用户认证与管理模块 (修改版：支持加盐哈希 & 演示用明文存储)
 */
class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('crypto_users')) || [];
        this.currentUser = JSON.parse(sessionStorage.getItem('crypto_currentUser'));

        // 如果本地存储没有用户，创建一个默认管理员账户
        if (this.users.length === 0) {
            this.initDefaultAdmin();
        }
    }

    async initDefaultAdmin() {
        // 演示环境初始化：
        // 盐值 = 用户名 (admin)
        // 密码原文 = admin
        // 哈希内容 = "admin" + "admin"
        const salt = 'admin';
        const password = 'admin'; 
        const hashedPassword = await Utils.sha256(salt + password);
        
        this.users.push({ 
            username: 'admin', 
            originalPassword: password, // 【新增】存储原文用于演示
            password: hashedPassword, 
            isAdmin: true 
        });
        localStorage.setItem('crypto_users', JSON.stringify(this.users));
        console.log("Default admin account created with salted hash.");
    }

    /**
     * 用户注册 (加盐 + 存储原文)
     */
    async register(username, password) {
        if (this.users.find(user => user.username === username)) {
            return { success: false, message: '用户名已存在' };
        }
        
        // 加盐哈希：用户名 + 密码
        const hashedPassword = await Utils.sha256(username + password);
        
        this.users.push({ 
            username, 
            originalPassword: password, // 【新增】存储原文
            password: hashedPassword, 
            isAdmin: true 
        });
        localStorage.setItem('crypto_users', JSON.stringify(this.users));
        
        return { success: true, message: '注册成功！请登录。' };
    }

    /**
     * 用户登录 (加盐验证)
     */
    async login(username, password) {
        const user = this.users.find(user => user.username === username);
        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        // 验证时使用同样的规则加盐
        const hashedPassword = await Utils.sha256(username + password);
        
        if (user.password === hashedPassword) {
            this.currentUser = { username: user.username, isAdmin: user.isAdmin };
            sessionStorage.setItem('crypto_currentUser', JSON.stringify(this.currentUser));
            return { success: true, message: '登录成功' };
        } else {
            return { success: false, message: '密码错误' };
        }
    }
    
    /**
     * 用户登出
     */
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('crypto_currentUser');
        location.reload();
    }

    /**
     * 检查是否已登录
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    /**
     * 获取当前用户信息
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * (管理员) 获取所有用户
     */
    getAllUsers() {
        if (this.currentUser && this.currentUser.isAdmin) {
            // 返回深拷贝以防止直接修改
            return JSON.parse(JSON.stringify(this.users));
        }
        return [];
    }

    /**
     * (管理员) 重置用户密码 (加盐 + 更新原文)
     */
    async resetPassword(username, newPassword) {
        if (!this.currentUser || !this.currentUser.isAdmin) {
            return { success: false, message: '权限不足' };
        }
        const user = this.users.find(u => u.username === username);
        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        // 【新增】更新哈希的同时，也要更新原文
        user.originalPassword = newPassword;
        user.password = await Utils.sha256(username + newPassword);
        
        localStorage.setItem('crypto_users', JSON.stringify(this.users));
        return { success: true, message: `用户 ${username} 的密码已重置。` };
    }

    /**
     * (管理员) 切换用户管理员权限
     */
    toggleAdmin(username) {
        if (!this.currentUser || !this.currentUser.isAdmin) {
            return { success: false, message: '权限不足' };
        }
        if (username === 'admin') {
             return { success: false, message: '不能修改初始管理员的权限。' };
        }
        const user = this.users.find(u => u.username === username);
        if (!user) {
            return { success: false, message: '用户不存在' };
        }
        user.isAdmin = !user.isAdmin;
        localStorage.setItem('crypto_users', JSON.stringify(this.users));
        return { success: true, message: `用户 ${username} 的权限已更新。` };
    }
}