from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    civilite = db.Column(db.String(10))
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    telephone = db.Column(db.String(20))
    date_naissance = db.Column(db.Date)
    adresse = db.Column(db.Text)
    password_hash = db.Column(db.String(255))
    consentement_email = db.Column(db.Boolean, default=True)
    consentement_sms = db.Column(db.Boolean, default=False)
    date_inscription = db.Column(db.DateTime, default=datetime.utcnow)
    
    appointments = db.relationship('Appointment', backref='patient', lazy=True)
    journal_entries = db.relationship('JournalEntry', backref='patient', lazy=True)
    mood_entries = db.relationship('MoodEntry', backref='patient', lazy=True)
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'civilite': self.civilite,
            'nom': self.nom,
            'prenom': self.prenom,
            'email': self.email,
            'telephone': self.telephone,
            'date_naissance': self.date_naissance.strftime('%Y-%m-%d') if self.date_naissance else None,
            'consentement_email': self.consentement_email,
            'consentement_sms': self.consentement_sms
        }

class Appointment(db.Model):
    __tablename__ = 'rendez_vous'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    date_rdv = db.Column(db.DateTime, nullable=False)
    duree = db.Column(db.Integer, default=60)
    type_consultation = db.Column(db.Enum('presentiel', 'visio'), default='presentiel')
    statut = db.Column(db.Enum('confirme', 'annule', 'reporte', 'termine'), default='confirme')
    notes = db.Column(db.Text)
    paiement_statut = db.Column(db.Enum('en_attente', 'paye', 'rembourse'), default='en_attente')
    paiement_intent_id = db.Column(db.String(255))
    date_creation = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'date_rdv': self.date_rdv.strftime('%Y-%m-%d %H:%M'),
            'duree': self.duree,
            'type_consultation': self.type_consultation,
            'statut': self.statut,
            'notes': self.notes,
            'paiement_statut': self.paiement_statut
        }

class JournalEntry(db.Model):
    __tablename__ = 'journal_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow)
    mood = db.Column(db.Integer)  # 1-5
    text = db.Column(db.Text)
    learnings = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%d'),
            'mood': self.mood,
            'text': self.text,
            'learnings': self.learnings
        }

class MoodEntry(db.Model):
    __tablename__ = 'mood_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow)
    mood = db.Column(db.Integer)  # 1-5
    notes = db.Column(db.String(255))
    
    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%d'),
            'mood': self.mood,
            'notes': self.notes
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    type_notification = db.Column(db.Enum('rappel', 'confirmation', 'annulation', 'modification', 'rappel_sms'))
    date_envoi = db.Column(db.DateTime, default=datetime.utcnow)
    statut = db.Column(db.Enum('envoye', 'echec'), default='envoye')
    contenu = db.Column(db.Text)