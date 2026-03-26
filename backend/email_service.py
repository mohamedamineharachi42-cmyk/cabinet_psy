from flask_mail import Mail, Message
from flask import render_template_string
import logging

mail = Mail()

class EmailService:
    
    @staticmethod
    def send_confirmation_email(patient, appointment):
        """Send appointment confirmation email"""
        subject = "Confirmation de votre rendez-vous"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Cabinet de Psychothérapie</h2>
            <h3>Bonjour {patient.prenom} {patient.nom},</h3>
            
            <p>Votre rendez-vous a été confirmé :</p>
            
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Date :</strong> {appointment.date_rdv.strftime('%d/%m/%Y à %H:%M')}</p>
                <p><strong>Type :</strong> {"Visio" if appointment.type_consultation == 'visio' else "Présentiel"}</p>
                <p><strong>Durée :</strong> {appointment.duree} minutes</p>
            </div>
            
            <p>Pour toute modification, contactez-nous au 01 23 45 67 89.</p>
            
            <hr style="margin: 30px 0;">
            <p style="color: #718096; font-size: 12px;">
                Cabinet de Psychothérapie - 123 rue de la Paix, 75001 Paris<br>
                Cet email a été envoyé automatiquement.
            </p>
        </div>
        """
        
        msg = Message(
            subject=subject,
            recipients=[patient.email],
            html=html_content
        )
        
        try:
            mail.send(msg)
            return True
        except Exception as e:
            logging.error(f"Email error: {str(e)}")
            return False
    
    @staticmethod
    def send_reminder_email(patient, appointment):
        """Send appointment reminder email"""
        subject = "Rappel de votre rendez-vous"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Rappel de rendez-vous</h2>
            
            <p>Bonjour {patient.prenom},</p>
            
            <p>Nous vous rappelons que vous avez un rendez-vous demain :</p>
            
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Date :</strong> {appointment.date_rdv.strftime('%d/%m/%Y à %H:%M')}</p>
                <p><strong>Type :</strong> {"Visio" if appointment.type_consultation == 'visio' else "Présentiel"}</p>
            </div>
            
            <p>Pour annuler ou modifier, contactez-nous au 01 23 45 67 89.</p>
        </div>
        """
        
        msg = Message(subject=subject, recipients=[patient.email], html=html_content)
        
        try:
            mail.send(msg)
            return True
        except Exception as e:
            logging.error(f"Email error: {str(e)}")
            return False
    
    @staticmethod
    def send_modification_email(patient, old_date, new_date):
        """Send appointment modification notification"""
        subject = "Modification de votre rendez-vous"
        
        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Modification de rendez-vous</h2>
            
            <p>Bonjour {patient.prenom},</p>
            
            <p>Votre rendez-vous a été modifié :</p>
            
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Ancienne date :</strong> {old_date.strftime('%d/%m/%Y à %H:%M')}</p>
                <p><strong>Nouvelle date :</strong> {new_date.strftime('%d/%m/%Y à %H:%M')}</p>
            </div>
            
            <p>Si cette modification ne vous convient pas, contactez-nous au 01 23 45 67 89.</p>
        </div>
        """
        
        msg = Message(subject=subject, recipients=[patient.email], html=html_content)
        
        try:
            mail.send(msg)
            return True
        except Exception as e:
            logging.error(f"Email error: {str(e)}")
            return False