// document.addEventListener('DOMContentLoaded', function() {
//   const app = {
//     init: function() {
//       this.setupEventListeners();
//     },
//
//     setupEventListeners: function() {
//       document.querySelectorAll('.page-button').forEach(button => {
//         button.addEventListener('click', (e) => {
//           const page = e.target.getAttribute('data-page');
//           this.loadPage(page); // 根据按钮加载不同的页面
//         });
//       });
//     },
//
//     loadPage: function(page) {
//       // 根据页面加载内容，跳转到不同的页面
//       window.location.href = `/${page}`;
//     },
//   };
//
//   app.init();
// });
// document.addEventListener('DOMContentLoaded', function() {
//   const app = {
//     init: function() {
//       this.setupEventListeners();
//     },
//
//     setupEventListeners: function() {
//       // 处理导航栏主按钮的点击事件
//       document.querySelectorAll('.page-button').forEach(button => {
//         button.addEventListener('click', (e) => {
//           const toggleId = e.target.getAttribute('data-toggle');
//           const page = e.target.getAttribute('data-page');
//
//           if (page) {
//             // 如果是直接跳转的页面按钮
//             this.loadPage(page);
//           } else if (toggleId) {
//             // 如果是有子菜单的按钮
//             const submenu = document.getElementById(toggleId);
//             if (submenu) {
//               submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
//             }
//           }
//         });
//       });
//
//       // 处理子菜单按钮的点击事件
//       document.querySelectorAll('.submenu-button').forEach(button => {
//         button.addEventListener('click', (e) => {
//           const page = e.target.getAttribute('data-page');
//           console.log(page);
//           this.loadPage(page); // 根据子菜单按钮加载不同的页面
//         });
//       });
//     },
//
//     loadPage: function(page) {
//       // 根据页面加载内容，跳转到不同的页面
//       window.location.href = `/${page}`;
//     },
//   };
//
//   app.init();
// });
// document.addEventListener("DOMContentLoaded", function() {
//   const app = {
//     // 初始化应用
//     init: function () {
//       this.restoreMenuState(); // 恢复上次打开的菜单状态
//       this.setupEventListeners(); // 设置事件监听器
//     },
//
//     // 设置事件监听器
//     setupEventListeners: function () {
//       // 使用事件委托，监听导航栏内的点击事件
//       document.querySelector('.navbar').addEventListener('click', (e) => {
//         const pageButton = e.target.closest('.page-button'); // 查找被点击的主按钮
//         const submenuButton = e.target.closest('.submenu-button'); // 查找被点击的子菜单按钮
//
//         // 如果点击的是主按钮
//         if (pageButton) {
//           this.handlePageButtonClick(pageButton);
//         }
//         // 如果点击的是子菜单按钮
//         else if (submenuButton) {
//           this.handleSubmenuButtonClick(submenuButton);
//         }
//       });
//     },
//
//     // 处理主按钮点击事件
//     handlePageButtonClick: function (button) {
//       const toggleId = button.getAttribute('data-toggle'); // 获取数据属性
//       const page = button.getAttribute('data-page'); // 获取页面信息
//
//       // 如果有直接跳转的页面
//       if (page) {
//         this.loadPage(page); // 加载页面
//       }
//       // 如果是有子菜单的按钮
//       else if (toggleId) {
//         const submenu = document.getElementById(toggleId); // 获取对应的子菜单
//         if (submenu) {
//           // 切换子菜单的显示状态
//           submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
//           // 保存当前打开的菜单状态
//           localStorage.setItem('openMenu', submenu.style.display === 'block' ? toggleId : '');
//           this.closeOtherSubmenus(submenu); // 关闭其他子菜单
//         }
//       }
//     },
//
//     // 处理子菜单按钮点击事件
//     handleSubmenuButtonClick: function (button) {
//       const page = button.getAttribute('data-page'); // 获取页面信息
//
//       // 移除其他子菜单按钮的高亮状态
//       document.querySelectorAll('.submenu-button.active').forEach(btn => btn.classList.remove('active'));
//
//       // 为当前点击的子菜单按钮添加高亮状态
//       button.classList.add('active');
//
//       // 保存当前高亮按钮的状态
//       localStorage.setItem('activeSubmenu', button.dataset.page); // 使用 data-page 存储当前按钮的状态
//
//       this.loadPage(page); // 加载页面
//     },
//     // 关闭其他子菜单
//     closeOtherSubmenus: function (openedSubmenu) {
//       document.querySelectorAll('.submenu').forEach(submenu => {
//         // 仅关闭未打开的子菜单
//         if (submenu !== openedSubmenu) {
//           submenu.style.display = 'none';
//         }
//       });
//     },
//
//     // 根据页面加载内容，跳转到不同的页面
//     loadPage: function (page) {
//       window.location.href = `/${page}`; // 跳转到新页面
//     },
//
//     // 恢复上次打开的菜单状态
//     restoreMenuState: function () {
//       const openMenu = localStorage.getItem('openMenu'); // 从 localStorage 获取状态
//       if (openMenu) {
//         const submenu = document.getElementById(openMenu); // 获取对应的子菜单
//         if (submenu) {
//           submenu.style.display = 'block'; // 展开之前打开的菜单
//
//           // 恢复高亮状态
//           const activePage = localStorage.getItem('activeSubmenu'); // 获取当前高亮按钮的状态
//           if (activePage) {
//             const activeButton = submenu.querySelector(`.submenu-button[data-page="${activePage}"]`);
//             if (activeButton) {
//               activeButton.classList.add('active'); // 添加高亮状态
//             }
//           }
//         }
//       }
//     },
//   };
//   app.init(); // 初始化应用
// });
// document.addEventListener("DOMContentLoaded", function () {
//     const pageButtons = document.querySelectorAll(".page-button");
//     const BASE_URL = 'http://localhost:5000';
//     // 处理主按钮点击事件，显示或隐藏子菜单
//     pageButtons.forEach(button => {
//         button.addEventListener("click", function () {
//             const submenuId = this.getAttribute("data-toggle");
//             const submenu = document.getElementById(submenuId);
//             if (submenu) {
//                 // 切换子菜单的显示状态
//                 submenu.style.display = submenu.style.display === "none" ? "block" : "none";
//             }
//         });
//     });
//
//     const menuItems = document.querySelectorAll(".submenu-button");
//     menuItems.forEach(item => {
//         item.addEventListener("click", function (event) {
//             event.preventDefault(); // 阻止默认链接行为
//
//             const url = this.getAttribute("data-url"); // 获取要加载的 URL
//             const title = this.textContent; // 获取标题，用于更新页面标题
//
//             // 使用 Fetch API 加载内容
//             fetch(`${BASE_URL}${url}`)
//                 .then(response => {
//                     if (!response.ok) {
//                         throw new Error('Network response was not ok');
//                     }
//                     return response.text(); // 获取响应文本
//                 })
//                 .then(data => {
//                     // 更新内容区域
//                     document.getElementById("content-area").innerHTML = data;
//
//                     // 更新页面标题
//                     document.title = title;
//
//                     // 更新高亮状态
//                     document.querySelectorAll(".submenu-button.active").forEach(active => {
//                         active.classList.remove("active");
//                     });
//                     this.classList.add("active"); // 添加高亮样式
//                 })
//                 .catch(error => {
//                     console.error('There was a problem with the fetch operation:', error);
//                 });
//         });
//     });
// });
// document.addEventListener('DOMContentLoaded', function() {
//     // 获取所有页面按钮
//     const pageButtons = document.querySelectorAll('.page-button');
//     let currentScript = null;
//     console.log(pageButtons);
//     // 遍历所有按钮，给每个按钮添加点击事件
//     pageButtons.forEach(button => {
//         button.addEventListener('click', function() {
//             const submenuId = this.dataset.toggle || null; // 获取要折叠的子菜单 ID
//             const pageUrl = this.dataset.url || null;      // 获取页面的 URL（如果有）
//
//             // 如果有子菜单的 ID，处理折叠/展开
//             if (submenuId) {
//                 toggleSubMenu(submenuId);                  // 调用函数折叠/展开子菜单
//             }
//             // 如果有页面的 URL，直接加载该页面内容
//             if (pageUrl) {
//                 loadPage(pageUrl);                         // 加载对应的页面内容
//             }
//         });
//     });
//
//     // 子菜单按钮事件处理：当点击子菜单按钮时，加载页面
//     const submenuButtons = document.querySelectorAll('.submenu-button');
//     submenuButtons.forEach(button => {
//         button.addEventListener('click', function() {
//             const pageUrl = this.dataset.url || null;     // 获取页面的 URL
//
//             // 如果有页面 URL，加载该页面
//             if (pageUrl) {
//                 loadPage(pageUrl);                        // 调用函数加载对应的页面
//             }
//         });
//     });
//
//     // 折叠/展开子菜单的函数
//     function toggleSubMenu(submenuId) {
//         const submenu = document.getElementById(submenuId);
//
//         // 切换显示或隐藏状态
//         if (submenu.style.display === 'none') {
//             submenu.style.display = 'block';               // 展开子菜单
//         } else {
//             submenu.style.display = 'none';                // 折叠子菜单
//         }
//     }
//
//     // 用于加载页面内容的函数
//     function loadPage(url) {
//         fetch(url)
//             .then(response => response.text())
//             .then(html => {
//                 document.getElementById('content-area').innerHTML = html; // 加载内容到主区域
//
//                 // 动态加载对应的 JS 文件
//                 const scriptName = getScriptNameByUrl(url);  // 根据 URL 获取对应的 JS 文件名
//                 if (scriptName) {
//                     loadScript(scriptName, function() {
//                         // 在脚本加载完成后执行初始化逻辑
//                         if (typeof initializePage === 'function') {
//                             initializePage();
//                         }
//                     });
//                 }
//
//                 // 高亮当前按钮
//                 highlightActiveButton(url);
//             })
//             .catch(error => console.error('Error loading page:', error));
//     }
//
//     // 高亮当前活动按钮
//     function highlightActiveButton(url) {
//         // 移除所有子菜单按钮的高亮状态
//         const submenuButtons = document.querySelectorAll('.submenu-button');
//         submenuButtons.forEach(button => {
//             button.classList.remove('active');
//         });
//
//         // 根据 URL 设置高亮状态
//         const activeButton = Array.from(submenuButtons).find(button => button.dataset.url === url);
//         if (activeButton) {
//             activeButton.classList.add('active');
//         }
//     }
//
//     // 根据 URL 返回对应的 JS 文件名
//     function getScriptNameByUrl(url) {
//         switch (url) {
//             case '/pending_requests':
//                 return 'pending_requests.js';
//             case '/processed_requests':
//                 return 'processed_requests.js';
//             case '/pending_exchanges':
//                 return 'pending_exchanges.js';
//             case '/admin_pending_returns':
//                 return 'admin_pending_returns.js';
//             case '/processed_returns':
//                 return 'processed_returns.js';
//             case '/return_exchanges':
//                 return 'return_exchanges.js';
//             case '/delete_items':
//                 return 'delete_items.js'
//             case '/add_item':
//                 return 'add_item.js'
//             case '/import_items':
//                 return 'import_items.js'
//             case '/query_records':
//                 return 'query_records.js'
//             case 'offline_handover':
//                 return 'offline_handover.js'
//             // 你可以继续添加更多 URL 对应的 JS 文件
//             default:
//                 return null;
//         }
//     }
//
//     // 用于动态加载 JavaScript 文件的函数
//     function loadScript(scriptName) {
//         // 检查是否已经加载了相同的脚本
//         if (currentScript && currentScript.src.includes(scriptName)) {
//             console.log(`${scriptName} is already loaded.`);
//             return;  // 如果已经加载相同的脚本，直接返回
//         }
//
//         // 移除当前加载的页面 JS 文件
//         if (currentScript) {
//             console.log(`Removing previous script: ${currentScript.src}`);
//             document.head.removeChild(currentScript); // 移除当前 JS 文件
//         }
//
//         // 动态加载新的 JS 文件
//         currentScript = document.createElement('script');
//         currentScript.src = `/static/js/admin_func/${scriptName}`; // 设置新的 JS 文件路径
//         currentScript.async = true;  // 异步加载脚本，确保不会阻塞页面
//         currentScript.onload = function() {
//             console.log(`${scriptName} has been loaded successfully.`);
//                     // 确保在加载后调用初始化函数
//                 if (typeof initializePage === 'function') {
//                     initializePage();
//                 }
//         };
//         currentScript.onerror = function() {
//             console.error(`Error loading script: ${scriptName}`);
//         };
//
//         // 插入新的 JS 文件到 <head>
//         document.head.appendChild(currentScript);
//     }
// });





















document.addEventListener('DOMContentLoaded', function() {
    const pageButtons = document.querySelectorAll('.page-button');
    const loadedScripts = new Set(); // 使用 Set 跟踪已加载的脚本
    let currentScript = null;

    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const submenuId = this.dataset.toggle || null;
            const pageUrl = this.dataset.url || null;

            if (submenuId) {
                toggleSubMenu(submenuId);
            }
            if (pageUrl) {
                loadPage(pageUrl);
            }
        });
    });

    const submenuButtons = document.querySelectorAll('.submenu-button');
    submenuButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pageUrl = this.dataset.url || null;

            if (pageUrl) {
                loadPage(pageUrl);
            }
        });
    });

    function toggleSubMenu(submenuId) {
        const submenu = document.getElementById(submenuId);
        submenu.style.display = submenu.style.display === 'none' ? 'block' : 'none';
    }

    function loadPage(url) {
        console.log(`Loading page: ${url}`); // 调试信息
        fetch(url)
            .then(response => response.text())
            .then(html => {
                console.log(html)
                document.getElementById('content-area').innerHTML = ''; // 清空内容区

                document.getElementById('content-area').innerHTML = html;
                console.log(html)
                const scriptName = getScriptNameByUrl(url);
                const cssName = getCssNameByUrl(url); // 获取 CSS 文件名

                if (scriptName) {
                    loadScript(scriptName); // 每次都加载脚本
                }

                if (cssName) {
                    loadCss(cssName); // 加载对应的 CSS
                }

                highlightActiveButton(url);
            })
            .catch(error => console.error('Error loading page:', error));
    }

    function highlightActiveButton(url) {
        const submenuButtons = document.querySelectorAll('.submenu-button');
        submenuButtons.forEach(button => {
            button.classList.remove('active');
        });

        const activeButton = Array.from(submenuButtons).find(button => button.dataset.url === url);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

        function getFileNameByUrl(url, extension) {
            // 去掉前面的斜杠，并返回加上对应扩展名的文件名
            return url.replace('/', '') + `.${extension}`;
        }

        function getScriptNameByUrl(url) {
            return getFileNameByUrl(url, 'js');
        }

        function getCssNameByUrl(url) {
            return getFileNameByUrl(url, 'css');
        }

    function loadCss(cssName) {
        const oldLink = document.querySelector(`link[href*="${cssName}"]`);
        console.log(oldLink)
        if (oldLink) {
            try {
                document.head.removeChild(oldLink); // 尝试移除旧的 CSS
                console.log(`${cssName} has been removed.`);
            } catch (error) {
                console.warn(`Could not remove CSS: ${cssName}`, error);
            }
        }

        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = `/static/css/admin_func/${cssName}?t=${new Date().getTime()}`; // 添加时间戳以避免缓存
        document.head.appendChild(newLink);
    }
    function loadScript(scriptName) {
        const oldScript = document.querySelector(`script[src*="${scriptName}"]`);
        if (oldScript) {
            try {
                document.head.removeChild(oldScript); // 尝试移除旧脚本
                console.log(`${scriptName} has been removed.`);
            } catch (error) {
                console.warn(`Could not remove script: ${scriptName}`, error);
            }
        } else {
            console.log(`No existing script found for: ${scriptName}`); // 如果没有找到，输出信息
        }

        const newScript = document.createElement('script');
        newScript.src = `/static/js/admin_func/${scriptName}?t=${new Date().getTime()}`; // 添加时间戳以避免缓存
        newScript.async = true;
        newScript.onload = function() {
            console.log(`${scriptName} has been loaded successfully.`);
            if (typeof initializePage === 'function') {
                initializePage(); // 确保在脚本加载后调用初始化
            }
        };
        newScript.onerror = function() {
            console.error(`Error loading script: ${scriptName}`);
        };

        document.head.appendChild(newScript);
    }
});



