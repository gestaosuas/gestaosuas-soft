from apps.directorates.models import Directorate
try:
    directorates = Directorate.objects.all()[:5]
    print(f"Found {Directorate.objects.count()} directorates.")
    for d in directorates:
        print(f"ID: {d.id}, Name: {d.name}")
except Exception as e:
    print(f"Error: {e}")
