(function() {
    // 页面数据和状态管理
    let email = '';
    let username = '';
    let password = '';
    let issuper = '';
    let permissions = ['图书', '耗材', '设备']; // 权限选项
    let permissionIndex = 0; // 当前选定的权限索引

    // 处理输入框变化的函数
    function handleInputChange(e, field) {
        if (field === 'email') {
            email = e.target.value;
        } else if (field === 'username') {
            username = e.target.value;
        } else if (field === 'password') {
            password = e.target.value;
        } else if (field === 'issuper') {
            issuper = e.target.value;
        }
    }

    // 处理权限选择的函数
    function handlePermissionChange(e) {
        permissionIndex = e.target.value;
    }

    // 添加用户的函数
    function addUsers() {
        if (!email || !username || !password) {
            alert('请填写所有必填项');
            return;
        }

        const userData = {
            email,
            username,
            password,
            issuper,
            permission: issuper === '0' ? permissions[permissionIndex] : null // 如果是超级管理员则不需要权限
        };

        // 调用api.js中的函数与后端通信
        addUser(userData)
            .then(() => {
                alert('用户添加成功');
                // 返回上一页或者重置页面
                initializePage(); // 可以在成功后重置页面数据
            })
            .catch((err) => {
                alert(`添加用户失败: ${err.message}`);
            });
    }

    // 切换到增加用户模式
    function showAddUserForm() {
        document.getElementById('issuper-group').style.display = 'none';
        document.getElementById('permission-selector-container').style.display = 'none';
    }

    // 切换到增加管理员模式
    function showAddAdminForm() {
        document.getElementById('issuper-group').style.display = 'block';
        document.getElementById('permission-selector-container').style.display = 'block';
    }

    // 初始化页面的函数
    function initializePage() {
        showAddUserForm(); // 默认显示增加用户表单
        document.getElementById('email').addEventListener('input', (e) => handleInputChange(e, 'email'));
        document.getElementById('username').addEventListener('input', (e) => handleInputChange(e, 'username'));
        document.getElementById('password').addEventListener('input', (e) => handleInputChange(e, 'password'));
        document.getElementById('issuper').addEventListener('input', (e) => handleInputChange(e, 'issuper'));
        document.getElementById('permissions').addEventListener('change', handlePermissionChange);
        document.getElementById('submit').addEventListener('click', addUsers);
    }

    // 事件监听
    document.getElementById('add-user-btn').addEventListener('click', showAddUserForm);
    document.getElementById('add-admin-btn').addEventListener('click', showAddAdminForm);

    // 将 initializePage 暴露为全局函数，以便导航栏调用
    window.initializePage = initializePage;
})();
