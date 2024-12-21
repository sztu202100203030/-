const BASE_URL = 'http://localhost:5000';  // Flask 后端地址

// function login(loginData) {
//     return new Promise((resolve, reject) => {
//         fetch(`${BASE_URL}/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(loginData),
//             credentials: 'include'
//         })
//         .then(response => response.json())
//         .then(data => {
//             if (data.message === 'Login successful') {
//                 resolve(data);
//             } else {
//                 reject(data);
//             }
//         })
//         .catch(error => {
//             reject(error);
//         });
//     });
// }
function login(loginData)   {
    return new Promise((resolve, reject) => {
        fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
            credentials: 'include'  // 包含会话cookie
        })
        .then(response =>{
            console.log('res',response);
            return response.json();
        } )
        .then(data => {
            if (data.message === 'Login successful') {
                resolve(data);
            } else {
                reject(data);
            }
        })
        .catch(error => {
            reject(error);
        });
    });
}

// 发送验证码
function sendVerificationCode(email) {
  return fetch(`${BASE_URL}/send_verification_code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    credentials: 'include'  // 确保包含会话 Cookie

  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 注册
function register(email, username, password, verificationCode) {
  return fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password, repassword: verificationCode }),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 重置密码
function resetPassword(email, newPassword, verificationCode) {
  return fetch(`${BASE_URL}/reset_password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, new_password: newPassword, verification_code: verificationCode }),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 获取物资列表
function getItems(privileges) {
  return fetch(`${BASE_URL}/items?privileges=${privileges}`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 搜索物资列表
function searchItems(keyword, privileges) {
  return fetch(`${BASE_URL}/items/search?keyword=${keyword}&privileges=${privileges}`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 获取物资详情
function getItemDetail(itemId, privileges) {
  return fetch(`${BASE_URL}/items/${itemId}?privileges=${privileges}`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 借用物资
function borrowItem(userEmail, itemId, quantity, duration, privileges) {
  return fetch(`${BASE_URL}/borrow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_email: userEmail, item_id: itemId, borrow_quantity: quantity, borrow_duration: duration, privileges: privileges }),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 归还物资
function returnItem(userEmail, itemId) {
  return fetch(`${BASE_URL}/return`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_email: userEmail, item_id: itemId }),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 批准预约借用请求
function approveRequest(requestId, adminEmail, approvalReason) {
  return fetch(`${BASE_URL}/admin/approvebooking/${requestId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_email: adminEmail, approval_reason: approvalReason }),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 拒绝借用请求
function rejectRequest(requestId, adminEmail, approvalReason) {
  return fetch(`${BASE_URL}/admin/reject/${requestId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_email: adminEmail, approval_reason: approvalReason }),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 获取管理员审批请求列表
function getAdminRequests() {
  return fetch(`${BASE_URL}/admin/requests`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 获取管理员待处理请求列表
function getPendingRequests(privileges) {
  return fetch(`${BASE_URL}/admin/pending-requests?privileges=${privileges}`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 获取管理员已处理请求列表
function getProcessedRequests(privileges) {
  return fetch(`${BASE_URL}/admin/processed-requests?privileges=${privileges}`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 撤销请求
function revokeRequest(requestId) {
  return fetch(`${BASE_URL}/admin/revoke/${requestId}`, {
    method: 'POST',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 获取代交接数据
function getPendingExchanges(privileges) {
  return fetch(`${BASE_URL}/admin/pendingexchanges?privileges=${privileges}`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 交接物资出库
function handleExchange(exchangeData) {
  return fetch(`${BASE_URL}/admin/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(exchangeData),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 获取用户待归还物资列表
function getUserPendingReturns(userEmail) {
  return fetch(`${BASE_URL}/user/pending-returns?user_email=${userEmail}`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 获取管理员已处理归还请求列表
function getProcessedReturns(privileges) {
  return fetch(`${BASE_URL}/admin/processed-returns?privileges=${privileges}`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .catch(error => { throw error });
}

// 管理员撤销已处理归还请求 (Admin)
function revokeReturn(returnId) {
  return fetch(`${BASE_URL}/admin/revoke-return/${returnId}`, {
    method: 'POST',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      return data;
    } else {
      throw new Error(data.message || 'Revoke return request failed');
    }
  })
  .catch(error => {
    throw error;
  });
}

// 获取待交接归还入库的数据
function getPendingReturnsExchanges(privileges) {
  return fetch(`${BASE_URL}/admin/pendingreturnsexchanges?privileges=${encodeURIComponent(privileges)}`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// 处理归还交接
function handleReturnExchange(exchangeData) {
  return fetch(`${BASE_URL}/admin/returnexchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(exchangeData),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// 用户预约归还 (User)
function requestReturn(data) {
  return fetch(`${BASE_URL}/user/request-return`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// 用户预约续借 (User)
function requestRenew(data) {
  return fetch(`${BASE_URL}/user/request-renew`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// 获取待处理归还预约请求列表 (Admin)
function getPendingReturns(privileges) {
  return fetch(`${BASE_URL}/admin/pending-returns?privileges=${encodeURIComponent(privileges)}`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

//处理用户预约归还的api可以进行同意或拒绝用户预约归还
function approveReturnRequest(data) {
  return fetch(`${BASE_URL}/admin/approve-return`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

//用户审批状态获取
function getApprovalStatuses(userEmail) {
  return fetch(`${BASE_URL}/user/approval-statuses?user_email=${encodeURIComponent(userEmail)}`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// 获取用户历史申请记录
function getHistoryRequests(userEmail) {
  return fetch(`${BASE_URL}/user/history-requests?user_email=${encodeURIComponent(userEmail)}`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// Function to get items for admin
function adminGetItems(privileges, issuper) {
  return fetch(`${BASE_URL}/admin/items?privileges=${encodeURIComponent(privileges)}&issuper=${encodeURIComponent(issuper)}`, {
    method: 'GET',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// Function to delete item
function deleteItem(itemId) {
  return fetch(`${BASE_URL}/items/${itemId}`, {
    method: 'DELETE',
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// Function to update item status
function updateItemStatus(itemId, status, privileges) {
  return fetch(`${BASE_URL}/admin/items/${itemId}/status?privileges=${encodeURIComponent(privileges)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status }),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// Function to add item
function addItem(data) {
  console.log("增加物资函数调用");
  return fetch(`${BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// Function to upload file
function uploadFile(file, privileges) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('privileges', privileges);

  return fetch(`${BASE_URL}/import-items`, {
    method: 'POST',
    body: formData,
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// Function to add user
function addUser(data) {
  return fetch(`${BASE_URL}/add_User`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// Function to query user records
function queryUserRecords(data) {
  console.log("调用查询记录:");
  return fetch(`${BASE_URL}/query_user_records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .catch(error => {
    console.error('查询记录失败:', error);
    throw error; // 继续抛出错误以便后续处理
  });
}

// Function to borrow item offline
function borrowItemOffline(data) {
  return fetch(`${BASE_URL}/borrow_offline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// Function to get return records
function getReturnRecords(personName, itemId, itemName) {
  return fetch(`${BASE_URL}/get_return_records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ person_name: personName, item_id: itemId, item_name: itemName }),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// Function to return item offline
function returnItemOffline(data) {
  return fetch(`${BASE_URL}/return_offline`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
    credentials: 'include'  // 确保包含会话 Cookie
  })
  .then(response => response.json())
  .then(data => data)
  .catch(error => {
    throw error;
  });
}

// // Export functions as a module for web usage
// export {
//
//   getItems,     //获取用户可借物资
//   getItemDetail, //获取物资详情
//   searchItems, // 导出搜索物资的函数
//   borrowItem, // 导出借用物资的函数
//   approveRequest, // 导出批准借用请求的函数
//   rejectRequest, // 导出拒绝借用请求的函数
//   getAdminRequests, // 导出获取管理员审批请求列表的函数
//   getPendingRequests, // 导出获取待处理请求列表的函数
//   getProcessedRequests, // 导出获取已处理请求列表的函数
//   revokeRequest,     //导出撤销已处理借用请求函数
//   login,  //导出登录函数
//   register, //导出注册函数
//   sendVerificationCode,
//   resetPassword,      //重置密码
//   getPendingExchanges, //导出代交接物资列表函数
//   handleExchange, //导出交接物资函数
//   returnItem,  //导出归还物资函数
//   getUserPendingReturns, //获取用户带归还数据
//   requestReturn,    //预约归还
//   requestRenew,     //续借
//   getPendingReturns,    // 获取待预约归还数据
//   approveReturnRequest, //处理归还请求
//   getApprovalStatuses,  //获取用户审批状态
//   getHistoryRequests,   //获取用户借用历史
//   getPendingReturnsExchanges, // 获取待交接归还数据
//   handleReturnExchange,   // 处理归还交接
//   getProcessedReturns,
//   revokeReturn,     //撤销已处理归还请求
//   adminGetItems,    //管理员获取全部物资
//   deleteItem,       //删除物资
//   updateItemStatus, //更新物质状态
//   addItem,        //添加单个物资
//   uploadFile,     //上传物资
//   addUser,  //添加用户
//   queryUserRecords,//查询用户记录
//   borrowItemOffline,
//   getReturnRecords,
//   returnItemOffline,
// };