function initializePage() {
    const privilegeSelector = document.getElementById("privilege-selector");
    const privilegeSelect = document.getElementById("privilege-select");
    const requestListContainer = document.getElementById("request-list");
    let privileges = "图书"; // 默认值
    const isSuperAdmin = localStorage.getItem('isSuper') === '1'; // 判断是否是超级管理员
    console.log(isSuperAdmin)
    // 初始化页面
    if (isSuperAdmin) {
        privilegeSelector.style.display = 'block'; // 超级管理员显示权限选择器
        privilegeSelect.addEventListener("change", function(event) {
            privileges = event.target.value;
            loadProcessedReturns(privileges); // 使用新的 privileges 加载已处理请求
        });
    } else {
        privileges = localStorage.getItem('privileges'); // 普通管理员从 localStorage 获取权限
    }

    // 初始化时加载已处理请求列表
    loadProcessedReturns(privileges);
}

// 获取已处理归还请求列表
function loadProcessedReturns(privileges) {
    console.log(`加载 ${privileges} 类别的已处理归还请求...`);

    getProcessedReturns(privileges) // 调用 API 中的函数
        .then(processedReturns => {
            renderProcessedReturns(processedReturns,privileges);
        })
        .catch(error => {
            console.error('获取已处理归还请求失败：', error);
        });
}

// 渲染请求列表的函数
function renderProcessedReturns(processedReturns,privileges) {
    const requestListContainer = document.getElementById("request-list");
    requestListContainer.innerHTML = ''; // 清空旧的请求列表

    if (!Array.isArray(processedReturns) || processedReturns.length === 0) {
        requestListContainer.innerHTML = '<p>没有已处理的归还请求。</p>';
        return;
    }
    console.log(processedReturns)
    processedReturns.forEach(item => {
        const requestItem = document.createElement('div');
        requestItem.classList.add('request-item');
        requestItem.innerHTML = `
            <img src="${item.image_url}" class="item-image" alt="物品图片" />
            <div>物资名称：${item.item_name}</div>
            <div>请求用户邮箱：${item.user_email}</div>
            <div>请求用户名称：${item.username}</div>
            <div>通过时间：${item.approval_timestamp}</div>
            <div>审批状态：${item.approval_status}</div>
            <button data-id="${item.return_request_id}" class="revoke-button">撤销</button>
        `;

        // 添加撤销按钮的事件监听
        requestItem.querySelector('.revoke-button').addEventListener('click', function () {
            const returnId = this.getAttribute('data-id');
            console.log(returnId);
            if (confirm("确定要撤销此请求吗？")) {
                revokeReturnHandler(returnId,privileges); // 处理撤销请求
            }
        });

        requestListContainer.appendChild(requestItem);
    });
}

// 处理撤销请求
function revokeReturnHandler(returnId,privileges) {
    revokeReturn(returnId)
        .then(() => {
            alert('请求已成功撤销');
            loadProcessedReturns(privileges); // 刷新请求列表
        })
        .catch(error => {
            console.error('撤销请求失败:', error);
            alert('撤销失败，请稍后重试');
        });
}

// 页面加载后立即执行初始化函数
initializePage();