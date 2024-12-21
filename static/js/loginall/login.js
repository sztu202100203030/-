document.getElementById('login-btn').addEventListener('click', handleLogin);
document.getElementById('admin-login-btn').addEventListener('click', handleLoginAdmin);
//
// function handleInputChange(event) {
//     const field = event.target.id;
//     document.getElementById(field).value = event.target.value;
// }
//
// function toggleLoginMethod() {
//     const passwordLogin = document.getElementById('password-login');
//     const codeLogin = document.getElementById('code-login');
//     passwordLogin.style.display = passwordLogin.style.display === 'none' ? 'block' : 'none';
//     codeLogin.style.display = codeLogin.style.display === 'none' ? 'block' : 'none';
// }

function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginData = { email: email, password: password, isadmin: 0 };

    login(loginData)
        .then(response => {
            console.log('Login response:', response);  // 打印响应数据
            localStorage.setItem('userEmail', response.email);
            localStorage.setItem('username', response.username);
            localStorage.setItem('isAdmin', response.isadmin);
            window.location.href = '/first';
        })
        .catch(err => {
            alert(err.message);
        });
}

function handleLoginAdmin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginData = { email: email, password: password, isadmin: 1 };

    login(loginData)
        .then(response => {
            localStorage.setItem('userEmail', response.email);
            localStorage.setItem('username', response.username);
            localStorage.setItem('isAdmin', response.isadmin);
            localStorage.setItem('isSuper', response.issuper);
            localStorage.setItem('privileges', response.privileges);

            if (response.issuper) {
                document.getElementById('role-selection').style.display = 'block';
            } else {
                window.location.href = '/admin';
            }
        })
        .catch(err => {
            alert(err.message);
        });
}

document.getElementById('admin-role').addEventListener('click', () => {
    window.location.href = '/admin';
});

document.getElementById('super-admin-role').addEventListener('click', () => {
    window.location.href = '../../admin_func/super_admin/super_admin.html';
});
// document.getElementById('login-btn').addEventListener('click', handleLogin);
// document.getElementById('admin-login-btn').addEventListener('click', handleLoginAdmin);
//
// function handleLogin() {
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     const loginData = { email: email, password: password, isadmin: 0 };
//
//     login(loginData)
//         .then(response => {
//             console.log(response)
//             if (response.isadmin === 0) {
//                 window.location.href = '/first';
//             } else {
//                 window.location.href = '/admin';
//             }
//         })
//         .catch(err => {
//             alert(err.message);
//         });
// }
//
// function handleLoginAdmin() {
//     const email = document.getElementById('email').value;
//     const password = document.getElementById('password').value;
//     const loginData = { email: email, password: password, isadmin: 1 };
//
//     login(loginData)
//         .then(response => {
//             console.log(response)
//             if (response.isadmin === 1) {
//                 window.location.href = '/admin';
//             }
//         })
//         .catch(err => {
//             alert(err.message);
//         });
// }

