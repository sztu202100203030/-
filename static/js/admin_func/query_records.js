
function initializePage() {
    let user_email = ''; // 局部变量，重置 email
    let records = []; // 局部变量，重置 records

    // 事件监听器
    document.getElementById('search-button').addEventListener('click', () => onSearch(user_email, records));
    document.getElementById('email-input').addEventListener('input', (event) => {
        user_email = event.target.value; // 更新局部变量
    });
}

// 搜索记录
function onSearch(user_email, records) {
    if (!user_email) {
        alert('请输入用户email');
        return;
    }

    queryUserRecords({ user_email })
        .then(res => {
            console.log('后端返回的数据:', res); // 打印完整的响应
            if (Array.isArray(res)) {
                records = res; // 更新局部变量
                displayRecords(records);
            } else {
                console.error('返回的数据不是一个数组:', res);
                alert('查询记录失败，数据格式不正确');
            }
        })
        .catch(error => {
            console.error('查询记录失败：', error);
            alert('查询记录失败');
        });
}

// 显示记录
function displayRecords(records) {
    const container = document.getElementById('records-container');
    container.innerHTML = ''; // 清空之前的记录

    if (!Array.isArray(records)) {
        console.error('记录数据格式不正确:', records);
        alert('记录数据格式不正确');
        return;
    }

    records.forEach(item => {
        const recordDiv = document.createElement('div');
        recordDiv.classList.add('record');

        // 创建记录内容
        let recordContent = `
            <p>用户email: ${item.email}</p>
            <p>用户名称: ${item.username}</p>
            <p>所借物资名称: ${item.item_name}</p>
            <p>所接物资数量: ${item.borrow_quantity}</p>
            <p>申请时间: ${item.bookingtimestamp}</p>
            <p data-status="${item.status}">状态: ${item.status}</p>
        `;

        // 根据状态添加额外信息
        if (item.status === '预约被拒绝') {
            recordContent += `<p>预约被拒绝时间: ${item.rejected_timestamp}</p>`;
        }
        if (item.status === '待交接') {
            recordContent += `<p>预约通过时间: ${item.approval_timestamp}</p>`;
        }
        if (item.status === '待归还') {
            recordContent += `
                <p>预约通过时间: ${item.approval_timestamp}</p>
                <p>交接时间: ${item.exchange_timestamp}</p>
                <p>应归还时间: ${item.return_due_date}</p>
            `;
        }
        if (item.status === '部分归还') {
            recordContent += `
                <p>预约通过时间: ${item.approval_timestamp}</p>
                <p>交接时间: ${item.exchange_timestamp}</p>
                <p>已归还数量: ${item.returned_quantity}</p>
                <p>归还时间: ${item.return_timestamp}</p>
                <p>应归还时间: ${item.return_due_date}</p>
            `;
        }
        if (item.status === '已归还') {
            recordContent += `
                <p>预约通过时间: ${item.approval_timestamp}</p>
                <p>交接时间: ${item.exchange_timestamp}</p>
                <p>归还时间: ${item.return_timestamp}</p>
            `;
        }

        // 将内容添加到记录 div
        recordDiv.innerHTML = recordContent;
        container.appendChild(recordDiv);
    });
}

// 调用初始化函数
initializePage();