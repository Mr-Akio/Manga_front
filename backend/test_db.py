import MySQLdb
try:
    db = MySQLdb.connect(host="localhost", user="root", passwd="062558", db="manga_db", port=3306)
    print("SUCCESS: Connected to database!")
    cursor = db.cursor()
    cursor.execute("SHOW TABLES LIKE 'mangas_comment';")
    result = cursor.fetchone()
    if result:
        print("SUCCESS: Comment table exists.")
    else:
        print("FAILURE: Comment table DOES NOT exist.")
    db.close()
except Exception as e:
    print(f"FAILURE: {e}")
