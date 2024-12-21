// 初始化页面函数
function initializePage() {
    const privilegeSelector = document.getElementById("privilege-selector");
    const pendingReturnsContainer = document.getElementById("pending-returns");
    console.log("页面已加载，开始初始化...");

    // 获取管理员信息
    const isSuperAdmin = localStorage.getItem('isSuper') === '1'; // 是否是超级管理员
    let privileges = isSuperAdmin ? '图书' : localStorage.getItem('privileges'); // 获取权限，超级管理员默认显示 '图书'

    // 初始化权限选择器
    if (isSuperAdmin) {
        privilegeSelector.style.display = 'block'; // 显示权限选择器
        privilegeSelector.addEventListener('change', onPrivilegeChange);
    }

    // 加载待交接归还物资
    loadPendingReturns(privileges);

    // 权限选择时处理
    function onPrivilegeChange(event) {
        privileges = event.target.value; // 更新选择的权限
        loadPendingReturns(privileges); // 加载对应权限的待交接请求
    }
}

// 加载待交接归还请求列表
function loadPendingReturns(privileges) {
    console.log(`加载 ${privileges} 类别的待交接归还请求...`);

    // 使用 api.js 中的 getPendingReturnsExchanges 函数获取数据
    getPendingReturnsExchanges(privileges)
        .then(pendingReturns => {
            console.log(pendingReturns);
            renderPendingReturns(pendingReturns); // 渲染请求列表
        })
        .catch(error => {
            console.error('获取待交接归还请求失败：', error);
        });
}

// 渲染待交接归还请求列表
function renderPendingReturns(pendingReturns) {
    const pendingReturnsContainer = document.getElementById("pending-returns");

    // 清空旧数据
    pendingReturnsContainer.innerHTML = '';

    // 如果没有待处理请求
    if (pendingReturns.length === 0) {
        pendingReturnsContainer.innerHTML = '<p>没有待处理的归还请求。</p>';
        return;
    }

    // 遍历每个请求并生成 HTML 内容
    pendingReturns.forEach(item => {
        const requestItem = document.createElement('div');
        requestItem.classList.add('request');

        requestItem.innerHTML = `
            <img src="${item.image_url}" alt="物资图片" />
            <div>请求用户邮箱: ${item.user_email}</div>
            <div>请求用户名称: ${item.username}</div>
            <div>管理员邮箱: ${item.admin_email}</div>
            <div>管理员名称: ${item.admin_username}</div>
            <div>物资名称: ${item.item_name}</div>
            <div>物资数量: ${item.return_quantity}</div>
            <input placeholder="损耗情况" data-id="${item.id}" class="condition-input" />
            <input placeholder="交接地点" data-id="${item.id}" class="location-input" />
            <input placeholder="备注" data-id="${item.id}" class="remarks-input" />
            <button class="return-button" data-id="${item.id}">物品入库</button>
        `;

        // 绑定处理归还的按钮事件
        requestItem.querySelector('.return-button').addEventListener('click', function() {
            handleReturnExchangeing(item.id, item.return_quantity);
        });

        pendingReturnsContainer.appendChild(requestItem);
    });
}

// 处理归还物资
function handleReturnExchangeing(returnApprovalLogId, returnQuantity) {
    const itemConditionInput = document.querySelector(`.condition-input[data-id="${returnApprovalLogId}"]`);
    const exchangeLocationInput = document.querySelector(`.location-input[data-id="${returnApprovalLogId}"]`);
    const remarksInput = document.querySelector(`.remarks-input[data-id="${returnApprovalLogId}"]`);

    if (!itemConditionInput || !exchangeLocationInput || !remarksInput) {
        console.error(`未找到与 returnApprovalLogId: ${returnApprovalLogId} 对应的输入框`);
        alert('损耗情况、交接地点或备注未填写或无效');
        return;
    }

    const itemCondition = itemConditionInput.value;
    const exchangeLocation = exchangeLocationInput.value;
    const remarks = remarksInput.value;
    const adminEmail = localStorage.getItem('userEmail');

    const exchangeData = {
        return_approval_log_id: returnApprovalLogId,
        admin_email: adminEmail,
        return_quantity: returnQuantity,
        item_condition: itemCondition,
        exchange_location: exchangeLocation,
        remarks: remarks,
    };

    // 调用 api.js 中的 handleReturnExchange 函数
    handleReturnExchange(exchangeData)
        .then(response => {
            console.log(response); // 调试输出
            if (response.success) {
                alert('归还交接成功'); // 显示成功消息
                loadPendingReturns(localStorage.getItem('privileges')); // 成功后重新加载请求列表
            } else {
                alert(`归还交接失败：${response.message}`); // 显示错误信息
            }
        })
        .catch(error => {
            console.error('归还交接失败：', error);
            alert('归还交接过程中出现错误，请重试。');
        });
}

// 页面加载时调用 initializePage
initializePage();