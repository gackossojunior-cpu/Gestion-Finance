import MySQLdb

# Test different user/password combinations
credentials = [
    ('junior', 'junior'),
    ('Junior', 'junior2.0'),
    ('root', ''),  # Try empty password for root
    ('root', 'root'),
]

for user, passwd in credentials:
    try:
        conn = MySQLdb.connect(host='localhost', port=3306, user=user, passwd=passwd, db='gestion_finance_uccb')
        print(f'SUCCESS: connected as {user}@{conn.get_host_info()}')
        conn.close()
        break
    except Exception as e:
        print(f'FAILED: {user} - {type(e).__name__}: {e}')
else:
    print('No valid credentials found')
