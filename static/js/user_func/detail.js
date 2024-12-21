document.addEventListener('DOMContentLoaded', function() {
  const app = {
    item: {}, // 保存物资详情
    userEmail: '', // 保存用户邮箱
    borrowQuantity: 0, // 借用数量
    borrowDuration: 0, // 借用天数
    privileges: '', // 用户权限
    itemId: '', // 物资ID

    // 初始化函数
    init: function() {
      const urlParams = new URLSearchParams(window.location.search);
      const itemId = urlParams.get('itemId'); // 从URL获取物资ID
      const privileges = urlParams.get('privileges'); // 从URL获取权限信息

      this.userEmail = localStorage.getItem('userEmail'); // 用户邮箱已保存在本地存储
      this.privileges = privileges;
      this.itemId = itemId;

      this.getItemDetail(itemId); // 获取物资详情

      this.setupEventListeners(); // 设置按钮和输入框的监听事件
    },

    // 事件监听设置
    setupEventListeners: function() {
      document.getElementById('borrowButton').addEventListener('click', () => {
        this.borrowItem(); // 当点击借用按钮时，调用借用物资函数
      });

      // 监听数量输入框的变化
      document.getElementById('quantityInput').addEventListener('input', (e) => {
        this.borrowQuantity = parseInt(e.target.value, 10); // 将输入的数量保存
      });

      // 监听借用天数输入框的变化
      document.getElementById('durationInput').addEventListener('input', (e) => {
        this.borrowDuration = parseInt(e.target.value, 10); // 将输入的借用天数保存
      });
    },

    // 获取物资详情
    getItemDetail: function(itemId) {
      getItemDetail(itemId, this.privileges)
        .then(item => {
          this.item = item; // 将物资信息保存
          this.renderItemDetails(); // 渲染物资详情到页面
        })
        .catch(error => {
          console.error('获取物资详情失败:', error);
        });
    },

// 将物资详情渲染到页面
renderItemDetails: function() {
    console.log('Item Details:', this.item);
    document.getElementById('itemName').textContent = `物资名称: ${this.item.name}`;

    const summaryMaxLength = 100; // 最大显示字符数
    const summaryText = this.item.summary || "无描述"; // 如果没有 summary 字段，显示默认文本
    const truncatedSummary = summaryText.length > summaryMaxLength
        ? summaryText.substring(0, summaryMaxLength) + '...'
        : summaryText;

    // 更新物资描述
    const itemDescriptionElement = document.getElementById('itemDescription');
    itemDescriptionElement.textContent = `物资描述: ${truncatedSummary}`;

    // 仅在有描述时创建“查看完整描述”的链接
    if (this.item.summary) {
        const viewMoreLink = document.createElement('a');
        viewMoreLink.textContent = '查看完整描述';
        viewMoreLink.href = '#';
        viewMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal(this.item.summary); // 显示完整描述
        });
        itemDescriptionElement.appendChild(viewMoreLink);
    }

    document.getElementById('itemStatus').textContent = `物资状态: ${this.item.status}`;

    const itemImage = document.getElementById('itemImage');
    itemImage.src = this.item.image_url;
    itemImage.alt = this.item.name;

    const borrowButtonVisible = this.item.status === 'available';
    document.getElementById('borrowButtonContainer').style.display = borrowButtonVisible ? 'block' : 'none';
},

// 显示模态框的函数
showModal: function(description) {
    const modal = document.getElementById('descriptionModal');

    // 清除之前的点击事件
    window.onclick = null;

    const modalContent = modal.querySelector('.modal-content');
    const paragraph = modalContent.querySelector('p');
    paragraph.textContent = description;

    modal.style.display = 'block'; // 显示模态框

    const closeButton = modal.querySelector('.close');
    closeButton.onclick = function() {
        modal.style.display = 'none';
    };

    // 点击模态框外部区域关闭模态框
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
},

    // 借用物资函数
    borrowItem: function() {
      if (this.borrowQuantity <= 0 || this.borrowDuration <= 0) {
        alert('请输入有效的借用数量和借用天数');
        return;
      }

      if (this.borrowQuantity > this.item.quantity) {
        alert('物资数量不足');
        return;
      }

      borrowItem(this.userEmail, this.itemId, this.borrowQuantity, this.borrowDuration, this.privileges)
        .then(response => {
          alert('借用成功');
          // 更新物资状态，并重新渲染页面
          this.item.status = 'pending';
          this.renderItemDetails();
        })
        .catch(error => {
          console.error('借用失败:', error);
          alert('借用失败');
        });
    }
  };

  app.init(); // 初始化应用
});
