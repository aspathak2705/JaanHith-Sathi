import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.scripts.import_excel_to_db import import_excel_to_db


if __name__ == "__main__":
    count = import_excel_to_db(clear_existing=True)
    print(f"Imported {count} polling booths into SQLite.")
