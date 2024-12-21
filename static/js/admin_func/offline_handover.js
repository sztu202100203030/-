(function() {
    let items = [];
    let filteredItems = [];
    let searchKeyword = '';
    let privileges = '';
    let isSuper = false;

    function initializePage() {
        const issuper = localStorage.getItem('isSuper');
        isSuper = issuper === '1';

        if (isSuper) {
            document.getElementById('privilege-picker').style.display = 'block';
            document.getElementById('privilege-select').addEventListener('change', onPrivilegeChange);
        }

        privileges = isSuper ? '图书' : localStorage.getItem('privileges');
        loadItems();

        document.getElementById('search-button').addEventListener('click', searchItems);
        document.getElementById('search-input').addEventListener('input', onSearchInput);
    }

    function loadItems() {
        adminGetItems(privileges, isSuper)
            .then(data => {
                items = data;
                filteredItems = items;
                displayItems(filteredItems);
            })
            .catch(error => {
                console.error('获取物资列表失败：', error);
            });
    }

    function onSearchInput(event) {
        searchKeyword = event.target.value.trim();
    }

    function searchItems() {
        const keyword = searchKeyword.toLowerCase();
        if (keyword) {
            filteredItems = items.filter(item =>
                item.name.toLowerCase().includes(keyword)
            );
            displayItems(filteredItems);
            if (filteredItems.length === 0) {
                alert('未找到相关物资');
            }
        } else {
            alert('请输入搜索关键词');
            filteredItems = items;
            displayItems(filteredItems);
        }
    }

    function displayItems(itemsToDisplay) {
        const itemList = document.getElementById('item-list');
        itemList.innerHTML = ''; // 清空之前的物资列表

        itemsToDisplay.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');
            itemDiv.dataset.id = item.id;
            itemDiv.innerText = item.name;
            itemDiv.addEventListener('click', () => borrowItem(item.id));
            itemList.appendChild(itemDiv);
        });
    }

    function borrowItem(itemId) {
        const detailUrl = `/offline_handover_detail?itemId=${itemId}&privileges=${encodeURIComponent(privileges)}`;
        window.location.href = detailUrl;
    }

    function onPrivilegeChange(event) {
        privileges = event.target.value;
        loadItems();
    }

    window.initializePage = initializePage; // 暴露 initializePage 函数到全局
})();
