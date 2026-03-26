import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
db_path = os.path.join(INSTANCE_DIR, 'appointments.db')

def migrate_database():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Vérifier les colonnes existantes
    cursor.execute("PRAGMA table_info(appointments)")
    columns = [col[1] for col in cursor.fetchall()]
    
    print(f"Colonnes existantes: {columns}")
    
    # Ajouter les colonnes manquantes une par une
    if 'payment_status' not in columns:
        print("➕ Ajout de payment_status...")
        cursor.execute("ALTER TABLE appointments ADD COLUMN payment_status TEXT DEFAULT 'pending'")
    
    if 'payment_intent_id' not in columns:
        print("➕ Ajout de payment_intent_id...")
        cursor.execute("ALTER TABLE appointments ADD COLUMN payment_intent_id TEXT")
    
    if 'status' not in columns:
        print("➕ Ajout de status...")
        cursor.execute("ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT 'confirmed'")
    
    # Mettre à jour les données existantes
    cursor.execute("UPDATE appointments SET payment_status = 'pending' WHERE payment_status IS NULL")
    cursor.execute("UPDATE appointments SET status = 'confirmed' WHERE status IS NULL")
    
    # Vérifier la table invoices
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='invoices'")
    if not cursor.fetchone():
        print("➕ Création de la table invoices...")
        cursor.execute('''
            CREATE TABLE invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                appointment_id INTEGER,
                invoice_number TEXT UNIQUE,
                amount REAL,
                status TEXT DEFAULT 'pending',
                pdf_path TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (appointment_id) REFERENCES appointments (id)
            )
        ''')
    
    conn.commit()
    conn.close()
    
    print("✅ Migration terminée avec succès!")

if __name__ == '__main__':
    migrate_database()