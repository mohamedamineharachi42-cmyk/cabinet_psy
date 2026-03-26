from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sqlite3
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')

os.makedirs(INSTANCE_DIR, exist_ok=True)
os.makedirs(FRONTEND_DIR, exist_ok=True)

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

def get_db():
    db_path = os.path.join(INSTANCE_DIR, 'appointments.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Table des rendez-vous
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            type TEXT DEFAULT 'presentiel',
            message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Base de données initialisée")

init_db()

# Endpoint pour les créneaux disponibles
@app.route('/api/available-slots', methods=['GET'])
def get_available_slots():
    date = request.args.get('date')
    if not date:
        return jsonify({'error': 'Date requise'}), 400
    
    print(f"📅 Recherche créneaux pour: {date}")
    
    # Tous les créneaux possibles (9h-19h)
    all_slots = []
    for hour in range(9, 19):
        for minute in [0, 30]:
            if hour == 18 and minute == 30:
                continue
            slot_time = f"{hour:02d}:{minute:02d}"
            all_slots.append(slot_time)
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Récupérer les créneaux déjà pris
        cursor.execute('''
            SELECT time FROM appointments WHERE date = ?
        ''', (date,))
        
        taken_slots = [row['time'] for row in cursor.fetchall()]
        conn.close()
        
        # Filtrer les créneaux disponibles
        available = [slot for slot in all_slots if slot not in taken_slots]
        
        print(f"   Disponibles: {len(available)} / {len(all_slots)}")
        
        return jsonify({
            'success': True,
            'date': date,
            'slots': available
        })
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return jsonify({'error': str(e)}), 500

# Endpoint pour créer un rendez-vous
@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    try:
        data = request.json
        print(f"📝 Nouveau rendez-vous: {data}")
        
        conn = get_db()
        cursor = conn.cursor()
        
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
        
        conn.commit()
        appointment_id = cursor.lastrowid
        conn.close()
        
        print(f"✅ Rendez-vous créé ID: {appointment_id}")
        
        return jsonify({
            'success': True,
            'message': 'Rendez-vous confirmé!',
            'id': appointment_id
        })
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return jsonify({'error': str(e)}), 500

# Endpoint pour lister les rendez-vous (admin)
@app.route('/api/admin/appointments', methods=['GET'])
def get_appointments():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM appointments ORDER BY date DESC, time DESC')
    appointments = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({'success': True, 'appointments': appointments})

# Test endpoint
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'success': True,
        'message': 'API fonctionne!',
        'endpoints': [
            '/api/available-slots?date=2024-03-28',
            '/api/appointments',
            '/api/admin/appointments',
            '/api/health'
        ]
    })

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
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
    print("🏥 Cabinet de Psychothérapie - API Rendez-vous")
    print("="*60)
    print("\n📋 Testez l'API:")
    print("   http://localhost:5000/api/test")
    print("   http://localhost:5000/api/available-slots?date=2024-03-28")
    print("\n📱 Site: http://localhost:5000")
    print("📅 Rendez-vous: http://localhost:5000/appointments.html")
    print("="*60 + "\n")
    
    app.run(debug=True, port=5000, host='localhost')