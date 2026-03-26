import stripe
import logging

class PaymentService:
    
    def __init__(self, secret_key, public_key):
        stripe.api_key = secret_key
        self.public_key = public_key
    
    def create_payment_intent(self, amount, currency='eur', metadata=None):
        """Create a Stripe payment intent"""
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={'enabled': True}
            )
            
            return {
                'success': True,
                'client_secret': intent.client_secret,
                'intent_id': intent.id
            }
            
        except Exception as e:
            logging.error(f"Stripe error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def confirm_payment(self, payment_intent_id):
        """Confirm a payment intent"""
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                'success': True,
                'status': intent.status,
                'amount': intent.amount / 100
            }
            
        except Exception as e:
            logging.error(f"Stripe error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def refund_payment(self, payment_intent_id, amount=None):
        """Refund a payment"""
        try:
            if amount:
                refund = stripe.Refund.create(
                    payment_intent=payment_intent_id,
                    amount=int(amount * 100)
                )
            else:
                refund = stripe.Refund.create(
                    payment_intent=payment_intent_id
                )
            
            return {'success': True, 'refund_id': refund.id}
            
        except Exception as e:
            logging.error(f"Stripe error: {str(e)}")
            return {'success': False, 'error': str(e)}