// (function() {
//     const privilegeSelector = document.getElementById("privilege-selector");
//     const itemListContainer = document.getElementById("item-list");
//     const selectedPrivilege = document.getElementById("selected-privilege");
//
//     let items = []; // 管理员物资列表数据
//     let privileges = '';
//     let selectedPrivilegeValue = '图书'; // 默认选择
//     let isSuper = false; // 是否是超级管理员
//     console.log("调用了delete_item.js")
//     // 初始化页面
//     function initializePage() {
//         privileges = localStorage.getItem('privileges');
//         isSuper = localStorage.getItem('isSuper') === '1'; // 获取是否为超级管理员
//
//         if (isSuper) {
//             privilegeSelector.style.display = 'block';
//             privilegeSelector.innerHTML = `
//                 <option value="图书">图书</option>
//                 <option value="设备">设备</option>
//                 <option value="耗材">耗材</option>
//             `;
//             privilegeSelector.addEventListener('change', onPrivilegeChange);
//         }
//
//         selectedPrivilege.textContent = selectedPrivilegeValue;
//         loadItems();
//     }
//
//     // 加载物资列表
//     function loadItems() {
//         const privilegesToUse = isSuper ? selectedPrivilegeValue : privileges;
//         console.log(`加载物资，使用权限: ${privilegesToUse}`); // 添加调试信息
//         adminGetItems(privilegesToUse, isSuper)
//             .then(fetchedItems => {
//                 console.log('获取到的物资:', fetchedItems); // 打印获取到的物资
//                 items = fetchedItems;
//                 renderItems();
//             })
//             .catch(error => {
//                 console.error('获取物资列表失败：', error);
//             });
//     }
//
//     // 渲染物资列表
//     function renderItems() {
//         itemListContainer.innerHTML = ''; // 清空旧数据
//
//         if (items.length === 0) {
//             itemListContainer.innerHTML = '<p>没有物资可供管理。</p>';
//             return;
//         }
//
//         items.forEach(item => {
//             const itemDiv = document.createElement('div');
//             itemDiv.className = 'item';
//             itemDiv.innerHTML = `
//                 <img src="${item.image_url}" alt="${item.name}" class="item-image"/>
//                 <div>物资名称：${item.name}</div>
//                 <div>物资描述：${item.description}</div>
//                 <div>物资状态：${item.status}</div>
//                 <div>物资数量：${item.quantity}</div>
//                 <button class="delete-button" data-id="${item.id}">删除</button>
//                 <select class="status-selector" data-id="${item.id}">
//                     <option value="available" ${item.status === 'available' ? 'selected' : ''}>可用</option>
//                     <option value="unavailable" ${item.status === 'unavailable' ? 'selected' : ''}>不可用</option>
//                 </select>
//             `;
//
//             // 绑定事件
//             itemDiv.querySelector('.delete-button').addEventListener('click', () => {
//                 onDelete(item.id);
//             });
//
//             itemDiv.querySelector('.status-selector').addEventListener('change', function() {
//                 onUpdateStatus(item.id, this.value);
//             });
//
//             itemListContainer.appendChild(itemDiv);
//         });
//     }
//
//     // 处理下拉框选择变化
//     function onPrivilegeChange(event) {
//         selectedPrivilegeValue = event.target.value;
//         selectedPrivilege.textContent = selectedPrivilegeValue;
//         loadItems(); // 重新获取物资列表
//     }
//
//     // 删除物资的处理函数
//     function onDelete(itemId) {
//         deleteItem(itemId)
//             .then(() => {
//                 console.log('成功删除物资：', itemId);
//                 loadItems(); // 重新加载物资列表
//             })
//             .catch(error => {
//                 console.error('删除物资失败：', error);
//             });
//     }
//
//     // 更新物资状态的处理函数
//     function onUpdateStatus(itemId, newStatus) {
//         console.log(`Attempting to update item ${itemId} to status ${newStatus}`);
//
//         updateItemStatus(itemId, newStatus, selectedPrivilegeValue)
//             .then(response => {
//                 console.log('成功更新:', response);
//                 loadItems(); // 更新状态后重新获取物资列表
//             })
//             .catch(error => {
//                 console.error('更新状态失败：', error);
//             });
//     }
//
//     // 页面加载时调用
//     window.initializePage = initializePage; // 将 initializePage 函数暴露到全局
// })();
// function initializePage() {
//     const privilegeSelector = document.getElementById("privilege-selector");
//     const itemListContainer = document.getElementById("item-list");
//     const selectedPrivilege = document.getElementById("selected-privilege");
//
//     let items = []; // 管理员物资列表数据
//     let privileges = '';
//     let selectedPrivilegeValue = '图书'; // 默认选择
//     let isSuper = false; // 是否是超级管理员
//     console.log("调用了delete_item.js");
//
//     // 初始化页面
//     privileges = localStorage.getItem('privileges');
//     isSuper = localStorage.getItem('isSuper') === '1'; // 获取是否为超级管理员
//
//     if (isSuper) {
//         privilegeSelector.style.display = 'block';
//         privilegeSelector.innerHTML = `
//             <option value="图书">图书</option>
//             <option value="设备">设备</option>
//             <option value="耗材">耗材</option>
//         `;
//         privilegeSelector.addEventListener('change', onPrivilegeChange);
//     }
//
//     selectedPrivilege.textContent = selectedPrivilegeValue;
//     loadItems(); // 初始加载物资列表
// }
//
// // 加载物资列表
// function loadItems() {
//     const privilegesToUse = isSuper ? selectedPrivilegeValue : privileges;
//     console.log(`加载物资，使用权限: ${privilegesToUse}`); // 添加调试信息
//
//     adminGetItems(privilegesToUse, isSuper)
//         .then(fetchedItems => {
//             console.log('获取到的物资:', fetchedItems); // 打印获取到的物资
//             items = fetchedItems;
//             renderItems();
//         })
//         .catch(error => {
//             console.error('获取物资列表失败：', error);
//         });
// }
//
// // 渲染物资列表
// function renderItems() {
//     itemListContainer.innerHTML = ''; // 清空旧数据
//
//     if (items.length === 0) {
//         itemListContainer.innerHTML = '<p>没有物资可供管理。</p>';
//         return;
//     }
//
//     items.forEach(item => {
//         const itemDiv = document.createElement('div');
//         itemDiv.className = 'item';
//         itemDiv.innerHTML = `
//             <img src="${item.image_url}" alt="${item.name}" class="item-image"/>
//             <div>物资名称：${item.name}</div>
//             <div>物资描述：${item.description}</div>
//             <div>物资状态：${item.status}</div>
//             <div>物资数量：${item.quantity}</div>
//             <button class="delete-button" data-id="${item.id}">删除</button>
//             <select class="status-selector" data-id="${item.id}">
//                 <option value="available" ${item.status === 'available' ? 'selected' : ''}>可用</option>
//                 <option value="unavailable" ${item.status === 'unavailable' ? 'selected' : ''}>不可用</option>
//             </select>
//         `;
//
//         // 绑定事件
//         itemDiv.querySelector('.delete-button').addEventListener('click', () => {
//             onDelete(item.id);
//         });
//
//         itemDiv.querySelector('.status-selector').addEventListener('change', function() {
//             onUpdateStatus(item.id, this.value);
//         });
//
//         itemListContainer.appendChild(itemDiv);
//     });
// }
//
// // 处理下拉框选择变化
// function onPrivilegeChange(event) {
//     selectedPrivilegeValue = event.target.value;
//     selectedPrivilege.textContent = selectedPrivilegeValue;
//     loadItems(); // 重新获取物资列表
// }
//
// // 删除物资的处理函数
// function onDelete(itemId) {
//     deleteItem(itemId)
//         .then(() => {
//             console.log('成功删除物资：', itemId);
//             loadItems(); // 重新加载物资列表
//         })
//         .catch(error => {
//             console.error('删除物资失败：', error);
//         });
// }
//
// // 更新物资状态的处理函数
// function onUpdateStatus(itemId, newStatus) {
//     console.log(`Attempting to update item ${itemId} to status ${newStatus}`);
//
//     updateItemStatus(itemId, newStatus, selectedPrivilegeValue)
//         .then(response => {
//             console.log('成功更新:', response);
//             loadItems(); // 更新状态后重新获取物资列表
//         })
//         .catch(error => {
//             console.error('更新状态失败：', error);
//         });
// }
//
// // 调用初始化函数
// initializePage();
function initializePage() {
    // 在这里声明变量，确保每次调用都能重新初始化
    let items = []; // 管理员物资列表数据
    let privileges = '';
    let selectedPrivilegeValue = '图书'; // 默认选择
    let isSuper = false; // 是否是超级管理员

    console.log("调用了delete_item.js");

    // 初始化页面
    privileges = localStorage.getItem('privileges');
    isSuper = localStorage.getItem('isSuper') === '1'; // 获取是否为超级管理员

    const privilegeSelector = document.getElementById("privilege-selector");
    const itemListContainer = document.getElementById("item-list");
    const selectedPrivilege = document.getElementById("selected-privilege");

    if (isSuper) {
        privilegeSelector.style.display = 'block';
        privilegeSelector.innerHTML = `
            <option value="图书">图书</option>
            <option value="设备">设备</option>
            <option value="耗材">耗材</option>
        `;
        privilegeSelector.addEventListener('change', onPrivilegeChange);
    }

    selectedPrivilege.textContent = selectedPrivilegeValue;
    loadItems(); // 初始加载物资列表

    // 内部函数：加载物资列表
    function loadItems() {
        const privilegesToUse = isSuper ? selectedPrivilegeValue : privileges;
        console.log(`加载物资，使用权限: ${privilegesToUse}`); // 添加调试信息

        adminGetItems(privilegesToUse, isSuper)
            .then(fetchedItems => {
                console.log('获取到的物资:', fetchedItems); // 打印获取到的物资
                items = fetchedItems;
                renderItems();
            })
            .catch(error => {
                console.error('获取物资列表失败：', error);
            });
    }

    // 内部函数：渲染物资列表
    function renderItems() {
        itemListContainer.innerHTML = ''; // 清空旧数据

        if (items.length === 0) {
            itemListContainer.innerHTML = '<p>没有物资可供管理。</p>';
            return;
        }

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `
                <img src="${item.image_url}" alt="${item.name}" class="item-image"/>
                <div>物资名称：${item.name}</div>
                <div>物资描述：${item.description}</div>
                <div>物资状态：${item.status}</div>
                <div>物资数量：${item.quantity}</div>
                <button class="delete-button" data-id="${item.id}">删除</button>
                <select class="status-selector" data-id="${item.id}">
                    <option value="available" ${item.status === 'available' ? 'selected' : ''}>可用</option>
                    <option value="unavailable" ${item.status === 'unavailable' ? 'selected' : ''}>不可用</option>
                </select>
            `;

            // 绑定事件
            itemDiv.querySelector('.delete-button').addEventListener('click', () => {
                onDelete(item.id);
            });

            itemDiv.querySelector('.status-selector').addEventListener('change', function() {
                onUpdateStatus(item.id, this.value);
            });

            itemListContainer.appendChild(itemDiv);
        });
    }

    // 内部函数：处理下拉框选择变化
    function onPrivilegeChange(event) {
        selectedPrivilegeValue = event.target.value;
        selectedPrivilege.textContent = selectedPrivilegeValue;
        loadItems(); // 重新获取物资列表
    }

    // 内部函数：删除物资的处理函数
    function onDelete(itemId) {
        deleteItem(itemId)
            .then(() => {
                console.log('成功删除物资：', itemId);
                loadItems(); // 重新加载物资列表
            })
            .catch(error => {
                console.error('删除物资失败：', error);
            });
    }

    // 内部函数：更新物资状态的处理函数
    function onUpdateStatus(itemId, newStatus) {
        console.log(`Attempting to update item ${itemId} to status ${newStatus}`);

        updateItemStatus(itemId, newStatus, selectedPrivilegeValue)
            .then(response => {
                console.log('成功更新:', response);
                loadItems(); // 更新状态后重新获取物资列表
            })
            .catch(error => {
                console.error('更新状态失败：', error);
            });
    }
}

// 调用初始化函数
initializePage();