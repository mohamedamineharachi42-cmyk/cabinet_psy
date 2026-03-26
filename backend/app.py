from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend', static_url_path='')

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///instance/database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Initialize extensions
CORS(app)
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Database Models
class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    civilite = db.Column(db.String(10))
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    telephone = db.Column(db.String(20))
    password_hash = db.Column(db.String(255))
    consentement_email = db.Column(db.Boolean, default=True)
    consentement_sms = db.Column(db.Boolean, default=False)
    date_inscription = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'civilite': self.civilite,
            'nom': self.nom,
            'prenom': self.prenom,
            'email': self.email,
            'telephone': self.telephone,
            'consentement_email': self.consentement_email,
            'consentement_sms': self.consentement_sms
        }

class Appointment(db.Model):
    __tablename__ = 'rendez_vous'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    date_rdv = db.Column(db.DateTime, nullable=False)
    duree = db.Column(db.Integer, default=60)
    type_consultation = db.Column(db.String(20), default='presentiel')
    statut = db.Column(db.String(20), default='confirme')
    notes = db.Column(db.Text)
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'date_rdv': self.date_rdv.strftime('%Y-%m-%d %H:%M'),
            'duree': self.duree,
            'type_consultation': self.type_consultation,
            'statut': self.statut,
            'notes': self.notes
        }

# Create tables
with app.app_context():
    db.create_all()

# ==================== FRONTEND ROUTES ====================

@app.route('/')
def serve_index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

# ==================== API ROUTES ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'Backend is running!',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new patient"""
    data = request.json
    
    # Check if email already exists
    existing = Patient.query.filter_by(email=data['email']).first()
    if existing:
        return jsonify({'error': 'Email déjà utilisé'}), 400
    
    # Create new patient
    patient = Patient(
        civilite=data.get('civilite'),
        nom=data['nom'],
        prenom=data['prenom'],
        email=data['email'],
        telephone=data.get('telephone'),
        consentement_email=data.get('consentement_email', True),
        consentement_sms=data.get('consentement_sms', False)
    )
    
    # Simple password hashing (in production, use bcrypt)
    patient.password_hash = data['password']  # For demo only! Use bcrypt in production
    
    db.session.add(patient)
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(identity=patient.id)
    
    return jsonify({
        'success': True,
        'token': access_token,
        'user': patient.to_dict()
    })

@app.route('/api/login', methods=['POST'])
def login():
    """Login patient"""
    data = request.json
    
    patient = Patient.query.filter_by(email=data['email']).first()
    
    if not patient or patient.password_hash != data['password']:  # For demo only! Use proper password verification
        return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
    
    access_token = create_access_token(identity=patient.id)
    
    return jsonify({
        'success': True,
        'token': access_token,
        'user': patient.to_dict()
    })

@app.route('/api/appointments', methods=['GET'])
@jwt_required()
def get_appointments():
    """Get all appointments for current patient"""
    patient_id = get_jwt_identity()
    
    appointments = Appointment.query.filter_by(patient_id=patient_id).order_by(Appointment.date_rdv.desc()).all()
    
    return jsonify({
        'success': True,
        'appointments': [apt.to_dict() for apt in appointments]
    })

@app.route('/api/appointments', methods=['POST'])
@jwt_required()
def create_appointment():
    """Create a new appointment"""
    patient_id = get_jwt_identity()
    data = request.json
    
    appointment = Appointment(
        patient_id=patient_id,
        date_rdv=datetime.fromisoformat(data['date_rdv']),
        duree=data.get('duree', 60),
        type_consultation=data['type_consultation'],
        notes=data.get('notes')
    )
    
    db.session.add(appointment)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'appointment': appointment.to_dict()
    })

@app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    """Update an appointment"""
    patient_id = get_jwt_identity()
    
    appointment = Appointment.query.filter_by(id=appointment_id, patient_id=patient_id).first()
    
    if not appointment:
        return jsonify({'error': 'Rendez-vous non trouvé'}), 404
    
    data = request.json
    
    if 'date_rdv' in data:
        appointment.date_rdv = datetime.fromisoformat(data['date_rdv'])
    
    if 'type_consultation' in data:
        appointment.type_consultation = data['type_consultation']
    
    if 'notes' in data:
        appointment.notes = data['notes']
    
    if 'statut' in data:
        appointment.statut = data['statut']
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'appointment': appointment.to_dict()
    })

@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def cancel_appointment(appointment_id):
    """Cancel an appointment"""
    patient_id = get_jwt_identity()
    
    appointment = Appointment.query.filter_by(id=appointment_id, patient_id=patient_id).first()
    
    if not appointment:
        return jsonify({'error': 'Rendez-vous non trouvé'}), 404
    
    appointment.statut = 'annule'
    db.session.commit()
    
    return jsonify({'success': True})

@app.route('/api/test', methods=['GET'])
def test():
    """Test endpoint"""
    return jsonify({
        'success': True,
        'message': 'API is working!',
        'endpoints': [
            '/api/health',
            '/api/test',
            '/api/register',
            '/api/login',
            '/api/appointments'
        ]
    })

# ==================== RUN APPLICATION ====================

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🏥 Cabinet de Psychothérapie - Backend")
    print("="*50)
    print(f"📱 Access the site at: http://localhost:5000")
    print(f"🔧 API test at: http://localhost:5000/api/test")
    print(f"💚 Health check: http://localhost:5000/api/health")
    print("="*50 + "\n")
    
    app.run(debug=True, port=5000)# From the psyco directory
