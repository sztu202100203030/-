(function() {
    let itemId = new URLSearchParams(window.location.search).get('itemId');
    let privileges = decodeURIComponent(new URLSearchParams(window.location.search).get('privileges'));
    let item = {};
    let returnRecords = [];
    let selectedRecord = null;

    function initializePage() {
        getItemDetail(itemId, privileges)
            .then(data => {
                item = data;
                displayItemDetails(item);
            })
            .catch(error => {
                console.error('获取物资详情失败：', error);
            });

        document.getElementById('borrow-button').addEventListener('click', toggleBorrowSection);
        document.getElementById('return-button').addEventListener('click', toggleReturnSection);
        document.getElementById('confirm-borrow').addEventListener('click', handleBorrow);
        document.getElementById('search-return-records').addEventListener('click', searchReturnRecords);
        document.getElementById('confirm-return').addEventListener('click', handleReturn);
            // 添加返回按钮事件处理
        document.getElementById('back-button').addEventListener('click', function() {
            window.history.back(); // 返回到上一页
        });
    }

    function displayItemDetails(item) {
        document.getElementById('item-image').src = item.image_url;
        document.getElementById('item-name').innerText = item.name;
        document.getElementById('item-description').innerText = `描述: ${item.summary}`;
        document.getElementById('item-quantity').innerText = `剩余数量: ${item.quantity}`;
    }

    function toggleBorrowSection() {
        document.getElementById('borrow-section').style.display = 'block';
        document.getElementById('return-section').style.display = 'none';
    }

    function toggleReturnSection() {
        document.getElementById('return-section').style.display = 'block';
        document.getElementById('borrow-section').style.display = 'none';
    }

    function handleBorrow() {
        const quantity = document.getElementById('borrow-quantity').value;
        const location = document.getElementById('borrow-location').value;
        const duration = document.getElementById('borrow-duration').value;
        const personName = document.getElementById('borrow-person-name').value;

        if (personName) {
            const content = `
                借用物资: ${item.name.length > 10 ? item.name.slice(0, 10) + '...' : item.name}<br/>
                借用数量: ${quantity}<br/>
                借用地点: ${location}<br/>
                借用时长: ${duration}天<br/>
                借用人姓名: ${personName}
            `;

            if (confirm(`确认信息\n${content}`)) {
                borrowItemOffline({
                    item_id: itemId,
                    item_name: item.name,
                    borrow_quantity: quantity,
                    location,
                    duration,
                    person_name: personName,
                    privileges
                }).then(() => {
                    alert('借用成功');
                    window.location.reload(); // 重新加载页面
                }).catch(error => {
                    console.error('借用失败：', error);
                });
            }
        } else {
            alert('请输入借用人姓名');
        }
    }

    function searchReturnRecords() {
        const personName = document.getElementById('return-person-name').value;
        if (personName) {
            getReturnRecords(personName, itemId, item.name)
                .then(records => {
                    if (records.length === 1) {
                        selectedRecord = records[0];
                        document.getElementById('return-inputs').style.display = 'block';
                    } else if (records.length > 1) {
                        returnRecords = records;
                        displayReturnRecords(returnRecords);
                    } else {
                        alert('未找到对应的借用记录');
                    }
                })
                .catch(error => {
                    console.error('获取借用记录失败：', error);
                });
        } else {
            alert('请输入用户姓名');
        }
    }

    function displayReturnRecords(records) {
        const recordList = document.getElementById('record-list');
        recordList.innerHTML = ''; // 清空之前的记录

        records.forEach((record, index) => {
            const recordDiv = document.createElement('div');
            recordDiv.innerText = `借用时间: ${record.borrow_time}, 待还数量: ${record.borrow_quantity - record.return_quantity}`;
            recordDiv.dataset.index = index;
            recordDiv.addEventListener('click', () => selectRecord(index));
            recordList.appendChild(recordDiv);
        });

        document.getElementById('return-records').style.display = 'block';
    }

    function selectRecord(index) {
        selectedRecord = returnRecords[index];
        document.getElementById('return-inputs').style.display = 'block';
    }

    function handleReturn() {
        const quantity = document.getElementById('return-quantity').value;
        const location = document.getElementById('return-location').value;
        const personName = document.getElementById('return-person-name').value;
        const itemCondition = document.getElementById('item-condition').value;

        if (selectedRecord) {
            const content = `
                归还物资: ${item.name}<br/>
                归还数量: ${quantity}<br/>
                归还地点: ${location}<br/>
                归还人姓名: ${personName}<br/>
                物资损耗情况: ${itemCondition}
            `;

            if (confirm(`确认信息\n${content}`)) {
                returnItemOffline({
                    item_id: itemId,
                    item_name: item.name,
                    record_id: selectedRecord.id,
                    return_quantity: quantity,
                    location,
                    person_name: personName,
                    item_condition: itemCondition,
                    privileges
                }).then(() => {
                    alert('归还成功');
                    window.location.reload(); // 重新加载页面
                }).catch(error => {
                    console.error('归还失败：', error);
                });
            }
        } else {
            alert('请选择一条记录');
        }
    }

    window.onload = initializePage;
})();
