document.addEventListener('DOMContentLoaded', function() {
  const app = {
    items: [],
    searchKeyword: '',
    privileges: '图书', // 默认选择

    init: function() {
      this.loadItems();
      this.setupEventListeners();
    },

    loadItems: function() {
      getItems(this.privileges)
        .then(items => {
          this.items = items;
          this.renderItems();
        })
        .catch(error => {
          console.error('获取物资列表失败：', error);
        });
    },

    setupEventListeners: function() {
      document.getElementById('search-input').addEventListener('input', (e) => {
        this.onSearchInput(e);
      });

      document.getElementById('searchButton').addEventListener('click', () => {
        this.searchItems();
      });

      document.querySelectorAll('.page-button').forEach(button => {
        button.addEventListener('click', (e) => {
          const page = e.target.getAttribute('data-page');
          this.loadPage(page); // 根据按钮加载不同的页面
        });
      });

      document.getElementById('privilege-select').addEventListener('change', (e) => {
        this.onPrivilegeChange(e);
      });
    },

    loadPage: function(page) {
      // 根据页面加载内容，这里需要根据实际页面 URL 跳转
      console.log(page)
      window.location.href = `/${page}`; // 假设页面名称和数据页面相同
    },

    onSearchInput: function(e) {
      this.searchKeyword = e.target.value.trim();
    },

    searchItems: function() {
      if (this.searchKeyword) {
        searchItems(this.searchKeyword, this.privileges)
          .then(items => {
            this.items = items;
            this.renderItems();
            if (items.length === 0) {
              alert('未找到相关物资');
            }
          })
          .catch(error => {
            console.error('搜索物资失败：', error);
          });
      } else {
        alert('请输入搜索关键词');
        this.loadItems();
      }
    },

    borrowItem: function(itemId) {
      window.location.href = `/detail?itemId=${itemId}&privileges=${this.privileges}`;
    },

    onPrivilegeChange: function(e) {
      this.privileges = e.target.value;
      this.loadItems(); // 重新获取物资列表
    },

    renderItems: function() {
        const itemsContainer = document.getElementById('item-list');
        itemsContainer.innerHTML = ''; // 清空现有内容

        this.items.forEach(item => {
            const itemElement = document.createElement('div');

            // 根据权限设置图标和样式
            let itemClass;
            if (this.privileges === '图书') {
                itemClass = 'book';
                itemElement.classList.add('book');
            } else if (this.privileges === '设备') {
                itemClass = 'equipment';
                itemElement.classList.add('equipment');
            } else {
                itemClass = 'consumable';
                itemElement.classList.add('consumable');
            }

            // 设置物资名称
            itemElement.innerHTML = `<span class="${itemClass}"></span>${item.name}`; // 假设物品有一个 name 属性

            // 根据 privileges 确定要使用的 ID
            let itemId;
            if (this.privileges === '图书') {
                itemId = item.book_id;
            } else if (this.privileges === '设备') {
                itemId = item.equipment_id;
            } else {
                itemId = item.consumable_id;
            }

            itemElement.onclick = () => this.borrowItem(itemId); // 使用正确的 ID
            itemsContainer.appendChild(itemElement);
        });
    }

  };

  app.init();
});
