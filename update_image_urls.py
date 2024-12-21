# update_image_urls.py
import mysql.connector
from mysql.connector import Error

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

def update_image_urls():
    connection = create_db_connection()
    cursor = connection.cursor()
    try:
        # 查询所有物资
        cursor.execute("SELECT id, name FROM items")
        items = cursor.fetchall()

        for item in items:
            item_id, item_name = item
            # 图片的 URL 格式为 http://example.com/static/images/{item_name}.jpg
            image_url = f"http://localhost:5000/static/images/{item_name}.jpg"
            # 更新物资的 image_url 列
            cursor.execute("UPDATE items SET image_url = %s WHERE id = %s", (image_url, item_id))

        connection.commit()
    finally:
        cursor.close()
        connection.close()

if __name__ == '__main__':
    update_image_urls()









