// document.addEventListener('DOMContentLoaded', () => {
//     const privilegeSelector = document.getElementById('privilege-select');
//     const requestListContainer = document.getElementById('request-list');
//     let privileges = '图书'; // 默认选择图书
//     const isSuperAdmin = localStorage.getItem('isSuper') === '1';
//     console.log("页面已加载，开始初始化...");
//
//     // 页面初始化
//     if (isSuperAdmin) {
//         document.getElementById('privilege-selector').style.display = 'block';
//         privilegeSelector.addEventListener('change', onPrivilegeChange);
//     } else {
//         privileges = localStorage.getItem('privileges'); // 普通管理员
//     }
//
//     // 加载已处理请求列表
//     loadProcessedRequests(privileges);
//
//     // 处理权限切换事件
//     function onPrivilegeChange() {
//         privileges = privilegeSelector.value;
//         loadProcessedRequests(privileges);
//     }
//
//     // 获取并渲染已处理请求
//     function loadProcessedRequests(privileges) {
//         console.log(`加载 ${privileges} 类别的已处理请求...`);
//
//         // 调用API获取数据
//         getProcessedRequests(privileges)
//             .then(data => {
//                 renderProcessedRequests(data);
//             })
//             .catch(error => {
//                 console.error('加载请求列表时出错:', error);
//                 requestListContainer.innerHTML = '<p>加载失败，请稍后重试。</p>';
//             });
//     }
//
//     // 渲染请求列表
//     function renderProcessedRequests(requests) {
//         requestListContainer.innerHTML = ''; // 清空当前内容
//
//         if (requests.length === 0) {
//             requestListContainer.innerHTML = '<p>没有已处理的请求。</p>';
//             return;
//         }
//
//         // 生成并添加每个请求的HTML
//         requests.forEach(request => {
//             const requestItem = document.createElement('div');
//             requestItem.classList.add('request-item');
//
//             requestItem.innerHTML = `
//                 <img src="${request.image_url}" class="item-image" alt="物品图片" />
//                 <div>物资名称：${request.item_name}</div>
//                 <div>请求用户邮箱：${request.user_email}</div>
//                 <div>请求用户名称：${request.username}</div>
//                 <div>通过时间：${new Date(request.approval_timestamp).toLocaleString()}</div>
//                 <div>审批状态：${request.approval_status}</div>
//                 <button class="revoke-button" data-id="${request.request_id}">撤销</button>
//             `;
//
//             // 绑定撤销按钮事件
//             requestItem.querySelector('.revoke-button').addEventListener('click', function () {
//                 const requestId = this.getAttribute('data-id');
//                 if (confirm("确定要撤销此请求吗？")) {
//                     revokeRequestHandler(requestId);
//                 }
//             });
//
//             requestListContainer.appendChild(requestItem);
//         });
//     }
//
//     // 处理撤销请求
//     function revokeRequestHandler(requestId) {
//         revokeRequest(requestId)
//             .then(() => {
//                 alert('请求已成功撤销');
//                 loadProcessedRequests(privileges); // 重新加载请求列表
//             })
//             .catch(error => {
//                 console.error('撤销请求失败:', error);
//                 alert('撤销失败，请稍后重试');
//             });
//     }
// });
// 初始化页面函数，加载后立即执行
function initializePage() {
    const privilegeSelector = document.getElementById("privilege-select");
    const requestListContainer = document.getElementById("request-list");
    let privileges = "图书"; // 默认值
    console.log("页面已加载，开始初始化...");

    const isSuperAdmin = localStorage.getItem('isSuper') === '1'; // 判断是否是超级管理员

    // 初始化页面
    if (isSuperAdmin) {
        privilegeSelector.style.display = 'block'; // 超级管理员显示权限选择器
        privilegeSelector.addEventListener("change", function(event) {
            privileges = event.target.value;
            loadProcessedRequests(privileges); // 使用新的 privileges
        });
    } else {
        privileges = localStorage.getItem('privileges'); // 普通管理员从 localStorage 获取权限
    }

    // 初始化时加载已处理请求列表
    loadProcessedRequests(privileges);
}

// 加载已处理请求列表的函数
function loadProcessedRequests(privileges) {
    console.log(`加载 ${privileges} 类别的已处理请求...`);

    getProcessedRequests(privileges)
        .then(data => {
            renderProcessedRequests(data, privileges); // 传递 privileges
        })
        .catch(error => {
            console.error("加载请求列表时出错:", error);
            document.getElementById('request-list').innerHTML = '<p>加载失败，请稍后重试。</p>'; // 提示加载失败
        });
}

// 渲染请求列表的函数
function renderProcessedRequests(requests, privileges) { // 接收 privileges
    const requestListContainer = document.getElementById("request-list");
    requestListContainer.innerHTML = '';

    if (requests.length === 0) {
        requestListContainer.innerHTML = '<p>没有已处理的请求。</p>';
        return;
    }

    requests.forEach(request => {
        const requestItem = document.createElement('div');
        requestItem.classList.add('request-item');
        let statu;

        if (request.approval_status === 'rejected') {
            statu = "拒绝预约";
        } else if (request.approval_status === 'approved') {
            statu = "同意预约";
        }

        requestItem.innerHTML = `
            <img src="${request.image_url}" class="item-image" alt="物品图片" />
            <div>物资名称：${request.item_name}</div>
            <div>请求用户邮箱：${request.user_email}</div>
            <div>请求用户名称：${request.username}</div>
            <div>处理时间：${request.approval_timestamp}</div>
            <div>审批状态：${statu}</div>
            <button class="revoke-button" data-id="${request.request_id}">撤销</button>
        `;

        requestItem.querySelector('.revoke-button').addEventListener('click', function () {
            const requestId = this.getAttribute('data-id');
            if (confirm("确定要撤销此请求吗？")) {
                revokeRequestHandler(requestId, privileges); // 传递 privileges
            }
        });

        requestListContainer.appendChild(requestItem);
    });
}

// 处理撤销请求
function revokeRequestHandler(requestId, privileges) {
    revokeRequest(requestId)
        .then(() => {
            alert('请求已成功撤销');
            loadProcessedRequests(privileges); // 使用传递的 privileges
        })
        .catch(error => {
            console.error('撤销请求失败:', error);
            alert('撤销失败，请稍后重试');
        });
}

// 页面加载后立即执行初始化函数
initializePage();