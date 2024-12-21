(function() {
    let filePath = '';
    let fileName = '';
    let selectedPrivilege = '图书'; // 默认选择
    let isSuper = false; // 是否是超级管理员

    // 初始化页面
    function initializePage() {
        isSuper = localStorage.getItem('isSuper') === '1'; // 获取是否为超级管理员
        const privilegeSelector = document.getElementById('privilege-selector-import');

        if (isSuper) {
            privilegeSelector.style.display = 'block';
            privilegeSelector.addEventListener('change', onPrivilegeChange);
        } else {
            privilegeSelector.style.display = 'none'; // 普通管理员不显示选择器
        }

        document.getElementById('choose-file-button-import').addEventListener('click', chooseFile);
        document.getElementById('upload-button').addEventListener('click', uploadFiles);
    }

    // 处理权限选择变化
    function onPrivilegeChange(event) {
        selectedPrivilege = event.target.value;
        updatePrivilegeDisplay();
    }

    // 更新权限显示
    function updatePrivilegeDisplay() {
        document.getElementById('privilege-selector-import').value = selectedPrivilege;
    }

    // 选择文件
    function chooseFile() {
        document.getElementById('file-input').click();
        document.getElementById('file-input').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                filePath = file.path; // 处理路径
                fileName = file.name;
                document.getElementById('file-info').innerText = fileName;
                document.getElementById('upload-button').style.display = 'block'; // 显示上传按钮
            }
        });
    }

    // 上传文件
    function uploadFiles() {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];

        if (file) {
            uploadFile(file, selectedPrivilege)
                .then(() => {
                    alert('上传成功');
                    window.history.back(); // 上传成功后返回上一页
                })
                .catch(error => {
                    console.error('上传文件失败：', error);
                    alert('上传失败');
                });
        } else {
            alert('请选择文件后再上传');
        }
    }

    // 页面加载时初始化
    window.initializePage = initializePage; // 暴露 initializePage 函数到全局

    // 确保 DOM 加载后再初始化
    document.addEventListener('DOMContentLoaded', initializePage);
})();