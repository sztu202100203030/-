function initializePage() {
    const privilegeSelector = document.getElementById("privilege-selector");
    const privilegeSelectorContainer = document.getElementById('privilege-selector-container');
    let privileges = "图书"; // 默认值
    const isSuperAdmin = localStorage.getItem('isSuper') === '1'; // 判断是否是超级管理员

    // 初始化页面
    if (isSuperAdmin) {
        console.log("超级管理员登录");
        privilegeSelectorContainer.style.display = 'block'; // 超级管理员显示权限选择器
        privilegeSelector.addEventListener("change", function(event) {
            privileges = event.target.value;
            loadPendingReturns(privileges); // 使用新的 privileges 加载待处理请求
        });
    } else {
        privilegeSelectorContainer.style.display = 'none'; // 普通管理员隐藏权限选择器
        privileges = localStorage.getItem('privileges'); // 普通管理员从 localStorage 获取权限
    }

    // 初始化时加载待处理请求列表
    loadPendingReturns(privileges);
}

// 获取待处理归还请求列表
function loadPendingReturns(privileges) {
    console.log(`加载 ${privileges} 类别的待处理归还请求...`);

    getPendingReturns(privileges) // 调用 API 中的函数
        .then(pendingReturns => {
            renderPendingReturns(pendingReturns);
        })
        .catch(error => {
            console.error('获取待处理归还请求失败：', error);
        });
}

// 渲染请求列表的函数
function renderPendingReturns(pendingReturns) {
    const requestListContainer = document.getElementById('request-list');
    requestListContainer.innerHTML = ''; // 清空旧的请求列表

    if (!Array.isArray(pendingReturns) || pendingReturns.length === 0) {
        requestListContainer.innerHTML = '<p>没有待处理的归还请求。</p>';
        return;
    }

    pendingReturns.forEach(item => {
        const requestItem = document.createElement('div');
        requestItem.classList.add('request');
        requestItem.innerHTML = `
            <img src="${item.image_url}" alt="物资图片" class="item-image-pendingreturn" />
            <div>用户名称: ${item.user_username}</div>
            <div>用户邮箱: ${item.user_email}</div>
            <div>物资名称: ${item.item_name}</div>
            <div>归还数量: ${item.return_quantity}</div>
            <div>申请时间: ${item.return_date}</div>
            <button onclick="approveReturn(${item.id})">同意归还预约</button>
            <button onclick="rejectReturn(${item.id})">拒绝归还预约</button>
        `;
        requestListContainer.appendChild(requestItem);
    });
}

// 同意归还请求
function approveReturn(requestId) {
    const adminEmail = localStorage.getItem('userEmail');
    const data = {
        return_request_id: requestId,
        admin_email: adminEmail,
        approval_status: 'approved',
        privileges: document.getElementById('privilege-selector').value,
    };

    approveReturnRequest(data)
        .then(() => {
            console.log('成功同意归还请求:', requestId);
            loadPendingReturns(document.getElementById('privilege-selector').value);
        })
        .catch(error => {
            console.error('同意归还请求失败：', error);
        });
}

// 拒绝归还请求
function rejectReturn(requestId) {
    const adminEmail = localStorage.getItem('userEmail');
    const data = {
        return_request_id: requestId,
        admin_email: adminEmail,
        approval_status: 'rejected',
        privileges: document.getElementById('privilege-selector').value,
    };

    approveReturnRequest(data)
        .then(() => {
            console.log('成功拒绝归还请求:', requestId);
            loadPendingReturns(document.getElementById('privilege-selector').value);
        })
        .catch(error => {
            console.error('拒绝归还请求失败：', error);
        });
}

// 调用初始化函数
initializePage();