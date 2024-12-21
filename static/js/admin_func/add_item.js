
(function() {
    let privileges = '';
    let selectedPrivilege = '图书'; // 默认选择
    let isSuper = false; // 是否是超级管理员

    // 初始化页面
    function initializePage() {
        privileges = localStorage.getItem('privileges');
        isSuper = localStorage.getItem('isSuper') === '1'; // 获取是否为超级管理员
        console.log("初始化页面");

        // 如果是超级管理员，设置默认选择为'图书'
        if (isSuper) {
            selectedPrivilege = '图书';
        } else {
            selectedPrivilege = privileges; // 普通管理员的权限
        }

    // 显示权限选择器
    const privilegeSelector = document.getElementById('privilege-selectors');

    // 如果是超级管理员，显示选择框
    if (isSuper) {
        privilegeSelector.style.display = 'block';
        console.log("是超级管理员身份");
        privilegeSelector.addEventListener('change', onPrivilegeChange); // 确保添加事件监听器
        privilegeSelector.value = selectedPrivilege; // 设置默认选择
    } else {
        privilegeSelector.style.display = 'none'; // 普通管理员不显示选择器
    }


        // 更新字段显示，确保根据权限显示正确的字段
        updateFormFields();
    }

    // 处理权限选择变化
    function onPrivilegeChange(event) {
        console.log("Privilege selector changed"); // 调试信息
        selectedPrivilege = event.target.value;
        console.log(selectedPrivilege);
        updateFormFields();
    }


    // 更新表单字段的显示
    function updateFormFields() {
        const bookFields = document.querySelectorAll('.book-fields');
        const equipmentFields = document.querySelectorAll('.equipment-fields');
        const consumableFields = document.querySelectorAll('.consumables-fields');

        // 根据所选的物资类型显示相关字段
        bookFields.forEach(field => field.style.display = selectedPrivilege === '图书' ? 'block' : 'none');
        equipmentFields.forEach(field => field.style.display = selectedPrivilege === '设备' ? 'block' : 'none');
        consumableFields.forEach(field => field.style.display = selectedPrivilege === '耗材' ? 'block' : 'none');
    }

    // 设置表单提交
    function setupForm() {
        const form = document.getElementById('add-item-form');
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(form);
            const itemData = Object.fromEntries(formData.entries());

            // 合并表单和日期数据
            const requestData = {
                ...itemData,
                privileges: isSuper ? selectedPrivilege : privileges
            };

            addItem(requestData)
                .then(() => {
                    alert('添加成功');
                    window.history.back(); // 添加成功后返回上一页
                })
                .catch(error => {
                    console.error('添加物资失败：', error);
                    alert('添加失败');
                });
        });
    }

    // 页面加载时初始化

    window.initializePage = initializePage; // 将 initializePage 函数暴露到全局
    setupForm();
})();