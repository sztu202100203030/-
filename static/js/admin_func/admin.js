(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // 检查用户是否是超级管理员
        const isAdmin = localStorage.getItem('isAdmin');
        const isSuper = localStorage.getItem('isSuper') === '1';

        // console.log('isSuper:', isSuper);
        if (isAdmin !== '1' && isSuper !== '1') {
            window.location.replace('/');  // 使用 replace 直接跳转到登录页面
            return;  // 退出当前函数，避免执行后续代码
        }
        // 获取“增加用户”按钮
        const addUserButton = document.querySelector('.page-button[data-url="/add_user"]');
        // console.log('增加用户按钮:', addUserButton); // 检查按钮是否为 null

        // 确保按钮存在后再修改其样式
        if (addUserButton) {
            if (isSuper) {
                addUserButton.style.display = 'inline-block'; // 显示按钮
            } else {
                addUserButton.style.display = 'none'; // 隐藏按钮
            }
        } else {
            console.error('“增加用户”按钮未找到。请检查选择器是否正确。');
        }
    });
})();