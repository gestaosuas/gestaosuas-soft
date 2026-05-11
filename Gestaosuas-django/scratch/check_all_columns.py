from django.db import connections
tables = ['oscs', 'submissions', 'daily_reports', 'work_plans', 'visits', 'form_delegations']
with connections['app_data'].cursor() as cursor:
    for table in tables:
        cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}'")
        columns = [row[0] for row in cursor.fetchall()]
        print(f"Columns in {table}:")
        for c in columns:
            print(f"  - {c}")
