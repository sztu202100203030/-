#
# from werkzeug.security import generate_password_hash, check_password_hash
#
#
# a = generate_password_hash(str(1))  # 在哈希之前将 1 转换为字符串
# # stored_hash = "scrypt:32768:8:1$q5w1NBgXCW6m0Rmg$f3d4be3a5e610bfca914ccea3014573742ee379f8cfa01f518a4f01cd0ba99cd1bdf7b24cf38f040526697771e82cfda6cc5d661c53c9f20d1725f847c08f2d9"
# # b = generate_password_hash(str(1), method='scrypt')
# b=
# is_match = check_password_hash(str(1), a)
# print(is_match)
from werkzeug.security import generate_password_hash, check_password_hash

# 假设从数据库中获取的哈希值
stored_hash = "scrypt:32768:8:1$ccPagmpmbb9G5hW8$e178e9056299a2048a5e7a5ca8059484479fddd46ea2b45c7265d009ae23954769f9fee2a8c64e63d9e78b1bd08db46fab9715aeb63c25e62e31dda17468b0e3"

# 获取用户输入的密码
password_input = input("请输入密码：")
print(type(password_input))
b=generate_password_hash(str(1))
# 检查密码是否匹配
is_match = check_password_hash(stored_hash, password_input)
print(is_match)