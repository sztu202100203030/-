document.addEventListener('DOMContentLoaded', function() {
  // 获取用户待归还物品
  function getPendingReturns() {
    const userEmail = localStorage.getItem('userEmail'); // 使用localStorage获取用户邮箱
    getUserPendingReturns(userEmail)
      .then(pendingReturns => {
        // 渲染待归还物品列表
        const pendingReturnsList = document.getElementById('pending-returns-list');
        pendingReturnsList.innerHTML = ''; // 清空当前列表
        pendingReturns.forEach(item => {
          const itemElement = document.createElement('div');
          itemElement.classList.add('request');
          itemElement.innerHTML = `
            <img src="${item.image_url}" alt="物资图片" />
            <div>请求用户邮箱: ${item.user_email}</div>
            <div>物资名称: ${item.item_name}</div>
            <div>待归还数量: ${item.pending_quantity}</div>
            <div>归还日期: ${item.return_due_date}</div>
            <button class="return-btn" data-id="${item.id}" data-quantity="${item.pending_quantity}">预约归还</button>
<!--            <button class="renew-btn" data-id="${item.id}">预约续借</button>-->
          `;
          pendingReturnsList.appendChild(itemElement);
        });
      })
      .catch(error => {
        console.error('获取待归还物品失败：', error);
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
  getPendingReturns();

  // 处理预约归还弹窗
  document.getElementById('pending-returns-list').addEventListener('click', function(e) {
    if (e.target.classList.contains('return-btn')) {
      const itemId = e.target.getAttribute('data-id');
      const maxQuantity = e.target.getAttribute('data-quantity');
      document.getElementById('return-modal').style.display = 'block';
      // 设置预约归还的最大数量
      document.getElementById('submitReturn').addEventListener('click', function() {
        const returnQuantity = document.getElementById('returnQuantity').value;
        const userEmail = localStorage.getItem('userEmail');
        if (returnQuantity > 0 && returnQuantity <= maxQuantity) {
          requestReturn({
            exchange_log_id: itemId,
            user_email: userEmail,
            return_quantity: parseInt(returnQuantity)
          }).then(() => {
            getPendingReturns(); // 更新列表
            document.getElementById('return-modal').style.display = 'none';
          }).catch(error => {
            console.error('预约归还失败：', error);
          });
        } else {
          alert('请输入有效的归还数量');
        }
      });
    }
  });

  // 处理预约续借弹窗
  document.getElementById('pending-returns-list').addEventListener('click', function(e) {
    if (e.target.classList.contains('renew-btn')) {
      const itemId = e.target.getAttribute('data-id');
      document.getElementById('renew-modal').style.display = 'block';
      // 处理续借天数输入和提交
      document.getElementById('submitRenew').addEventListener('click', function() {
        const renewDays = document.getElementById('renewDays').value;
        const userEmail = localStorage.getItem('userEmail');
        if (renewDays > 0) {
          requestRenew({
            exchange_log_id: itemId,
            user_email: userEmail,
            renew_days: parseInt(renewDays)
          }).then(() => {
            getPendingReturns(); // 更新列表
            document.getElementById('renew-modal').style.display = 'none';
          }).catch(error => {
            console.error('预约续借失败：', error);
          });
        } else {
          alert('请输入有效的续借天数');
        }
      });
    }
  });

  // 关闭归还弹窗
  document.getElementById('cancelReturn').addEventListener('click', function() {
    document.getElementById('return-modal').style.display = 'none';
  });

  // // 关闭续借弹窗
  // document.getElementById('cancelRenew').addEventListener('click', function() {
  //   document.getElementById('renew-modal').style.display = 'none';
  // });
});
