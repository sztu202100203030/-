// 初始化页面函数，加载后立即执行
function initializePage() {
    const privilegeSelector = document.getElementById("privilege-selector");
    const pendingExchangesContainer = document.getElementById("exchange-list");
    console.log("页面已加载，开始初始化...");

    // 获取管理员信息
    const isSuperAdmin = localStorage.getItem('isSuper') === '1'; // 是否是超级管理员
    let privileges = isSuperAdmin ? '图书' : localStorage.getItem('privileges'); // 获取权限，超级管理员默认显示 '图书'

    // 初始化权限选择器
    if (isSuperAdmin) {
        privilegeSelector.style.display = 'block'; // 显示权限选择器
        privilegeSelector.addEventListener('change', onPrivilegeChange);
    }

    // 加载待交接物资
    loadPendingExchanges(privileges);

    // 权限选择时处理
    function onPrivilegeChange(event) {
        privileges = event.target.value; // 更新选择的权限
        loadPendingExchanges(privileges); // 加载对应权限的待交接请求
    }
}

// 加载待交接请求列表
function loadPendingExchanges(privileges) {
    console.log(`加载 ${privileges} 类别的待交接请求...`);

    // 使用 api.js 中的 getPendingExchanges 函数获取数据
    getPendingExchanges(privileges)
        .then(pendingExchanges => {
            console.log(pendingExchanges);
            renderPendingExchanges(pendingExchanges); // 渲染请求列表
        })
        .catch(error => {
            console.error('获取待交接请求失败：', error);
        });
}

// 渲染请求列表
function renderPendingExchanges(exchanges) {
    const pendingExchangesContainer = document.getElementById("exchange-list");

    // 清空旧数据
    pendingExchangesContainer.innerHTML = '';

    // 如果没有待处理请求
    if (exchanges.length === 0) {
        pendingExchangesContainer.innerHTML = '<p>没有待处理的交接请求。</p>';
        return;
    }

    // 遍历每个请求并生成 HTML 内容
    exchanges.forEach(exchange => {
        const exchangeItem = document.createElement('div');
        exchangeItem.classList.add('exchange-item');

        exchangeItem.innerHTML = `
            <div class="exchange-item">
                <img src="${exchange.image_url}" alt="${exchange.name}" class="pe_item-image" />
                <div class="exchange-info">
                    <div class="info-item">
                        <span>请求用户邮箱：</span>
                        <span>${exchange.user_email}</span>
                    </div>
                    <div class="info-item">
                        <span>请求用户名称：</span>
                        <span>${exchange.username}</span>
                    </div>
                    <div class="info-item">
                        <span>物资名称：</span>
                        <span>${exchange.item_name}</span>
                    </div>
                    <div class="info-item">
                        <span>物资数量：</span>
                        <span>${exchange.borrow_quantity}</span>
                    </div>
                    <input placeholder="交接地点" data-id="${exchange.id}" class="location-input" />
                    <input placeholder="备注" data-id="${exchange.id}" class="remarks-input" />
                    <button class="exchange-button" data-id="${exchange.id}">物品出库</button>
                </div>
            </div>
        `;

        // 绑定处理交接的按钮事件
        exchangeItem.querySelector('.exchange-button').addEventListener('click', function() {
            handleExchangeing(exchange.id, exchange.borrow_quantity); // 确保传递的是 exchange.id
        });

        pendingExchangesContainer.appendChild(exchangeItem);
    });
}

// 处理交接物资
function handleExchangeing(approvalLogId,itemQuantity) {
    const exchangeLocationInput = document.querySelector(`.location-input[data-id="${approvalLogId}"]`);
    const remarksInput = document.querySelector(`.remarks-input[data-id="${approvalLogId}"]`);

    if (!exchangeLocationInput || !remarksInput) {
        console.error(`未找到与 approvalLogId: ${approvalLogId} 对应的输入框`);
        alert('交接地点或备注未填写或无效');
        return;
    }

    const exchangeLocation = exchangeLocationInput.value;
    const remarks = remarksInput.value;
    const adminEmail = localStorage.getItem('userEmail');

    const exchangeData = {
        approval_log_id: approvalLogId,
        admin_email: adminEmail,
        exchange_type: '出库',
        item_quantity: itemQuantity,
        exchange_location: exchangeLocation,
        remarks: remarks,
    };

    // 调用 api.js 中的 handleExchange 函数
    handleExchange(exchangeData) // 确保调用正确的函数
        .then(response => {
            console.log(response); // 调试输出
            if (response.success) {
                alert('交接成功'); // 显示成功消息
                loadPendingExchanges(localStorage.getItem('privileges')); // 成功后重新加载请求列表
            } else {
                alert(`交接失败：${response.message}`); // 显示错误信息
            }
        })
        .catch(error => {
            console.error('交接失败：', error);
            alert('交接过程中出现错误，请重试。');
        });
}
// 页面加载时调用 initializePage
initializePage();