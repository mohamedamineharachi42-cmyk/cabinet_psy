from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sqlite3
from datetime import datetime, timedelta

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')

# Créer les dossiers
os.makedirs(INSTANCE_DIR, exist_ok=True)
os.makedirs(FRONTEND_DIR, exist_ok=True)

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

# Chemin de la base de données
DB_PATH = os.path.join(INSTANCE_DIR, 'appointments.db')

def get_db():
    """Connexion à la base de données"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Créer la base de données (supprime l'ancienne si elle existe)"""
    
    # Supprimer l'ancienne base si elle existe
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print("🗑️ Ancienne base supprimée")
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Table des rendez-vous
    cursor.execute('''
        CREATE TABLE appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            type TEXT DEFAULT 'presentiel',
            message TEXT,
            status TEXT DEFAULT 'confirmed',
            payment_status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Table admin
    cursor.execute('''
        CREATE TABLE admin_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert admin
    cursor.execute("INSERT INTO admin_users (username, password) VALUES (?, ?)", 
                  ('admin', 'admin123'))
    
    # Insert données test
    today = datetime.now().strftime('%Y-%m-%d')
    cursor.execute('''
        INSERT INTO appointments (name, email, date, time, type)
        VALUES (?, ?, ?, ?, ?)
    ''', ('Jean Dupont', 'jean@test.com', today, '10:00', 'presentiel'))
    
    conn.commit()
    conn.close()
    print("✅ Base de données créée avec succès!")

# Initialiser la base
init_db()

# ==================== API ENDPOINTS ====================

@app.route('/api/available-slots', methods=['GET'])
def get_available_slots():
    """Récupérer les créneaux disponibles"""
    date = request.args.get('date')
    if not date:
        return jsonify({'error': 'Date requise'}), 400
    
    # Tous les créneaux possibles
    all_slots = []
    for hour in range(9, 19):
        for minute in [0, 30]:
            if hour == 18 and minute == 30:
                continue
            all_slots.append(f"{hour:02d}:{minute:02d}")
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT time FROM appointments WHERE date = ?", (date,))
        taken = [row['time'] for row in cursor.fetchall()]
        conn.close()
        
        available = [s for s in all_slots if s not in taken]
        
        return jsonify({
            'success': True,
            'date': date,
            'slots': available
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    """Créer un rendez-vous"""
    try:
        data = request.json
        print(f"📝 Nouveau rendez-vous: {data}")
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Vérifier disponibilité
        cursor.execute("SELECT COUNT(*) as count FROM appointments WHERE date = ? AND time = ?", 
                      (data['date'], data['time']))
        if cursor.fetchone()['count'] > 0:
            conn.close()
            return jsonify({'error': 'Créneau déjà pris'}), 409
        
        # Créer le rendez-vous
        cursor.execute('''
            INSERT INTO appointments (name, email, phone, date, time, type, message)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            f"{data['prenom']} {data['nom']}",
            data['email'],
            data.get('telephone', ''),
            data['date'],
            data['time'],
            data['type_consultation'],
            data.get('notes', '')
        ))
        
        appointment_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"✅ Rendez-vous créé ID: {appointment_id}")
        
        return jsonify({
            'success': True,
            'message': 'Rendez-vous confirmé!',
            'appointment_id': appointment_id
        })
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    """Statistiques admin"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as count FROM appointments")
        total = cursor.fetchone()['count']
        
        today = datetime.now().strftime('%Y-%m-%d')
        cursor.execute("SELECT COUNT(*) as count FROM appointments WHERE date = ?", (today,))
        today_count = cursor.fetchone()['count']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_appointments': total,
                'today_appointments': today_count,
                'month_appointments': total,
                'total_revenue': total * 60
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/appointments', methods=['GET'])
def admin_appointments():
    """Liste des rendez-vous"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM appointments ORDER BY date DESC, time DESC')
        appointments = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify({'success': True, 'appointments': appointments})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Login admin"""
    data = request.json
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_users WHERE username = ? AND password = ?", 
                  (data['username'], data['password']))
    admin = cursor.fetchone()
    conn.close()
    
    if admin:
        return jsonify({
            'success': True,
            'token': 'admin_token',
            'admin': {'username': admin['username']}
        })
    return jsonify({'error': 'Identifiants incorrects'}), 401

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'success': True,
        'message': 'API fonctionnelle!',
        'database': DB_PATH
    })

# Frontend routes
@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(FRONTEND_DIR, path)

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🏥 Cabinet de Psychothérapie")
    print("="*60)
    print(f"\n📂 Base: {DB_PATH}")
    print("\n📋 Endpoints:")
    print("   GET  /api/available-slots?date=YYYY-MM-DD")
    print("   POST /api/appointments")
    print("   GET  /api/admin/stats")
    print("   GET  /api/admin/appointments")
    print("   POST /api/admin/login")
    print("\n📱 Site: http://localhost:5000")
    print("👨‍💼 Admin: http://localhost:5000/admin-login.html")
    print("   Identifiants: admin / admin123")
    print("="*60 + "\n")
    
    app.run(debug=True, port=5000, host='localhost')