document.addEventListener('DOMContentLoaded', function() {
  // 获取审批状态
  function fetchApprovalStatuses() {
    const userEmail = localStorage.getItem('userEmail'); // 获取用户邮箱

    getApprovalStatuses(userEmail)
      .then(approvalStatuses => {
        // 渲染审批状态列表
        const approvalStatusList = document.getElementById('approval-status-list');
        approvalStatusList.innerHTML = ''; // 清空当前列表
        approvalStatuses.forEach(item => {
          const statusElement = document.createElement('div');
          statusElement.classList.add('status');
          statusElement.innerHTML = `
            <div>审批事务: ${item.request_type}</div>
            <div>物资名称: ${item.item_name}</div>
            <div>审批数量: ${item.quantity}</div>
            <div>审批进度: ${item.status}</div>
            <div>时间: ${item.request_timestamp}</div>
          `;
          approvalStatusList.appendChild(statusElement);
        });
      })
      .catch(error => {
        console.error('获取审批状态失败：', error);
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

    // 初始化
    setupEventListeners();

  fetchApprovalStatuses();
});
