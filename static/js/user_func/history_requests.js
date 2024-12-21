document.addEventListener('DOMContentLoaded', function() {
    let historyRequests = []; // 声明一个数组来存储历史借用记录

    // 获取历史借用记录
    function fetchHistoryRequests() {
        const userEmail = localStorage.getItem('userEmail'); // 获取用户邮箱
        getHistoryRequests(userEmail)
            .then(requests => {
                historyRequests = requests; // 将获取的记录存储到全局变量
                renderHistoryRequests(historyRequests); // 渲染所有历史记录
            })
            .catch(error => {
                console.error('获取历史申请记录失败：', error);
            });
    }

    // 渲染历史借用记录
    function renderHistoryRequests(requests) {
        const historyRequestsList = document.getElementById('history-requests-list');
        historyRequestsList.innerHTML = ''; // 清空当前列表

        requests.forEach(item => {
            const requestElement = document.createElement('div');
            requestElement.classList.add('request');
            requestElement.innerHTML = `
                <div>物资名称: ${item.item_name}</div>
                <div>数量: ${item.quantity}</div>
                <div>状态: ${item.status}</div>
                <div>申请时间: ${item.request_timestamp}</div>
            `;
            historyRequestsList.appendChild(requestElement);
        });
    }
    // 页面导航功能
    function setupEventListeners() {
        document.querySelectorAll('.page-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const page = e.target.getAttribute('data-page');
                loadPage(page); // 根据按钮加载不同的页面
            });
        });
    }

    // 页面加载
    function loadPage(page) {
        // 根据页面加载内容，这里需要根据实际页面 URL 跳转
        console.log(page);
        window.location.href = `/${page}`; // 假设页面名称和数据页面相同
    }
    // 初始加载所有历史借用记录
    setupEventListeners();
    fetchHistoryRequests();

    // 确保按钮在 DOM 加载后再添加事件监听器
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase(); // 获取搜索词
            const filteredRequests = historyRequests.filter(item =>
                item.item_name.toLowerCase().includes(searchTerm) // 过滤记录
            );
            renderHistoryRequests(filteredRequests); // 渲染过滤后的记录
        });
    }
});