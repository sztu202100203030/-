
function initializePage() {
    const privilegeSelector = document.getElementById("privilege-selector");
    const privilegeSelectorContainer = document.getElementById('privilege-selector-container');
    let privileges = "图书"; // 默认值
    const isSuperAdmin = localStorage.getItem('isSuper') === '1'; // 判断是否是超级管理员

    // 初始化页面
    if (isSuperAdmin) {
        console.log("超级管理员登录")
        privilegeSelectorContainer.style.display = 'block'; // 超级管理员显示权限选择器
        privilegeSelector.addEventListener("change", function(event) {
            privileges = event.target.value;
            loadPendingRequests(privileges); // 使用新的 privileges 加载待处理请求
        });
    } else {
        privilegeSelectorContainer.style.display = 'none'; // 普通管理员隐藏权限选择器
        privileges = localStorage.getItem('privileges'); // 普通管理员从 localStorage 获取权限
    }

    // 初始化时加载待处理请求列表
    loadPendingRequests(privileges);
}

// 获取待处理请求列表
function loadPendingRequests(privileges) {
    console.log(`加载 ${privileges} 类别的待处理请求...`);

    // 调用 API 函数获取请求
    getPendingRequests(privileges) // 调用 API 中的函数
        .then(requests => {
            renderPendingRequests(requests);
        })
        .catch(error => {
            console.error('获取待处理请求失败：', error);
        });
}

// 渲染请求列表的函数
function renderPendingRequests(requests) {
    const requestListContainer = document.getElementById('request-list');
    requestListContainer.innerHTML = ''; // 清空旧的请求列表

    if (!Array.isArray(requests) || requests.length === 0) {
        requestListContainer.innerHTML = '<p>没有待处理的请求。</p>';
        return;
    }

    requests.forEach(request => {
        const requestItem = document.createElement('div');
        requestItem.classList.add('request-item');
        requestItem.innerHTML = `
            <img src="${request.image_url}" alt="${request.name}" class="item-image" />
            <div>请求用户email：${request.user_email}</div>
            <div>请求用户名称：${request.username}</div>
            <div>物资名称：${request.name}</div>
            <div>请求数量：${request.borrow_quantity}</div>
            <div>借用天数：${request.borrow_duration}</div>
            <div>请求时间：${request.bookingtimestamp}</div>
            <button onclick="onApprove(${request.id})">同意借物预约</button>
            <button onclick="onReject(${request.id})">拒绝借物预约</button>
        `;
        requestListContainer.appendChild(requestItem);
    });
}

// 审批请求的函数
function onApprove(requestId) {
    const adminEmail = localStorage.getItem('userEmail');
    const approvalReason = '同意借物预约';
    console.log('Approving request with ID:', requestId);

    approveRequest(requestId, adminEmail, approvalReason)
        .then(() => {
            console.log('Successfully approved request:', requestId);
            loadPendingRequests(document.getElementById('privilege-selector').value);
        })
        .catch(error => {
            console.error('Failed to approve request:', error);
        });
}

// 拒绝请求的函数
function onReject(requestId) {
    const adminEmail = localStorage.getItem('userEmail');
    const approvalReason = '拒绝借物预约';
    console.log('Rejecting request with ID:', requestId);

    rejectRequest(requestId, adminEmail, approvalReason)
        .then(() => {
            console.log('Successfully rejected request:', requestId);
            loadPendingRequests(document.getElementById('privilege-selector').value);
        })
        .catch(error => {
            console.error('Failed to reject request:', error);
        });
}

// 调用初始化函数
initializePage();
