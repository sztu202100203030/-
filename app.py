

from flask import Flask, request, jsonify,render_template,session, redirect, url_for
from functools import wraps
from flask_session import Session
import mysql.connector
from mysql.connector import Error
import traceback
import hashlib
import random
import string
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
import smtplib
from flask_cors import CORS
from datetime import datetime ,timedelta
import os
import pandas as pd
import logging
import tempfile  # 导入临时文件模块

app = Flask(__name__)
app.config['SESSION_TYPE'] = 'filesystem'  # 或其他类型
app.config['SECRET_KEY'] = 'weishenmeyongbuliao'
CORS(app, supports_credentials=True)  # 允许跨域请求，支持凭证
Session(app)  # 初始化 Flask-Session
# 连接数据库
def create_db_connection():
    try:
        connection = mysql.connector.connect(
            host='127.0.0.1',
            user='root',
            password='Sztu@Ckl1034',
            database='lab_inventory'
        )
        return connection
    except Error as e:
        print(f"The error '{e}' occurred")
#转换时间格式
def convert_format(timestamp):
    if isinstance(timestamp, datetime):
        dt = timestamp
    else:
        try:
            dt = datetime.strptime(timestamp, "%a, %d %b %Y %H:%M:%S GMT")
        except ValueError:
            dt = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
    return dt.strftime("%Y年%m月%d日 %H:%M:%S")

def get_table_info(privileges):
    privilege_to_table = {
        '图书': 'item_books',
        '设备': 'item_equipment',
        '耗材': 'item_consumables'
    }
    id_get = {
        '图书': 'book_id',
        '设备': 'equipment_id',
        '耗材': 'consumable_id'
    }
    table_name = privilege_to_table.get(privileges)
    table_id = id_get.get(privileges)
    return table_name, table_id

def setsession(data, isadmin):
    session['userEmail'] = data['email']
    session['userName'] = data['username']
    session['isSuper'] = data.get('issuper', 0)
    session['isAdmin'] = 1 if isadmin else 0
    session['privileges'] = data.get('privileges', None)  # 确保 privileges 被设置
    session.modified = True  # 标记为已修改
    print("Session data set:", dict(session))
    getsession()
    return session

def getsession():
    print("Session data:", dict(session))
    return session

#管理员权限判定
def requires_admin_permission(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # 检查用户是否为管理员或超级管理员
        print("admin Session data:", session)  # 打印 session 数据调试
        if session.get('isAdmin') != 1 :
            return redirect(url_for('home'))  # 没有权限则跳转到登录页面
        return f(*args, **kwargs)
    return decorated_function
#用户权限判定
def requires_user_login(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # 检查用户是否已登录 or session.get('isAdmin') == '1' or session.get('isSuper') == '1'
        print("Session data:", session)  # 打印 session 数据调试
        if 'userEmail' not in session:
            return redirect(url_for('home'))  # 未登录则跳转到登录页面
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def home():
    return render_template('loginall/login.html')


# Helper function to send email (add your SMTP configuration)
def send_email(recipient, subject, body):
    with smtplib.SMTP('smtp.example.com', 587) as server:
        server.starttls()
        server.login("your_email@example.com", "your_password")
        message = f"Subject: {subject}\n\n{body}"
        server.sendmail("your_email@example.com", recipient, message)


# Helper function to generate and verify tokens
def generate_token(email):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    return serializer.dumps(email, salt=app.config['SECRET_KEY'])


def verify_token(token, expiration=3600):
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt=app.config['SECRET_KEY'], max_age=expiration)
    except (SignatureExpired, BadSignature):
        return None
    return email


# Helper function to generate a random six-digit code
def generate_verification_code():
    return ''.join(random.choices(string.digits, k=6))


@app.route('/send_verification_code', methods=['POST'])
def send_verification_code():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM user WHERE email = %s", (email,))
        user = cursor.fetchone()

        if user:
            return jsonify({'message': 'User already registered'}), 400

        verification_code = generate_verification_code()
        send_email(email, 'Your verification code', f'Your verification code is: {verification_code}')

        # Save the verification code and its email mapping to the database (assuming you have a table for this)
        cursor.execute("INSERT INTO verification_codes (email, code) VALUES (%s, %s) ON DUPLICATE KEY UPDATE code = %s",
                       (email, verification_code, verification_code))
        connection.commit()

        return jsonify({'message': 'Verification code sent'}), 200
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    repassword=data.get('repassword')
    # verification_code = data.get('verification_code')

    # if not all([email, username, password, verification_code]):
    #     return jsonify({'message': 'All fields are required'}), 400
    if not all([email, username, password]):
        return jsonify({'message': 'All fields are required'}), 400

    if password != repassword:
        return jsonify({'message': '密码输入不一致'}), 400
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        # cursor.execute("SELECT * FROM verification_codes WHERE email = %s AND code = %s", (email, verification_code))
        # code_record = cursor.fetchone()
        # if not code_record:
        #     return jsonify({'message': 'Invalid or expired verification code'}), 400

        hashed_password = generate_password_hash(password)
        cursor.execute("INSERT INTO user (email, username, password) VALUES (%s, %s, %s)",
                       (email, username, hashed_password))
        connection.commit()

        # # Optionally, delete the used verification code
        # cursor.execute("DELETE FROM verification_codes WHERE email = %s", (email,))
        # connection.commit()

        return jsonify({'message': '注册成功'}), 201
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    print(data)
    email = data.get('email')
    password = data.get('password')
    verification_code = data.get('verification_code')
    isadmin = data.get('isadmin')
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    session['usermail']=email
    try:
        if email and password:
            if isadmin:
                cursor.execute("SELECT * FROM adminusers WHERE email = %s", (email,))
                user = cursor.fetchone()
                if user and check_password_hash(user['password'], password):
                    response = {
                        'message': 'Login successful',
                        'email': user['email'],
                        'username': user['username'],
                        'isadmin': isadmin,
                        'issuper': user.get('issuper', 0),  # 默认值为 0
                        'privileges':user['privileges']
                    }

                    loginadsession = setsession(user, isadmin)  # 设置会话
                    print("Session after login:", dict(session))  # 记录会话状态
                    return jsonify(response), 200
                else:
                    return jsonify({'message': '用户名或密码错误'}), 400
            else:
                cursor.execute("SELECT * FROM user WHERE email = %s", (email,))
                user = cursor.fetchone()
                if user and check_password_hash(user['password'], password):
                    response = {
                        'message': 'Login successful',
                        'email': user['email'],
                        'username': user['username'],
                        'isadmin': isadmin
                    }
                    loginsession = setsession(user, isadmin)  # 设置会话
                    session.modified = True  # 标记为已修改
                    print("Session after login:", dict(session))  # 记录会话状态
                    return jsonify(response), 200
                else:
                    return jsonify({'message': '用户名或密码错误'}), 400
        elif email and verification_code:
            cursor.execute("SELECT * FROM verification_codes WHERE email = %s AND code = %s", (email, verification_code))
            code_record = cursor.fetchone()
            if not code_record:
                return jsonify({'message': 'Invalid or expired verification code'}), 400
            cursor.execute("SELECT * FROM user WHERE email = %s", (email,))
            user = cursor.fetchone()
            if user:
                response = {
                    'message': 'Login successful',
                    'email': user['email'],
                    'username': user['username'],
                    'isadmin': isadmin
                }
                return jsonify(response), 200
            else:
                return jsonify({'message': 'Invalid credentials'}), 400
        else:
            return jsonify({'message': 'Invalid login data'}), 400
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

@app.route('/user')
def user():
    return render_template('user_func/user.html')


@app.route('/reset_password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    new_password = data.get('new_password')
    verification_code = data.get('verification_code')

    if not all([email, new_password, verification_code]):
        return jsonify({'message': 'All fields are required'}), 400

    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM verification_codes WHERE email = %s AND code = %s", (email, verification_code))
        code_record = cursor.fetchone()
        if not code_record:
            return jsonify({'message': 'Invalid or expired verification code'}), 400

        hashed_password = generate_password_hash(new_password)
        cursor.execute("UPDATE user SET password = %s WHERE email = %s", (hashed_password, email))
        connection.commit()

        # Optionally, delete the used verification code
        cursor.execute("DELETE FROM verification_codes WHERE email = %s", (email,))
        connection.commit()

        return jsonify({'message': 'Password reset successful'}), 200
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()



@app.route('/first',methods=['GET'])
@requires_user_login
def first():
    print("Session before rendering first page:", dict(session))  # 打印 session 状态
    return render_template('user_func/first.html')

@app.route('/pending_returns',methods=['GET'])
@requires_user_login
def pending_returns():
    return render_template('user_func/pending_returns.html')

@app.route('/approval_status',methods=['GET'])
@requires_user_login
def approval_status():
    return render_template('user_func/approval_status.html')

@app.route('/history_requests',methods=['GET'])
@requires_user_login
def history_requests():
    return render_template('user_func/history_requests.html')

@app.route('/detail')
@requires_user_login
def detail_page():
    itemId = request.args.get('itemId')
    privileges = request.args.get('privileges')
    print(itemId,privileges)
    return render_template('user_func/detail.html', itemId=itemId, privileges=privileges)


@app.route('/admin')
@requires_admin_permission
def admin_page():
    return render_template('admin_func/admin.html')

# 处理借出出库
@app.route('/pending_requests')
@requires_admin_permission
def pending_requests_page():
    return render_template('admin_func/pending_requests.html')

@app.route('/processed_requests')
@requires_admin_permission
def processed_requests():
    return render_template('admin_func/processed_requests.html')

@app.route('/pending_exchanges')
@requires_admin_permission
def pending_exchanges():
    return render_template('admin_func/pending_exchanges.html')

# 处理归还入库
@app.route('/admin_pending_returns')
@requires_admin_permission
def admin_pending_returns():
    return render_template('admin_func/admin_pending_returns.html')

@app.route('/processed_returns')
@requires_admin_permission
def processed_returns():
    return render_template('admin_func/processed_returns.html')

@app.route('/return_exchanges')
@requires_admin_permission
def return_exchanges():
    return render_template('admin_func/return_exchanges.html')

# 物资更改
@app.route('/delete_items')
@requires_admin_permission
def delete_items():
    return render_template('admin_func/delete_items.html')

@app.route('/add_item')
@requires_admin_permission
def add_item_page():
    return render_template('admin_func/add_item.html')

@app.route('/import_items')
@requires_admin_permission
def import_items_page():
    return render_template('admin_func/import_items.html')

# 查询记录
@app.route('/query_records')
@requires_admin_permission
def query_records():
    return render_template('admin_func/query_records.html')

# 线下交接
@app.route('/offline_handover')
@requires_admin_permission
def offline_handover():
    return render_template('admin_func/offline_handover.html')

@app.route('/offline_handover_detail')
@requires_admin_permission
def offline_handover_detail():
    itemId = request.args.get('itemId')
    privileges = request.args.get('privileges')
    print(itemId,privileges)
    return render_template('admin_func/offline_handover_detail.html', itemId=itemId, privileges=privileges)

@app.route("/add_user")
@requires_admin_permission
def add_user_page():
    return render_template('admin_func/add_user.html')


# 物资列表
@app.route('/items', methods=['GET'])
def get_items():
    keyword = request.args.get('keyword', default=None, type=str)
    privileges = request.args.get('privileges', default='图书', type=str)  # 获取权限参数

    # 根据权限获取对应的表名
    table_name, table_id = get_table_info(privileges)

    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        if keyword:
            query = f"SELECT * FROM {table_name} WHERE status = 'available' AND (name LIKE %s OR description LIKE %s)"
            cursor.execute(query, ('%' + keyword + '%', '%' + keyword + '%'))
        else:
            cursor.execute(f"SELECT * FROM {table_name} WHERE status = 'available'")
        items = cursor.fetchall()
        return jsonify(items)
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

#获取物资详情
@app.route('/items/<int:item_id>', methods=['GET'])
def get_item_detail(item_id):
    # 获取权限参数
    privileges = request.args.get('privileges')
    # print(privileges)

    # 根据权限获取对应的表名
    table_name, table_id = get_table_info(privileges)

    if not table_name:
        return jsonify({'message': '无效的权限'}), 400  # 返回400错误，表示无效的权限

    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # 动态执行查询
        # print(table_name)
        # print(item_id)
        cursor.execute(f"SELECT * FROM {table_name} WHERE {table_id} = %s", (item_id,))
        item = cursor.fetchone()
        print(item)
        if item:
            return jsonify(item)
        else:
            return jsonify({'message': 'Item not found'}), 404
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


#预约借用物资
@app.route('/borrow', methods=['POST'])
def borrow_item():
    user_email = request.json.get('user_email')
    item_id = request.json.get('item_id')
    borrow_quantity = request.json.get('borrow_quantity')
    borrow_duration = request.json.get('borrow_duration')
    privileges = request.json.get('privileges')
    print("borrow_quantity:",borrow_quantity)
    # 根据权限获取对应的表名
    table_name, table_id = get_table_info(privileges)


    # 类型转换和验证
    try:
        borrow_quantity = int(borrow_quantity)
        borrow_duration = int(borrow_duration)
        if borrow_quantity <= 0 or borrow_duration <= 0:
            return jsonify({'message': 'Invalid borrow quantity or duration'}), 400
    except ValueError:
        return jsonify({'message': 'Invalid borrow quantity or duration'}), 400

    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    current_time = datetime.now()

    try:
        cursor.execute(f"SELECT * FROM {table_name} WHERE {table_id} = %s", (item_id,))
        item = cursor.fetchone()
        print(item)
        if not item:
            return jsonify({'message': 'Item not found'}), 404
        if item['quantity'] < borrow_quantity:
            return jsonify({'message': 'Item quantity not sufficient'}), 400

        cursor.execute("SELECT username FROM user WHERE email = %s", (user_email,))
        user = cursor.fetchone()
        if not user:
            return jsonify({'message': 'User not found'}), 404
        username = user['username']

        cursor.execute(f"UPDATE {table_name} SET quantity = quantity - %s WHERE {table_id} = %s", (borrow_quantity, item_id))
        cursor.execute(
            "INSERT INTO borrow_requests (user_email, username, item_id, item_name, status, bookingtimestamp, borrow_quantity, borrow_duration,privileges) VALUES (%s, %s, %s, %s, 'pending', %s, %s, %s,%s)",
            (user_email, username, item_id, item['name'], current_time, borrow_quantity, borrow_duration,privileges)
        )
        connection.commit()
        return jsonify({'message': 'Borrow request submitted successfully'})
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()




# # 搜索物资
@app.route('/items/search', methods=['GET'])
def search_items():
    keyword = request.args.get('keyword', '')
    privileges = request.args.get('privileges', '图书')  # 获取权限参数
    print(f"Keyword: {keyword}, Privileges: {privileges}")

    # 根据权限选择对应的表
    table_name, table_id = get_table_info(privileges)


    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = f"SELECT * FROM {table_name} WHERE name LIKE %s AND status = 'available'"
        cursor.execute(query, ('%' + keyword + '%',))
        items = cursor.fetchall()
        return jsonify(items)
    except Error as e:
        print(f"Database error: {str(e)}")  # 打印具体错误信息
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# 获取管理员审批请求列表
@app.route('/admin/requests', methods=['GET'])
def get_admin_requests():
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM borrow_requests")
        requests = cursor.fetchall()


        return jsonify(requests)
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# 批准预约借用请求
@app.route('/admin/approvebooking/<int:request_id>', methods=['POST'])
def approve_request(request_id):
    data = request.json
    admin_email = data.get('admin_email')
    approval_reason = data.get('approval_reason', '')
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("SELECT * FROM adminusers WHERE email = %s", (admin_email,))
        adminInfomation = cursor.fetchone()
        if not adminInfomation:
            return jsonify({'message': 'Admin not found'}), 404

        admin_username = adminInfomation['username']

        cursor.execute("SELECT * FROM borrow_requests WHERE id = %s", (request_id,))
        request_info = cursor.fetchone()
        print(request_info)
        if not request_info:
            return jsonify({'message': 'Request not found'}), 404

        # 获取当前时间
        current_time = datetime.now()
        cursor.execute("UPDATE borrow_requests SET status = 'approvedbook' WHERE id = %s", (request_id,))
        try:
            cursor.execute(
                "INSERT INTO approval_logs (request_id, admin_email, admin_username, user_email, username, item_id, item_name, approval_status, approval_reason, approval_timestamp, exchange_status, borrow_quantity, borrow_duration,privileges) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, 'approved', %s, %s, '0', %s, %s,%s)",
                (request_id, admin_email, admin_username, request_info['user_email'], request_info['username'],
                 request_info['item_id'], request_info['item_name'], approval_reason, current_time,
                 request_info['borrow_quantity'], request_info['borrow_duration'],request_info['privileges'])
            )
            connection.commit()
            return jsonify({'message': 'Request approved successfully'})
        except Error as e:
            return jsonify({'message': str(e)}), 500

    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# 拒绝借用请求
@app.route('/admin/reject/<int:request_id>', methods=['POST'])
def reject_request(request_id):
    data = request.json
    print(data)
    admin_email = data.get('admin_email')
    approval_reason = data.get('approval_reason', '')
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM adminusers WHERE email = %s", (admin_email,))
        adminInfomation = cursor.fetchone()
        if not adminInfomation:
            return jsonify({'message': 'Admin not found'}), 404

        admin_username = adminInfomation['username']
        print(adminInfomation)

        cursor.execute("SELECT * FROM borrow_requests WHERE id = %s", (request_id,))
        request_info = cursor.fetchone()
        print(request_info)
        if not request_info:
            return jsonify({'message': 'Request not found'}), 404
        # 获取当前时间
        current_time = datetime.now()
        cursor.execute("UPDATE borrow_requests SET status = 'rejectedbook' WHERE id = %s", (request_id,))


        try:
            print(1)
            cursor.execute(
                "INSERT INTO approval_logs (request_id, admin_email, admin_username, user_email, username, item_id, item_name, approval_status, approval_reason, approval_timestamp, exchange_status, borrow_quantity, borrow_duration, privileges) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, 'rejected', %s, %s, '0', %s, %s,%s)",
                (request_id, admin_email, admin_username, request_info['user_email'], request_info['username'],
                 request_info['item_id'], request_info['item_name'], approval_reason, current_time,
                 request_info['borrow_quantity'], request_info['borrow_duration'],request_info['privileges'])
            )
            print(1)
            connection.commit()
            return jsonify({'message': 'Request approved successfully'})
        except Error as e:
            return jsonify({'message': str(e)}), 500
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# 获取待处理预约借物请求列表
@app.route('/admin/pending-requests', methods=['GET'])
def get_pending_requests():
    privileges = request.args.get('privileges')  # 从请求的参数中获取权限
    print(privileges)
    # 根据权限获取对应的表名和ID字段
    table_name, table_id = get_table_info(privileges)

    if not table_name or not table_id:
        return jsonify({'error': '无效的权限'}), 400

    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        # 动态构建查询语句
        query = f"""
        SELECT br.id, br.user_email, br.username, i.name, br.borrow_quantity, br.borrow_duration, i.image_url, br.bookingtimestamp
        FROM borrow_requests br
        JOIN {table_name} i ON br.item_id = i.{table_id}
        WHERE br.status = 'pending' AND br.privileges = %s
        """
        cursor.execute(query, (privileges,))

        pending_requests = cursor.fetchall()
        pending_requests.sort(key=lambda x: x['bookingtimestamp'], reverse=False)
        for i in pending_requests:
            if 'bookingtimestamp' in i and i['bookingtimestamp']:
                i['bookingtimestamp'] = convert_format(i['bookingtimestamp'])
        print(pending_requests)
        return jsonify(pending_requests)
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# 获取已处理预约借物请求列表
@app.route('/admin/processed-requests', methods=['GET'])
def get_processed_requests():
    privileges = request.args.get('privileges')  # 从请求的参数中获取权限
    print(privileges)
    # 根据权限获取对应的表名和ID字段
    table_name, table_id = get_table_info(privileges)

    print(f"Table name: {table_name}, Table ID: {table_id}")  # 打印表名和ID字段

    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = f"""
        SELECT al.request_id, al.user_email, al.username, al.item_name, i.image_url, al.approval_timestamp, al.approval_status
        FROM approval_logs al
        JOIN {table_name} i ON al.item_id = i.{table_id}
        WHERE al.exchange_status = 0 AND al.privileges = %s
        ORDER BY al.approval_timestamp DESC
        """
        cursor.execute(query,(privileges,))
        # print(query)
        processed_requests = cursor.fetchall()
        print(processed_requests)
        processed_requests.sort(key=lambda x: x['approval_timestamp'], reverse=True)
        for i in processed_requests:
            if 'approval_timestamp' in i and i['approval_timestamp']:
                i['approval_timestamp'] = convert_format(i['approval_timestamp'])
        return jsonify(processed_requests)
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()



# 撤销已处理预约借物请求
@app.route('/admin/revoke/<int:request_id>', methods=['POST'])
def revoke_request(request_id):
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        # 查询 approval_logs 中的记录
        cursor.execute("SELECT * FROM approval_logs WHERE request_id = %s", (request_id,))
        approval_log = cursor.fetchone()
        if approval_log:
            # 将 borrow_requests 表中对应记录的状态更新为 'pending'
            cursor.execute("UPDATE borrow_requests SET status = 'pending' WHERE id = %s", (request_id,))
            connection.commit()
            # 删除 approval_logs 中的记录
            cursor.execute("DELETE FROM approval_logs WHERE request_id = %s", (request_id,))
            connection.commit()
            return jsonify({'message': 'Request revoked successfully'})
        else:
            return jsonify({'message': 'Processed request not found'}), 404
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# 获取待处理交接出库请求列表
@app.route('/admin/pendingexchanges', methods=['GET'])
def get_pending_exchanges():

    privileges = request.args.get('privileges')  # 从请求的参数中获取权限
    # print(privileges)

    table_name, table_id = get_table_info(privileges)

    # print(f"Table name: {table_name}, Table ID: {table_id}")  # 打印表名和ID字段
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        query = f"""
        SELECT al.*, i.image_url
        FROM approval_logs al
        JOIN {table_name} i ON al.item_id = i.{table_id}
        WHERE al.approval_status = 'approved' AND al.exchange_status = 0 AND al.privileges = %s
        """
        cursor.execute(query,(privileges,))
        pending_exchanges = cursor.fetchall()
        for i in pending_exchanges:
            if 'approval_timestamp' in i and i['approval_timestamp']:
                i['approval_timestamp'] = convert_format(i['approval_timestamp'])
        return jsonify(pending_exchanges), 200
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


#  物资出库
@app.route('/admin/exchange', methods=['POST'])
def handle_exchange():
    print("成功调用handle_exchange后端函数")
    data = request.json
    approval_log_id = data.get('approval_log_id')
    admin_email = data.get('admin_email')
    exchange_type = data.get('exchange_type')
    item_quantity = data.get('item_quantity')
    item_condition = data.get('item_condition')
    exchange_location = data.get('exchange_location')
    # privileges = data.get('privileges')
    remarks = data.get('remarks')

    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM adminusers WHERE email = %s", (admin_email,))
        adminInfomation = cursor.fetchone()
        if not adminInfomation:
            return jsonify({'message': 'Admin not found'}), 404

        admin_username = adminInfomation['username']
        # 获取 borrow_duration
        cursor.execute("SELECT borrow_duration FROM approval_logs WHERE id = %s", (approval_log_id,))
        approval_log = cursor.fetchone()
        if not approval_log:
            return jsonify({'message': 'Approval log not found'}), 404

        borrow_duration = approval_log['borrow_duration']
        # 更新 approval_logs 表的 exchange_status
        cursor.execute("UPDATE approval_logs SET exchange_status = 1 WHERE id = %s", (approval_log_id,))

        cursor.execute("""
            INSERT INTO exchange_logs (
                approval_log_id, admin_email, admin_username, approved_by_admin_email,
                approved_by_admin_username, user_email, user_username, item_id, item_name,
                item_quantity, item_condition, exchange_type, exchange_location, remarks,
                exchange_timestamp, return_due_date, exchange_status,privileges
            )
            SELECT
                al.id, %s, %s, al.admin_email, al.admin_username, al.user_email, al.username,
                al.item_id, al.item_name, %s, %s, %s, %s, %s, NOW(), DATE_ADD(NOW(), INTERVAL %s DAY), 0,al.privileges
            FROM approval_logs al
            WHERE al.id = %s
        """, (admin_email, admin_username, item_quantity, item_condition, exchange_type, exchange_location, remarks,
              borrow_duration, approval_log_id))
        connection.commit()
        return jsonify({'success': True, 'message': 'Exchange recorded successfully'}), 200
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


#获取待处理预约归还列表
@app.route('/admin/pending-returns', methods=['GET'])
def get_pending_return_requests():
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    privileges = request.args.get('privileges')  # 从请求的参数中获取权限
    table_name, table_id = get_table_info(privileges)
    try:
        query = f"""
        SELECT rr.*, i.image_url, el.user_email, el.user_username, el.item_id, el.item_name
        FROM return_requests rr
        JOIN exchange_logs el ON rr.exchange_log_id = el.id
        JOIN {table_name} i ON el.item_id = i.{table_id}
        WHERE rr.status = 'pending' AND rr.privileges = %s
        """
        cursor.execute(query,(privileges,))
        pending_returns = cursor.fetchall()
        pending_returns.sort(key=lambda x: x['return_date'], reverse=False)

        for i in pending_returns:
            if 'return_date' in i and i['return_date']:
                i['return_date'] = convert_format(i['return_date'])

        return jsonify(pending_returns), 200
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

#获取已处理归还请求列表
@app.route('/admin/processed-returns', methods=['GET'])
def get_processed_returns():
    privileges = request.args.get('privileges')
    print(privileges)
    table_name, table_id = get_table_info(privileges)
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = f"""
        SELECT ral.return_request_id, ral.user_email, ral.username, ral.item_name, i.image_url, ral.approval_timestamp, ral.approval_status
        FROM return_approval_logs ral
        JOIN {table_name} i ON ral.item_id = i.{table_id}
        WHERE ral.return_status = 0 AND ral.privileges=%s
        ORDER BY ral.approval_timestamp DESC
        """
        cursor.execute(query,(privileges,))
        processed_returns = cursor.fetchall()
        processed_returns.sort(key=lambda x: x['approval_timestamp'], reverse=True)
        for i in processed_returns:
            if 'approval_timestamp' in i and i['approval_timestamp']:
                i['approval_timestamp'] = convert_format(i['approval_timestamp'])
        return jsonify(processed_returns)
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# 撤销已处理归还请求的接口
@app.route('/admin/revoke-return/<int:return_request_id>', methods=['POST'])
def revoke_return_request(return_request_id):
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    app.logger.info(f'Revoking return request: {return_request_id}')
    print("准备开始执行撤销操作")
    try:
        # 查询 return_approval_logs 中的记录
        cursor.execute("SELECT * FROM return_approval_logs WHERE return_request_id = %s", (return_request_id,))
        return_approval_log = cursor.fetchone()
        if return_approval_log:
            # 将 return_requests 表中对应记录的状态更新为 'pending'
            cursor.execute("UPDATE return_requests SET status = 'pending' WHERE id = %s", (return_request_id,))
            connection.commit()
            # 删除 return_approval_logs 中的记录
            cursor.execute("DELETE FROM return_approval_logs WHERE return_request_id = %s", (return_request_id,))
            connection.commit()
            return jsonify({'success': True, 'message': 'Return request revoked successfully'})
        else:
            app.logger.error(f'Processed return request not found: {return_request_id}')
            return jsonify({'message': 'Processed return request not found'}), 404
    except Error as e:
        app.logger.error(f'Error revoking return request {return_request_id}: {str(e)}')
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()




#用户获取待归还物品
@app.route('/user/pending-returns', methods=['GET'])
def get_pending_returns():
    user_email = request.args.get('user_email')
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # 分别从三个不同类型的物资表中查询 exchange_logs
        query_logs_equipment = """
        SELECT el.*, ie.image_url, (el.item_quantity - el.returned_quantity) AS total_pending_quantity
        FROM exchange_logs el
        JOIN item_equipment ie ON el.item_id = ie.equipment_id
        WHERE el.user_email = %s AND el.exchange_status = 0 AND el.privileges='设备'
        """
        query_logs_books = """
        SELECT el.*, ib.image_url, (el.item_quantity - el.returned_quantity) AS total_pending_quantity
        FROM exchange_logs el
        JOIN item_books ib ON el.item_id = ib.book_id
        WHERE el.user_email = %s AND el.exchange_status = 0 AND el.privileges='图书'
        """
        query_logs_others = """
        SELECT el.*, io.image_url, (el.item_quantity - el.returned_quantity) AS total_pending_quantity
        FROM exchange_logs el
        JOIN item_consumables io ON el.item_id = io.consumable_id
        WHERE el.user_email = %s AND el.exchange_status = 0 AND el.privileges='耗材'
        """

        # 分别执行查询
        pending_returns = []
        cursor.execute(query_logs_equipment, (user_email,))
        pending_returns_equipment = cursor.fetchall()

        cursor.execute(query_logs_books, (user_email,))
        pending_returns_books = cursor.fetchall()

        cursor.execute(query_logs_others, (user_email,))
        pending_returns_others = cursor.fetchall()

        # 合并三个表的查询结果
        pending_returns = pending_returns_equipment + pending_returns_books + pending_returns_others

        # 查询 return_requests 表中的待归还记录
        query_pending = """
        SELECT exchange_log_id, SUM(return_quantity) as pending_return_quantity
        FROM return_requests
        WHERE user_email = %s
          AND privileges IS NOT NULL
          AND (status = 'pending' OR status = 'approved')
        GROUP BY exchange_log_id;
        """
        cursor.execute(query_pending, (user_email,))
        pending_return_requests = cursor.fetchall()
        # print(pending_return_requests)
        # 将待归还请求的数量映射到字典中
        pending_return_dict = {item['exchange_log_id']: item['pending_return_quantity'] for item in pending_return_requests}

        # 计算每个物品的待归还数量，并考虑正在处理的归还请求
        for item in pending_returns:
            pending_quantity = item['total_pending_quantity']
            if item['id'] in pending_return_dict:
                pending_quantity -= pending_return_dict[item['id']]
            item['pending_quantity'] = pending_quantity

        # 只保留 returned_quantity 为 0 的物资项
        pending_returns = [item for item in pending_returns if item['pending_quantity'] > 0]

        # 格式化 return_due_date
        for i in pending_returns:
            if 'return_due_date' in i and i['return_due_date']:
                i['return_due_date'] = convert_format(i['return_due_date'])
        print(pending_returns)
        return jsonify(pending_returns), 200
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()




# 用户预约归还
@app.route('/user/request-return', methods=['POST'])
def request_return():
    data = request.json
    exchange_log_id = data.get('exchange_log_id')
    user_email = data.get('user_email')

    # 校验 return_quantity 是否有效
    return_quantity = data.get('return_quantity')
    if return_quantity is None:
        return jsonify({'message': 'Return quantity is required'}), 400

    try:
        return_quantity = int(return_quantity)
    except ValueError:
        return jsonify({'message': 'Return quantity must be an integer'}), 400

    if return_quantity < 1:
        return jsonify({'message': 'Return quantity must be at least 1'}), 400

    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        # 获取 exchange_logs 中的待归还数量
        cursor.execute("SELECT item_id, item_quantity, returned_quantity, privileges FROM exchange_logs WHERE id = %s",
                       (exchange_log_id,))
        exchange_log = cursor.fetchone()
        if not exchange_log:
            return jsonify({'message': 'Exchange log not found'}), 404

        item_id = exchange_log['item_id']
        total_quantity = exchange_log['item_quantity']
        returned_quantity = exchange_log['returned_quantity']
        privileges = exchange_log['privileges']
        # 获取 return_requests 中 pending 状态的申请数量
        cursor.execute("""
            SELECT SUM(return_quantity) as pending_return_quantity
            FROM return_requests
            WHERE exchange_log_id = %s AND user_email = %s AND status = 'pending'
        """, (exchange_log_id, user_email))
        result = cursor.fetchone()
        pending_return_quantity = result['pending_return_quantity'] if result['pending_return_quantity'] else 0

        # 计算实际待归还数量
        actual_pending_quantity = total_quantity - returned_quantity - pending_return_quantity

        if return_quantity > actual_pending_quantity:
            return jsonify({'message': 'Return quantity exceeds the allowed limit'}), 400

        return_date = datetime.now()  # 获取当前日期时间
        status = 'pending'  # 初始化状态为 'pending'

        cursor.execute("""
            INSERT INTO return_requests (exchange_log_id, user_email, item_id, return_quantity, return_date, status,privileges)
            VALUES (%s, %s, %s, %s, %s, %s,%s)
        """, (exchange_log_id, user_email, item_id, return_quantity, return_date, status,privileges))

        connection.commit()
        return jsonify({'message': 'Return request submitted successfully'}), 200
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# 获取用户审批状态 用户查看自己的预约审批进度
@app.route('/user/approval-statuses', methods=['GET'])
def get_approval_statuses():
    user_email = request.args.get('user_email')

    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        approval_statuses = []

        # 获取borrow_requests表中status为pending的记录 借用预约还没审批的
        cursor.execute("""
            SELECT
                '借用请求' AS request_type,
                br.item_name,
                br.borrow_quantity AS quantity,
                br.bookingtimestamp AS request_timestamp,
                '待管理员审批' AS status
            FROM
                borrow_requests br
            WHERE br.status = 'pending'
                AND br.user_email = %s
                AND br.privileges IS NOT NULL
                AND br.privileges <> ''
        """, (user_email,))
        approval_statuses.extend(cursor.fetchall())

        # 获取approval_logs表中approval_status为approved且exchange_status为0的记录 通过预约还没有交接的
        cursor.execute("""
            SELECT
                '借用请求' AS request_type,
                br.item_name,
                br.borrow_quantity AS quantity,
                al.approval_timestamp AS request_timestamp,
                '预约成功，待交接借用' AS status
            FROM
                approval_logs al
            LEFT JOIN borrow_requests br ON al.request_id = br.id
            WHERE al.approval_status = 'approved'
            AND al.exchange_status = 0
            AND br.user_email = %s
            AND br.privileges IS NOT NULL
            AND br.privileges <> ''
        """, (user_email,))
        approval_statuses.extend(cursor.fetchall())

        # 获取return_requests表中status为pending的记录
        # 定义表名及其对应的权限和 ID 字段
        tables = {
            'equipment': {'privilege': '设备', 'id_field': 'equipment_id'},
            'books': {'privilege': '图书', 'id_field': 'book_id'},
            'consumables': {'privilege': '耗材', 'id_field': 'consumable_id'}
        }
        # 遍历每个表并执行查询
        for table, info in tables.items():
            privilege = info['privilege']
            id_field = info['id_field']
            query = f"""
            SELECT
                '归还请求' AS request_type,
                CASE
                    WHEN rr.PRIVILEGES = '{privilege}' THEN b.NAME
                    ELSE NULL
                END AS item_name,
                rr.return_quantity AS quantity,
                rr.created_at AS request_timestamp,
                '待管理员审批' AS status
            FROM
                return_requests rr
            LEFT JOIN item_{table} b ON rr.item_id = b.{id_field}
            WHERE
                rr.STATUS = 'pending'
                AND rr.user_email = %s
                AND rr.PRIVILEGES = '{privilege}'
            """
            # 执行查询
            cursor.execute(query, (user_email,))
            # 获取结果并追加到结果列表
            approval_statuses.extend(cursor.fetchall())

            # 获取exchange_logs表中exchange_status为0且return_approval_logs表中approval_status为approved的记录  归还预约通过还没交接的
        for table, info in tables.items():
            privilege = info['privilege']
            id_field = info['id_field']
            # 构造查询语句
            query = f"""
            SELECT
                '归还请求' AS request_type,
                i.name AS item_name,
                ral.return_quantity AS quantity,
                ral.approval_timestamp AS request_timestamp,
                '预约成功，待交接归还' AS status
            FROM exchange_logs el
            LEFT JOIN return_requests rr ON el.id = rr.exchange_log_id
            LEFT JOIN return_approval_logs ral ON rr.id = ral.return_request_id
            LEFT JOIN item_{table} i ON el.item_id = i.{id_field}
            WHERE el.exchange_status = 0
                AND ral.approval_status = 'approved'
                AND el.user_email = %s
                AND rr.PRIVILEGES = '{privilege}'
            """
            # 执行查询
            cursor.execute(query, (user_email,))
            # 获取结果并追加到结果列表
            approval_statuses.extend(cursor.fetchall())
            # 根据 request_timestamp 进行排序，时间新的在上面
        approval_statuses.sort(key=lambda x: x['request_timestamp'], reverse=True)
        for i in approval_statuses:
            if 'request_timestamp' in i and i['request_timestamp']:
                i['request_timestamp'] = convert_format(i['request_timestamp'])
        return jsonify(approval_statuses), 200

    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()





# 获取用户历史申请记录
@app.route('/user/history-requests', methods=['GET'])
def get_history_requests():
    user_email = request.args.get('user_email')

    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        history_requests = []

        # 获取borrow_requests表中status为rejectedbook的记录
        cursor.execute("""
            SELECT
                '预约失败' AS status,
                br.item_name,
                br.borrow_quantity AS quantity,
                br.bookingtimestamp AS request_timestamp,
                br.bookingtimestamp AS borrow_timestamp
            FROM borrow_requests br
            WHERE br.status = 'rejectedbook' AND br.user_email = %s
        """, (user_email,))
        history_requests.extend(cursor.fetchall())

        # 获取exchange_logs表中exchange_status为0（未归还）的记录
        cursor.execute("""
            SELECT
                '未归还' AS status,
                el.item_name,
                el.item_quantity AS quantity,
                el.exchange_timestamp AS request_timestamp,
                br.bookingtimestamp AS borrow_timestamp
            FROM exchange_logs el
            LEFT JOIN approval_logs al ON el.approval_log_id = al.id
            LEFT JOIN borrow_requests br ON al.request_id = br.id
            WHERE el.exchange_status = 0 AND el.user_email = %s
        """, (user_email,))
        history_requests.extend(cursor.fetchall())

        # 获取exchange_logs表中exchange_status为1（已归还）的记录
        cursor.execute("""
            SELECT
                '已归还' AS status,
                el.item_name,
                el.item_quantity AS quantity,
                el.return_timestamp AS request_timestamp,
                br.bookingtimestamp AS borrow_timestamp
            FROM exchange_logs el
            LEFT JOIN approval_logs al ON el.approval_log_id = al.id
            LEFT JOIN borrow_requests br ON al.request_id = br.id
            WHERE el.exchange_status = 1 AND el.user_email = %s
        """, (user_email,))
        history_requests.extend(cursor.fetchall())

        # 根据 borrow_timestamp 进行排序，时间新的在上面
        history_requests.sort(key=lambda x: x['borrow_timestamp'], reverse=True)
        for i in history_requests:
            if 'borrow_timestamp' in i and i['borrow_timestamp']:
                i['borrow_timestamp'] = convert_format(i['borrow_timestamp'])
            if 'request_timestamp' in i and i['request_timestamp']:
                i['request_timestamp'] = convert_format(i['request_timestamp'])

        return jsonify(history_requests), 200

    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()



#处理管理员审批预约归还请求
@app.route('/admin/approve-return', methods=['POST'])
def approve_return_request():
    data = request.json
    return_request_id = data.get('return_request_id')
    admin_email = data.get('admin_email')
    approval_status = data.get('approval_status')
    approval_reason = data.get('approval_reason', '')
    privileges = data.get('privileges')
    print(privileges)
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM adminusers WHERE email = %s", (admin_email,))
        adminInfo = cursor.fetchone()
        if not adminInfo:
            return jsonify({'message': 'Admin not found'}), 404

        admin_username = adminInfo['username']

        # 获取 return_request 的详细信息
        cursor.execute("""
            SELECT el.user_email, el.user_username, el.item_id, el.item_name, rr.return_quantity
            FROM return_requests rr
            JOIN exchange_logs el ON rr.exchange_log_id = el.id
            WHERE rr.id = %s AND rr.privileges =%s
        """, (return_request_id,privileges,))
        return_request = cursor.fetchone()

        if not return_request:
            return jsonify({'message': 'Return request not found'}), 404

        user_email = return_request['user_email']
        username = return_request['user_username']
        item_id = return_request['item_id']
        item_name = return_request['item_name']
        return_quantity = return_request['return_quantity']

        # 插入 return_approval_logs 表
        cursor.execute("""
            INSERT INTO return_approval_logs (
                return_request_id, admin_email, admin_username, user_email, username, return_status,
                item_id, item_name, return_quantity, approval_status, approval_reason,privileges
            ) VALUES (%s, %s, %s, %s, %s, 0, %s, %s, %s, %s, %s,%s)
        """, (return_request_id, admin_email, admin_username, user_email, username, item_id, item_name, return_quantity, approval_status, approval_reason,privileges))

        # 更新 return_requests 表
        cursor.execute("""
            UPDATE return_requests
            SET status = %s
            WHERE id = %s
        """, (approval_status, return_request_id))

        connection.commit()
        return jsonify({'message': 'Return request approved successfully'}), 200
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# 获取通过归还预约待交接归还记录
@app.route('/admin/pendingreturnsexchanges', methods=['GET'])
def get_pending_returns_exchanges():
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    privileges = request.args.get('privileges')
    table_name , table_id = get_table_info(privileges)
    try:
        cursor.execute(f"""
            SELECT
                ral.id,
                ral.user_email,
                ral.username,
                ral.admin_email,
                ral.admin_username,
                i.name AS item_name,
                rr.return_quantity,
                i.image_url,
                ral.approval_timestamp
            FROM return_approval_logs ral
            LEFT JOIN return_requests rr ON ral.return_request_id = rr.id
            LEFT JOIN {table_name} i ON ral.item_id = i.{table_id}
            WHERE ral.approval_status = 'approved' AND ral.return_status = '0' AND ral.privileges = %s
        """,(privileges,))

        pending_returns = cursor.fetchall()
        return jsonify(pending_returns), 200

    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()




# 处理归还交接入库
@app.route('/admin/returnexchange', methods=['POST'])
def handle_return_exchange():
    data = request.get_json()

    return_approval_log_id = data['return_approval_log_id']
    admin_email = data['admin_email']
    return_quantity = data['return_quantity']
    item_condition = data['item_condition']
    exchange_location = data['exchange_location']
    remarks = data['remarks']

    connection = create_db_connection()
    cursor = connection.cursor()

    try:
        # 找到 exchange_log_id
        cursor.execute("""
            SELECT rr.exchange_log_id
            FROM return_requests rr
            JOIN return_approval_logs ral ON ral.return_request_id = rr.id
            WHERE ral.id = %s AND ral.approval_status = 'approved'
        """, (return_approval_log_id,))
        result = cursor.fetchone()
        if result is None:
            raise ValueError("找不到对应的 approved exchange_log_id")
        exchange_log_id = result[0]
        print(f"Exchange Log ID: {exchange_log_id}")

        # 获取当前的 item_condition, return_exchange_location, return_remarks, item_quantity, returned_quantity
        cursor.execute("""
            SELECT item_condition, return_exchange_location, return_remarks, item_quantity, returned_quantity,privileges
            FROM exchange_logs
            WHERE id = %s
        """, (exchange_log_id,))
        current_log = cursor.fetchone()
        if current_log is None:
            raise ValueError("找不到对应的 exchange_log 记录")

        current_item_condition = current_log[0] if current_log[0] else ""
        current_exchange_location = current_log[1] if current_log[1] else ""
        current_remarks = current_log[2] if current_log[2] else ""
        item_quantity = current_log[3]
        returned_quantity = current_log[4]
        privileges = current_log[5]
        # 拼接新的信息
        new_item_condition = f"{current_item_condition},{item_condition}" if current_item_condition else item_condition
        new_exchange_location = f"{current_exchange_location},{exchange_location}" if current_exchange_location else exchange_location
        new_remarks = f"{current_remarks},{remarks}" if current_remarks else remarks

        # 打印调试信息
        print(f"Item Quantity: {item_quantity}, Returned Quantity: {returned_quantity}")
        print(f"New Item Condition: {new_item_condition}")
        print(f"New Exchange Location: {new_exchange_location}")
        print(f"New Remarks: {new_remarks}")

        # 更新 exchange_logs 表中的 returned_quantity, item_condition, return_exchange_location, return_remarks
        cursor.execute("""
            UPDATE exchange_logs
            SET returned_quantity = returned_quantity + %s,
                item_condition = %s,
                return_exchange_location = %s,
                return_remarks = %s,
                return_timestamp = NOW()
            WHERE id = %s
        """, (return_quantity, new_item_condition, new_exchange_location, new_remarks, exchange_log_id))

        # 检查 exchange_logs 更新后的状态
        cursor.execute("SELECT returned_quantity, item_quantity FROM exchange_logs WHERE id = %s", (exchange_log_id,))
        updated_returned_quantity, item_quantity = cursor.fetchone()

        if updated_returned_quantity >= item_quantity:
            cursor.execute("""
                UPDATE exchange_logs
                SET exchange_status = 1
                WHERE id = %s
            """, (exchange_log_id,))
            updated_exchange_status = 1
        else:
            cursor.execute("""
                UPDATE exchange_logs
                SET exchange_status = 0
                WHERE id = %s
            """, (exchange_log_id,))
            updated_exchange_status = 0

        print(f"Updated Exchange Status in exchange_logs: {updated_exchange_status}")
        print(f"Updated Returned Quantity in exchange_logs: {updated_returned_quantity}")

        # 更新 return_approval_logs 表中的 return_status 为 1
        cursor.execute("""
            UPDATE return_approval_logs
            SET return_status = 1
            WHERE id = %s AND approval_status = 'approved'
        """, (return_approval_log_id,))

        # 检查更新是否成功
        cursor.execute("SELECT return_status FROM return_approval_logs WHERE id = %s AND approval_status = 'approved'", (return_approval_log_id,))
        updated_status = cursor.fetchone()[0]
        print(f"Updated Return Status in return_approval_logs: {updated_status}")

        table_name , table_id = get_table_info(privileges)
        # 更新 items 表中的数量
        cursor.execute(f"""
            UPDATE {table_name}
            SET quantity = quantity + %s
            WHERE {table_id} = (SELECT item_id FROM return_requests WHERE id = (SELECT return_request_id FROM return_approval_logs WHERE id = %s))
        """, (return_quantity, return_approval_log_id))

        connection.commit()
        return jsonify({'success': True, 'message': '成功处理归还交接'}), 200

    except Error as e:
        connection.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# 更新后
# 管理员获取物资列表
@app.route('/admin/items', methods=['GET'])
def admin_get_items():
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)

    privileges = request.args.get('privileges')
    issuper = request.args.get('issuper')  # 获取是否是超级管理员的参数
    print(issuper)
    print(privileges)
    print(issuper)
    try:
        if issuper == 1:
            if privileges == '图书':
                query = "SELECT book_id AS id, name, summary AS description, status, quantity, image_url FROM item_books"
            elif privileges == '设备':
                query = "SELECT equipment_id AS id, name, model AS description, status, quantity, image_url FROM item_equipment"
            elif privileges == '耗材':
                query = "SELECT consumable_id AS id, name, manufacturer AS description, status, quantity, image_url FROM item_consumables"
        elif privileges == '图书':
            query = "SELECT book_id AS id, name, summary AS description, status, quantity, image_url FROM item_books"
        elif privileges == '设备':
            query = "SELECT equipment_id AS id, name, model AS description, status, quantity, image_url FROM item_equipment"
        elif privileges == '耗材':
            query = "SELECT consumable_id AS id, name, manufacturer AS description, status, quantity, image_url FROM item_consumables"
        else:
            return jsonify({'message': '无效权限'}), 403

        cursor.execute(query)
        items = cursor.fetchall()
        logging.basicConfig(level=logging.INFO, format='%(message)s')
        logging.info(items)
        return jsonify(items)
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()




#管理员更新物资状态
@app.route('/admin/items/<int:item_id>/status', methods=['PUT'])
def update_item_status(item_id):
    print(f"Received update request for item_id: {item_id}")  # 添加这个打印
    data = request.json
    new_status = data.get('status')
    privileges = request.args.get('privileges', '')
    print(f"New status: {new_status}, Privileges: {privileges}")  # 打印新的状态和权限

    connection = create_db_connection()
    cursor = connection.cursor()
    try:
        if privileges == '图书':
            cursor.execute("UPDATE item_books SET status = %s WHERE book_id = %s", (new_status, item_id))
        elif privileges == '设备':
            cursor.execute("UPDATE item_equipment SET status = %s WHERE equipment_id = %s", (new_status, item_id))
        elif privileges == '耗材':
            cursor.execute("UPDATE item_consumables SET status = %s WHERE consumable_id = %s", (new_status, item_id))

        connection.commit()
        return jsonify({'message': 'Item status updated successfully'})
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


#管理员删除物资
@app.route('/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)

    privileges = request.args.get('privileges', '')

    try:
        if privileges == '图书':
            cursor.execute("DELETE FROM item_books WHERE id = %s", (item_id,))
        elif privileges == '设备':
            cursor.execute("DELETE FROM item_equipment WHERE id = %s", (item_id,))
        elif privileges == '耗材':
            cursor.execute("DELETE FROM item_consumables WHERE id = %s", (item_id,))

        connection.commit()
        return jsonify({'message': 'Item deleted successfully'})
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# 管理员增加单条物资
@app.route('/items', methods=['POST'])
def add_item():
    data = request.get_json()
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    print(data)
    try:
        # 从请求数据中获取权限
        privileges = data.get('privileges', '')
        print(privileges)
        if privileges == '图书':
            cursor.execute(
                "INSERT INTO item_books (name, type, author, summary, publisher, publication_date, edition, image_url, isbn, quantity, status, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())",
                (data['name'], data.get('type', ''), data['author'], data.get('summary', ''), data['publisher'],
                 data['publication_date'], data.get('edition', ''), data['image_url'], data['isbn'],
                 data['quantity'], data['status'])
            )
        elif privileges == '设备':
            print("Inserting data:", data)
            cursor.execute(
                "INSERT INTO item_equipment (name, type, manufacturer, model, serial_number, purchase_date, warranty_expiry, quantity, status, created_at, updated_at, image_url) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), %s)",
                (data['name'], data.get('type', ''), data['manufacturer'], data['model'], data['serial_number'],
                 data['purchase_date'], data['warranty_expiry'], data['quantity'], data['status'],
                 data['image_url'])
            )
        elif privileges == '耗材':
            cursor.execute(
                "INSERT INTO item_consumables (name, type, manufacturer, quantity, unit, expiration_date, status, created_at, updated_at, image_url) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), %s)",
                (data['name'], data.get('type', ''), data['manufacturer'], data['quantity'], data['unit'],
                 data['expiration_date'], data['status'], data['image_url'])
            )

        connection.commit()
        return jsonify({'message': 'Item added successfully'}), 201
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()


# 管理员文件导入物资
@app.route('/import-items', methods=['POST'])
def import_items():
    privileges = request.form.get('privileges')  # 获取权限
    file = request.files['file']

    # 打印调试信息
    print(f"Received privileges: {privileges}")
    print(f"Received files: {file}")

    temp_dir = tempfile.gettempdir()
    file_path = os.path.join(temp_dir, file.filename)
    file.save(file_path)

    try:
        df = pd.read_excel(file_path)
        print(f"DataFrame columns: {df.columns}")

        connection = create_db_connection()
        cursor = connection.cursor()

        if privileges == '图书':
            for index, row in df.iterrows():
                cursor.execute(
                    "INSERT INTO item_books (name, type, author, summary, publisher, publication_date, edition, image_url, isbn, quantity, status, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())",
                    (row['name'], row['type'], row['author'], row['summary'], row['publisher'], row['publication_date'],
                     row['edition'], row['image_url'], row['isbn'], row['quantity'], row['status'])
                )

        elif privileges == '设备':
            for index, row in df.iterrows():
                cursor.execute(
                    "INSERT INTO item_equipment (name, type, manufacturer, model, serial_number, purchase_date, warranty_expiry, quantity, status, created_at, updated_at, image_url) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), %s)",
                    (row['name'], row['type'], row['manufacturer'], row['model'], row['serial_number'],
                     row['purchase_date'], row['warranty_expiry'], row['quantity'], row['status'], row['image_url'])
                )

        elif privileges == '耗材':
            for index, row in df.iterrows():
                cursor.execute(
                    "INSERT INTO item_consumables (name, type, manufacturer, quantity, unit, expiration_date, status, created_at, updated_at, image_url) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), %s)",
                    (
                        row['name'], row['type'], row['manufacturer'], row['quantity'], row['unit'],
                        row['expiration_date'],
                        row['status'], row['image_url'])
                )

        connection.commit()
        return jsonify({'message': 'Items imported successfully'})

    except Exception as e:
        print(f"An error occurred: {e}")  # 输出错误信息
        connection.rollback()  # 回滚事务
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()
        os.remove(file_path)

#增加用户
@app.route('/add_User', methods=['POST'])
def add_user():
    data = request.json
    print(data)
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    issuper = data.get('issuper')
    privileges = data.get('permission')
    if not email or not username or not password:
        return jsonify({'message': '缺少必填字段'}), 400
    hashed_password = generate_password_hash(password)
    connection = create_db_connection()
    cursor = connection.cursor()

    try:
        if issuper in ['0', '1']:
            cursor.execute(
                "INSERT INTO adminusers (email, username, password, issuper,privileges) VALUES (%s, %s, %s, %s, %s)",
                (email, username, hashed_password, issuper, privileges)
            )
        else:
            cursor.execute(
                "INSERT INTO user (email, username, password) VALUES (%s, %s, %s)",
                (email, username, hashed_password)
            )
        connection.commit()
        return jsonify({'message': '用户添加成功'}), 200
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# 查询用户记录
@app.route('/query_user_records', methods=['POST'])
def query_user_records():
    data = request.json
    email = data.get('user_email')

    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # 查询用户信息
        cursor.execute("SELECT * FROM user WHERE email = %s", (email,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'message': 'User not found'}), 404

        # 查询用户的借用记录
        cursor.execute("""
            SELECT
                br.user_email,
                br.username,
                br.item_name,
                br.borrow_quantity,
                br.bookingtimestamp,
                br.status as borrow_status,
                al.approval_status,
                al.approval_timestamp,
                al.exchange_status as approval_exchange_status,
                el.exchange_status as exchange_status,
                el.exchange_timestamp,
                el.returned_quantity,
                el.return_due_date,
                el.return_timestamp
            FROM borrow_requests br
            LEFT JOIN approval_logs al ON br.id = al.request_id
            LEFT JOIN exchange_logs el ON al.id = el.approval_log_id
            WHERE br.user_email = %s
            ORDER BY br.bookingtimestamp DESC
        """, (email,))
        records = cursor.fetchall()

        user_records = []
        for record in records:
            if record['approval_status'] == 'rejectedbook':
                user_records.append({
                    'email': record['user_email'],
                    'username': record['username'],
                    'item_name': record['item_name'],
                    'borrow_quantity': record['borrow_quantity'],
                    'bookingtimestamp': convert_format(record['bookingtimestamp']),
                    'status': '预约被拒绝',
                    'rejected_timestamp': convert_format(record['approval_timestamp'])
                })
            elif record['approval_status'] == 'approvedbook' and record['approval_exchange_status'] == 0:
                user_records.append({
                    'email': record['user_email'],
                    'username': record['username'],
                    'item_name': record['item_name'],
                    'borrow_quantity': record['borrow_quantity'],
                    'bookingtimestamp': convert_format(record['bookingtimestamp']),
                    'approval_timestamp': convert_format(record['approval_timestamp']),
                    'status': '待交接'
                })
            elif record['approval_exchange_status'] == 1 and record['exchange_status'] == 0:
                user_records.append({
                    'email': record['user_email'],
                    'username': record['username'],
                    'item_name': record['item_name'],
                    'borrow_quantity': record['borrow_quantity'],
                    'bookingtimestamp': convert_format(record['bookingtimestamp']),
                    'approval_timestamp': convert_format(record['approval_timestamp']),
                    'exchange_timestamp': convert_format(record['exchange_timestamp']),
                    'status': '待归还',
                    'return_due_date': convert_format(record['return_due_date'])
                })
            elif record['approval_exchange_status'] == 1 and record['exchange_status'] == 1:
                if record['returned_quantity'] < record['borrow_quantity']:
                    user_records.append({
                        'email': record['user_email'],
                        'username': record['username'],
                        'item_name': record['item_name'],
                        'borrow_quantity': record['borrow_quantity'],
                        'bookingtimestamp': convert_format(record['bookingtimestamp']),
                        'approval_timestamp': convert_format(record['approval_timestamp']),
                        'exchange_timestamp': convert_format(record['exchange_timestamp']),
                        'returned_quantity': record['returned_quantity'],
                        'return_timestamp': convert_format(record['return_timestamp']),
                        'return_due_date': convert_format(record['return_due_date']),
                        'status': '部分归还'
                    })
                else:
                    user_records.append({
                        'email': record['user_email'],
                        'username': record['username'],
                        'item_name': record['item_name'],
                        'borrow_quantity': record['borrow_quantity'],
                        'bookingtimestamp': convert_format(record['bookingtimestamp']),
                        'approval_timestamp': convert_format(record['approval_timestamp']),
                        'exchange_timestamp': convert_format(record['exchange_timestamp']),
                        'return_timestamp': convert_format(record['return_timestamp']),
                        'status': '已归还'
                    })
        user_records.sort(key=lambda x: x['bookingtimestamp'], reverse=True)
        print(user_records)
        return jsonify(user_records), 200
    except Exception as e:
        print(e)
        return jsonify({'message': 'Internal Server Error'}), 500
    finally:
        cursor.close()
        connection.close()





# 查询根据管理员权限不同获得不同页面
@app.route('/admin/offline/diff_items', methods=['GET'])
def get_diff_items(admin_privileges):
    connection = create_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        if admin_privileges=="所有":
            query = "SELECT * FROM items "
        else:
            query = "SELECT * FROM items where category = %s", (admin_privileges)

        cursor.execute(query)
        items = cursor.fetchall()
        return jsonify(items)
    except Error as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        connection.close()

# 获取用户的借用记录
@app.route('/get_return_records', methods=['POST'])
def get_return_records():
    data = request.json
    print(data)
    person_name = data['person_name']
    item_id = data['item_id']
    item_name = data['item_name']
    connection = create_db_connection()
    if connection is None:
        return jsonify({'error': '数据库连接失败'}), 500

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(
            "SELECT id, borrow_time, borrow_quantity, return_quantity FROM offline_records "
            "WHERE person_name = %s AND item_id = %s And item_name = %s AND status = 'borrowed'",
            (person_name,item_id, item_name)
        )
        records = cursor.fetchall()
        cursor.close()
        print(records)
        return jsonify(records)
    except Error as e:
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()


# 线下借用物品的API
@app.route('/borrow_offline', methods=['POST'])
def borrow_item_offline():
    data = request.json
    print(data)
    item_id = data['item_id']
    item_name = data['item_name']
    borrow_quantity = data['borrow_quantity']
    location = data['location']
    duration = data['duration']
    person_name = data['person_name']
    borrow_time = datetime.now()
    expected_return_time = borrow_time + timedelta(days=duration)
    privileges = data['privileges']
    privilege_to_table = {'图书': 'item_books','设备': 'item_equipment','耗材': 'item_consumables' }
    id_get = {'图书': 'book_id','设备': 'equipment_id','耗材': 'consumable_id' }
    # 根据权限获取对应的表名
    table_name = privilege_to_table.get(privileges)
    table_id = id_get.get(privileges)


    connection = create_db_connection()
    if connection is None:
        return jsonify({'error': '数据库连接失败'}), 500

    try:
        cursor = connection.cursor()
        cursor.execute(
            "INSERT INTO offline_records (item_id, item_name, person_name, borrow_quantity, borrow_location, borrow_time, expected_return_time, status,privileges) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s,%s)",
            (item_id, item_name, person_name, borrow_quantity, location, borrow_time, expected_return_time, 'borrowed',privileges)
        )
        # 更新 items 表中的数量
        cursor.execute(f"UPDATE {table_name} SET quantity = quantity - %s WHERE {table_id} = %s",(borrow_quantity, item_id))

        connection.commit()
        cursor.close()
        return jsonify({'message': '借出成功'})
    except Error as e:
        connection.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        connection.close()

#线下交接归还物品
@app.route('/return_offline', methods=['POST'])
def return_item_offline():
    data = request.json
    item_id = data['item_id']
    return_quantity = data['return_quantity']
    location = data['location']
    person_name = data['person_name']
    item_condition = data['item_condition']
    record_id = data['record_id']
    privileges = data['privileges']

    actual_return_time = datetime.now()
    privilege_to_table = {'图书': 'item_books', '设备': 'item_equipment', '耗材': 'item_consumables'}
    id_get = {'图书': 'book_id', '设备': 'equipment_id', '耗材': 'consumable_id'}

    # 根据权限获取对应的表名
    table_name = privilege_to_table.get(privileges)
    table_id = id_get.get(privileges)

    if not table_name or not table_id:
        return jsonify({'error': '无效的权限'}), 400

    connection = create_db_connection()
    if connection is None:
        return jsonify({'error': '数据库连接失败'}), 500

    try:
        cursor = connection.cursor()

        # 获取借用记录的当前状态
        cursor.execute(
            "SELECT borrow_quantity, return_quantity FROM offline_records WHERE id = %s AND status = 'borrowed'",
            (record_id,)
        )
        record = cursor.fetchone()
        if not record:
            return jsonify({'error': '未找到借用记录或该记录已归还'}), 404

        borrow_quantity, current_return_quantity = record
        new_return_quantity = current_return_quantity + return_quantity

        # 更新借用记录的归还数量
        if new_return_quantity >= borrow_quantity:
            status = 'returned'
            new_return_quantity = borrow_quantity  # 确保归还数量不超过借用数量
        else:
            status = 'borrowed'

        cursor.execute(
            "UPDATE offline_records SET return_quantity = %s, return_location = %s, actual_return_time = %s, item_condition = %s, status = %s "
            "WHERE id = %s AND status = 'borrowed'",
            (new_return_quantity, location, actual_return_time, item_condition, status, record_id)
        )

        # 更新 items 表中的数量
        cursor.execute(
            f"UPDATE {table_name} SET quantity = quantity + %s WHERE {table_id} = %s",
            (return_quantity, item_id)
        )

        connection.commit()
        cursor.close()
        return jsonify({'message': '归还成功'})
    except Error as e:
        connection.rollback()
        return jsonify({'error': '处理请求时发生错误'}), 500  # 不暴露具体的错误信息
    finally:
        connection.close()

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://127.0.0.1:5000'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

if __name__ == '__main__':
    app.run(debug=True)
