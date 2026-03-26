from twilio.rest import Client
import logging

class SMSService:
    
    def __init__(self, account_sid, auth_token, twilio_number):
        self.client = Client(account_sid, auth_token)
        self.twilio_number = twilio_number
    
    def send_sms(self, to_number, message):
        """Send SMS using Twilio"""
        try:
            # Format French number
            to_number = self.format_number(to_number)
            
            sms = self.client.messages.create(
                body=message,
                from_=self.twilio_number,
                to=to_number
            )
            
            return {'success': True, 'sid': sms.sid}
            
        except Exception as e:
            logging.error(f"SMS error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def send_reminder_sms(self, patient, appointment):
        """Send appointment reminder SMS"""
        date_formatted = appointment.date_rdv.strftime('%d/%m/%Y à %H:%M')
        
        message = f"Cabinet Psy: Rappel de votre rendez-vous le {date_formatted}. Pour modifier: 01 23 45 67 89"
        
        return self.send_sms(patient.telephone, message)
    
    def format_number(self, number):
        """Format phone number to international format"""
        # Remove all non-digit characters
        number = ''.join(filter(str.isdigit, number))
        
        # French number starting with 0
        if len(number) == 10 and number.startswith('0'):
            number = '+33' + number[1:]
        # Already has country code
        elif len(number) == 11 and number.startswith('33'):
            number = '+' + number
        
        return number