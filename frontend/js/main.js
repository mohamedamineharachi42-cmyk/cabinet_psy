// ==================== API CONFIGURATION ====================
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : 'https://your-domain.com/api';

// Stripe configuration (add your public key)
const STRIPE_PUBLIC_KEY = 'pk_test_your_stripe_public_key';

// ==================== AUTHENTICATION ====================

class AuthService {
    static async register(userData) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    }
    
    static async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Erreur de connexion au serveur' };
        }
    }
    
    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    }
    
    static getToken() {
        return localStorage.getItem('token');
    }
    
    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
    
    static isAuthenticated() {
        return !!this.getToken();
    }
}

// ==================== APPOINTMENT SERVICE ====================

class AppointmentService {
    static async getAppointments() {
        const token = AuthService.getToken();
        if (!token) return { success: false, error: 'Non authentifié' };
        
        try {
            const response = await fetch(`${API_URL}/appointments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get appointments error:', error);
            return { success: false, error: 'Erreur de connexion' };
        }
    }
    
    static async createAppointment(appointmentData) {
        const token = AuthService.getToken();
        if (!token) return { success: false, error: 'Non authentifié' };
        
        try {
            const response = await fetch(`${API_URL}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appointmentData)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Create appointment error:', error);
            return { success: false, error: 'Erreur de connexion' };
        }
    }
    
    static async updateAppointment(appointmentId, appointmentData) {
        const token = AuthService.getToken();
        if (!token) return { success: false, error: 'Non authentifié' };
        
        try {
            const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(appointmentData)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Update appointment error:', error);
            return { success: false, error: 'Erreur de connexion' };
        }
    }
    
    static async cancelAppointment(appointmentId) {
        const token = AuthService.getToken();
        if (!token) return { success: false, error: 'Non authentifié' };
        
        try {
            const response = await fetch(`${API_URL}/appointments/${appointmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Cancel appointment error:', error);
            return { success: false, error: 'Erreur de connexion' };
        }
    }
}

// ==================== PAYMENT SERVICE ====================

class PaymentService {
    static async createPaymentIntent(amount, appointmentId) {
        const token = AuthService.getToken();
        if (!token) return { success: false, error: 'Non authentifié' };
        
        try {
            const response = await fetch(`${API_URL}/create-payment-intent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: amount,
                    appointment_id: appointmentId
                })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Create payment intent error:', error);
            return { success: false, error: 'Erreur de connexion' };
        }
    }
    
    static async processPayment(amount, appointmentId) {
        // Create payment intent
        const paymentIntent = await this.createPaymentIntent(amount, appointmentId);
        
        if (!paymentIntent.success) {
            return { success: false, error: paymentIntent.error };
        }
        
        // Initialize Stripe
        const stripe = Stripe(STRIPE_PUBLIC_KEY);
        
        // Confirm payment
        const { error, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
            paymentIntent.client_secret,
            {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: AuthService.getUser()?.prenom + ' ' + AuthService.getUser()?.nom
                    }
                }
            }
        );
        
        if (error) {
            return { success: false, error: error.message };
        }
        
        return { success: true, paymentIntent: confirmedIntent };
    }
}

// ==================== JOURNAL SERVICE ====================

class JournalService {
    static async getEntries() {
        const token = AuthService.getToken();
        if (!token) return { success: false, error: 'Non authentifié' };
        
        try {
            const response = await fetch(`${API_URL}/journal`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get journal error:', error);
            return { success: false, error: 'Erreur de connexion' };
        }
    }
    
    static async createEntry(entryData) {
        const token = AuthService.getToken();
        if (!token) return { success: false, error: 'Non authentifié' };
        
        try {
            const response = await fetch(`${API_URL}/journal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(entryData)
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Create journal error:', error);
            return { success: false, error: 'Erreur de connexion' };
        }
    }
    
    static async deleteEntry(entryId) {
        const token = AuthService.getToken();
        if (!token) return { success: false, error: 'Non authentifié' };
        
        try {
            const response = await fetch(`${API_URL}/journal/${entryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Delete journal error:', error);
            return { success: false, error: 'Erreur de connexion' };
        }
    }
}

// ==================== MOOD TRACKER SERVICE ====================

class MoodService {
    static async getEntries() {
        const token = AuthService.getToken();
        if (!token) return { success: false, error: 'Non authentifié' };
        
        try {
            const response = await fetch(`${API_URL}/mood`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get mood entries error:', error);
            return { success: false, error: 'Erreur de connexion' };
        }
    }
    
    static async saveMood(mood, notes = '') {
        const token = AuthService.getToken();
        if (!token) return { success: false, error: 'Non authentifié' };
        
        try {
            const response = await fetch(`${API_URL}/mood`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ mood, notes })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Save mood error:', error);
            return { success: false, error: 'Erreur de connexion' };
        }
    }
}

// ==================== UI HELPERS ====================

class UIHelper {
    static showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#48bb78' : '#f56565'};
            color: white;
            border-radius: 10px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
    
    static showLoading(show, elementId = null) {
        if (elementId) {
            const element = document.getElementById(elementId);
            if (show) {
                element.disabled = true;
                element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
            } else {
                element.disabled = false;
                element.innerHTML = element.getAttribute('data-original-text') || 'Confirmer';
            }
        } else {
            if (show) {
                document.body.style.cursor = 'wait';
                const overlay = document.createElement('div');
                overlay.id = 'loading-overlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    z-index: 9998;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                `;
                overlay.innerHTML = '<div class="spinner"></div>';
                document.body.appendChild(overlay);
            } else {
                document.body.style.cursor = 'default';
                const overlay = document.getElementById('loading-overlay');
                if (overlay) overlay.remove();
            }
        }
    }
    
    static formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// ==================== APPOINTMENT FORM HANDLER ====================

class AppointmentFormHandler {
    static async handleSubmit(formData) {
        UIHelper.showLoading(true);
        
        // Prepare appointment data
        const appointmentData = {
            date_rdv: `${formData.date} ${formData.time}`,
            type_consultation: formData.type,
            duree: 60,
            notes: formData.message
        };
        
        // Create appointment
        const result = await AppointmentService.createAppointment(appointmentData);
        
        if (result.success) {
            UIHelper.showMessage('Rendez-vous créé avec succès!', 'success');
            
            // If payment is required, process it
            if (formData.requiresPayment) {
                const paymentResult = await PaymentService.processPayment(60, result.appointment.id);
                if (paymentResult.success) {
                    UIHelper.showMessage('Paiement effectué avec succès!', 'success');
                }
            }
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '/patient-dashboard.html';
            }, 2000);
        } else {
            UIHelper.showMessage(result.error || 'Erreur lors de la création du rendez-vous', 'error');
        }
        
        UIHelper.showLoading(false);
    }
}

// ==================== PATIENT DASHBOARD ====================

class PatientDashboard {
    static async loadDashboard() {
        if (!AuthService.isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }
        
        const user = AuthService.getUser();
        document.getElementById('patientName').textContent = `${user.prenom} ${user.nom}`;
        
        // Load appointments
        await this.loadAppointments();
        
        // Load journal entries
        await this.loadJournal();
        
        // Load mood entries
        await this.loadMood();
    }
    
    static async loadAppointments() {
        const result = await AppointmentService.getAppointments();
        
        if (result.success) {
            const appointments = result.appointments;
            const today = new Date();
            
            const upcoming = appointments.filter(apt => new Date(apt.date_rdv) >= today && apt.statut !== 'termine');
            const past = appointments.filter(apt => new Date(apt.date_rdv) < today || apt.statut === 'termine');
            
            // Display upcoming appointments
            const upcomingDiv = document.getElementById('upcomingAppointments');
            if (upcoming.length === 0) {
                upcomingDiv.innerHTML = '<p>Aucun rendez-vous à venir</p>';
            } else {
                upcomingDiv.innerHTML = `
                    <ul class="appointment-list">
                        ${upcoming.map(apt => `
                            <li class="appointment-item">
                                <div>
                                    <div class="appointment-date">
                                        ${UIHelper.formatDate(apt.date_rdv)}
                                    </div>
                                    <div>${apt.type_consultation === 'visio' ? 'Visio' : 'Présentiel'}</div>
                                    <small>${apt.notes || ''}</small>
                                </div>
                                <div>
                                    <span class="appointment-status status-${apt.statut}">
                                        ${apt.statut === 'confirme' ? 'Confirmé' : apt.statut}
                                    </span>
                                    <button class="btn-icon" onclick="PatientDashboard.rescheduleAppointment(${apt.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon" onclick="PatientDashboard.cancelAppointment(${apt.id})">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                `;
            }
            
            document.getElementById('upcomingCount').textContent = upcoming.length;
            document.getElementById('pastCount').textContent = past.length;
        }
    }
    
    static async loadJournal() {
        const result = await JournalService.getEntries();
        
        if (result.success) {
            const entries = result.entries;
            const journalDiv = document.getElementById('journalEntries');
            
            if (entries.length === 0) {
                journalDiv.innerHTML = '<p>Commencez votre journal thérapeutique</p>';
            } else {
                journalDiv.innerHTML = entries.map(entry => `
                    <div class="journal-entry">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <strong>${UIHelper.formatDate(entry.date)}</strong>
                            <span>${this.getMoodEmoji(entry.mood)}</span>
                        </div>
                        <p>${entry.text}</p>
                        <small style="color: var(--primary);">✨ Apprentissage: ${entry.learnings}</small>
                        <div style="margin-top: 10px;">
                            <button class="btn-icon" onclick="PatientDashboard.deleteJournalEntry(${entry.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
            
            document.getElementById('journalCount').textContent = entries.length;
        }
    }
    
    static async loadMood() {
        const result = await MoodService.getEntries();
        
        if (result.success) {
            const entries = result.entries;
            this.displayMoodChart(entries);
        }
    }
    
    static displayMoodChart(entries) {
        const ctx = document.getElementById('moodChart');
        if (!ctx) return;
        
        const labels = entries.map(e => UIHelper.formatDate(e.date));
        const data = entries.map(e => e.mood);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Niveau d\'humeur',
                    data: data,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        min: 1,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: (value) => {
                                const moods = ['', 'Difficile', 'Moyen', 'Neutre', 'Bien', 'Excellent'];
                                return moods[value];
                            }
                        }
                    }
                }
            }
        });
    }
    
    static async saveMood() {
        const selectedMood = document.querySelector('.mood-btn.selected');
        if (!selectedMood) {
            UIHelper.showMessage('Veuillez sélectionner votre humeur', 'error');
            return;
        }
        
        const moodValue = parseInt(selectedMood.dataset.mood);
        const result = await MoodService.saveMood(moodValue);
        
        if (result.success) {
            UIHelper.showMessage('Humeur enregistrée !', 'success');
            await this.loadMood();
        } else {
            UIHelper.showMessage(result.error, 'error');
        }
    }
    
    static async createJournalEntry(event) {
        event.preventDefault();
        
        const entryData = {
            date: document.getElementById('journalDate').value,
            mood: parseInt(document.getElementById('journalMood').value),
            text: document.getElementById('journalText').value,
            learnings: document.getElementById('journalLearnings').value
        };
        
        const result = await JournalService.createEntry(entryData);
        
        if (result.success) {
            UIHelper.showMessage('Journal enregistré !', 'success');
            document.getElementById('journalModal').style.display = 'none';
            await this.loadJournal();
        } else {
            UIHelper.showMessage(result.error, 'error');
        }
    }
    
    static async deleteJournalEntry(entryId) {
        if (confirm('Voulez-vous vraiment supprimer cette entrée ?')) {
            const result = await JournalService.deleteEntry(entryId);
            if (result.success) {
                UIHelper.showMessage('Entrée supprimée', 'success');
                await this.loadJournal();
            }
        }
    }
    
    static async cancelAppointment(appointmentId) {
        if (confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) {
            const result = await AppointmentService.cancelAppointment(appointmentId);
            if (result.success) {
                UIHelper.showMessage('Rendez-vous annulé', 'success');
                await this.loadAppointments();
            }
        }
    }
    
    static getMoodEmoji(mood) {
        const emojis = {
            5: '😊 Excellent',
            4: '🙂 Bien',
            3: '😐 Neutre',
            2: '😕 Moyen',
            1: '😢 Difficile'
        };
        return emojis[mood] || '';
    }
}

// ==================== CONTACT FORM HANDLER ====================

class ContactFormHandler {
    static async handleSubmit(formData) {
        UIHelper.showLoading(true);
        
        // In production, you would send this to your backend
        // For now, we'll simulate sending
        try {
            // You would implement a contact endpoint in your Flask app
            // const response = await fetch(`${API_URL}/contact`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // });
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            UIHelper.showMessage('Message envoyé avec succès ! Je vous répondrai dans les 24h.', 'success');
            document.getElementById('contactForm').reset();
        } catch (error) {
            UIHelper.showMessage('Erreur lors de l\'envoi du message', 'error');
        }
        
        UIHelper.showLoading(false);
    }
}

// ==================== INITIALIZATION ====================

// Initialize navigation and form handlers when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Initialize contact form if present
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                civilite: document.getElementById('civilite')?.value,
                prenom: document.getElementById('prenom')?.value,
                nom: document.getElementById('nom')?.value,
                email: document.getElementById('email')?.value,
                telephone: document.getElementById('telephone')?.value,
                sujet: document.getElementById('sujet')?.value,
                message: document.getElementById('message')?.value
            };
            
            await ContactFormHandler.handleSubmit(formData);
        });
    }
    
    // Initialize appointment form if present
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                date: document.getElementById('date_rdv')?.value,
                time: document.getElementById('heure_debut')?.value,
                type: document.querySelector('input[name="type"]:checked')?.value,
                message: document.getElementById('message')?.value,
                requiresPayment: true
            };
            
            await AppointmentFormHandler.handleSubmit(formData);
        });
    }
    
    // Initialize patient dashboard if on dashboard page
    if (window.location.pathname.includes('patient-dashboard.html')) {
        PatientDashboard.loadDashboard();
    }
    
    // Initialize mood tracker if present
    const moodButtons = document.querySelectorAll('.mood-btn');
    if (moodButtons.length) {
        moodButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                moodButtons.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
        
        const saveMoodBtn = document.getElementById('saveMoodBtn');
        if (saveMoodBtn) {
            saveMoodBtn.addEventListener('click', () => PatientDashboard.saveMood());
        }
    }
    
    // Initialize journal modal
    const journalModal = document.getElementById('journalModal');
    const openJournalBtn = document.getElementById('openJournalBtn');
    const closeJournalBtn = document.querySelector('.close-modal');
    
    if (openJournalBtn) {
        openJournalBtn.addEventListener('click', () => {
            journalModal.style.display = 'flex';
        });
    }
    
    if (closeJournalBtn) {
        closeJournalBtn.addEventListener('click', () => {
            journalModal.style.display = 'none';
        });
    }
    
    const journalForm = document.getElementById('journalForm');
    if (journalForm) {
        journalForm.addEventListener('submit', (e) => PatientDashboard.createJournalEntry(e));
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === journalModal) {
            journalModal.style.display = 'none';
        }
    });
    
    // Initialize FAQ accordion
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length) {
        faqItems.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });
    }
});

// Export for use in other files
window.AuthService = AuthService;
window.AppointmentService = AppointmentService;
window.PatientDashboard = PatientDashboard;
window.UIHelper = UIHelper;
@"
// Main JavaScript for Cabinet de Psychothérapie
console.log('✅ Site loaded successfully');

// ==================== NAVIGATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Active page highlighting
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = this.getAttribute('href');
            if (target !== '#') {
                e.preventDefault();
                const element = document.querySelector(target);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    console.log('✅ Navigation initialized');
});

// ==================== FORM HANDLERS ====================

// Contact Form Handler
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name')?.value,
        email: document.getElementById('email')?.value,
        message: document.getElementById('message')?.value
    };
    
    console.log('Contact form submitted:', formData);
    
    // Show success message
    const successMsg = document.getElementById('successMessage');
    if (successMsg) {
        successMsg.style.display = 'block';
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 5000);
    }
    
    event.target.reset();
    return false;
}

// Appointment Form Handler
function handleAppointmentForm(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name')?.value,
        email: document.getElementById('email')?.value,
        phone: document.getElementById('phone')?.value,
        date: document.getElementById('date')?.value,
        time: document.getElementById('time')?.value,
        type: document.querySelector('input[name="type"]:checked')?.value
    };
    
    console.log('Appointment submitted:', formData);
    
    // Show confirmation
    alert('Rendez-vous demandé avec succès ! Vous recevrez un email de confirmation.');
    
    return false;
}

// ==================== UTILITY FUNCTIONS ====================

// Format date to French format
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

// Format time
function formatTime(timeString) {
    return timeString.substring(0, 5);
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        border-radius: 10px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ==================== API FUNCTIONS (if backend is running) ====================

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { error: 'Network error' };
    }
}

// ==================== PAGE SPECIFIC INITIALIZATION ====================

// Home page
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    console.log('Home page loaded');
    
    // Animate stats counters
    const stats = document.querySelectorAll('.stat h3');
    stats.forEach(stat => {
        const target = parseInt(stat.innerText);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                clearInterval(timer);
                stat.innerText = target;
            } else {
                stat.innerText = Math.floor(current);
            }
        }, 20);
    });
}

// Contact page
if (window.location.pathname.includes('contact.html')) {
    console.log('Contact page loaded');
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

// Appointments page
if (window.location.pathname.includes('appointments.html')) {
    console.log('Appointments page loaded');
    
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentForm);
    }
}

// Export functions for global use
window.showNotification = showNotification;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.apiCall = apiCall;
"@ | Out-File -FilePath "C:\Users\amine\Desktop\psyco\frontend\js\main.js" -Encoding UTF8