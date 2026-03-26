<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prendre rendez-vous - Cabinet de Psychothérapie</title>
    <link rel="stylesheet" href="/css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <style>
        .appointment-container {
            max-width: 1000px;
            margin: 100px auto 60px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .appointment-header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .steps {
            display: flex;
            padding: 20px 40px;
            background: #f7fafc;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .step {
            flex: 1;
            text-align: center;
            position: relative;
        }
        
        .step-number {
            width: 40px;
            height: 40px;
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
            font-weight: bold;
            color: #718096;
        }
        
        .step.active .step-number {
            background: #667eea;
            border-color: #667eea;
            color: white;
        }
        
        .step.completed .step-number {
            background: #48bb78;
            border-color: #48bb78;
            color: white;
        }
        
        .step-label {
            font-size: 0.9rem;
            color: #718096;
        }
        
        .step.active .step-label {
            color: #667eea;
            font-weight: 600;
        }
        
        .step:not(:last-child):after {
            content: '';
            position: absolute;
            top: 20px;
            right: -50%;
            width: 100%;
            height: 2px;
            background: #e2e8f0;
        }
        
        .step.completed:not(:last-child):after {
            background: #48bb78;
        }
        
        .appointment-form {
            padding: 40px;
        }
        
        .step-content {
            display: none;
        }
        
        .step-content.active {
            display: block;
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .calendar-wrapper {
            margin-bottom: 30px;
        }
        
        .flatpickr-calendar {
            width: 100% !important;
            background: white;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            border-radius: 15px;
        }
        
        .time-slots {
            margin-top: 30px;
        }
        
        .time-slots h3 {
            margin-bottom: 20px;
            color: #2d3748;
        }
        
        .slots-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: 15px;
        }
        
        .time-slot {
            padding: 12px;
            text-align: center;
            background: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .time-slot:hover:not(.disabled) {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
        }
        
        .time-slot.selected {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        .time-slot.disabled {
            background: #fed7d7;
            border-color: #feb2b2;
            color: #9b2c2c;
            cursor: not-allowed;
            text-decoration: line-through;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #2d3748;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-family: inherit;
        }
        
        .radio-group {
            display: flex;
            gap: 20px;
        }
        
        .radio-group label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }
        
        .btn-next, .btn-prev, .btn-submit {
            padding: 12px 30px;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .btn-next {
            background: #667eea;
            color: white;
        }
        
        .btn-prev {
            background: #e2e8f0;
            color: #4a5568;
        }
        
        .btn-submit {
            width: 100%;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            font-size: 1.1rem;
            padding: 15px;
        }
        
        .btn-next:hover, .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102,126,234,0.4);
        }
        
        .form-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
        }
        
        .success-message {
            background: #c6f6d5;
            color: #22543d;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: none;
        }
        
        .error-message {
            background: #fed7d7;
            color: #9b2c2c;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: none;
        }
        
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid white;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-left: 10px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .selected-info {
            background: #f7fafc;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
            }
            .steps {
                padding: 20px;
            }
            .step-label {
                font-size: 0.75rem;
            }
            .appointment-form {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="nav-brand">
                <a href="index.html">Dr. Martin</a>
                <span class="badge">Psychothérapeute</span>
            </div>
            <ul class="nav-menu">
                <li><a href="index.html">Accueil</a></li>
                <li><a href="about.html">À propos</a></li>
                <li><a href="appointments.html" class="active">Rendez-vous</a></li>
                <li><a href="blog.html">Blog</a></li>
                <li><a href="contact.html">Contact</a></li>
            </ul>
        </div>
    </nav>
    
    <div class="appointment-container">
        <div class="appointment-header">
            <h1>Prendre rendez-vous</h1>
            <p>Choisissez votre créneau en quelques clics</p>
        </div>
        
        <div class="steps">
            <div class="step active" data-step="1">
                <div class="step-number">1</div>
                <div class="step-label">Date & heure</div>
            </div>
            <div class="step" data-step="2">
                <div class="step-number">2</div>
                <div class="step-label">Vos informations</div>
            </div>
            <div class="step" data-step="3">
                <div class="step-number">3</div>
                <div class="step-label">Confirmation</div>
            </div>
        </div>
        
        <div class="appointment-form">
            <div id="successMessage" class="success-message">
                <i class="fas fa-check-circle"></i> Rendez-vous confirmé ! Un email vous a été envoyé.
            </div>
            <div id="errorMessage" class="error-message">
                <i class="fas fa-exclamation-circle"></i> Une erreur est survenue.
            </div>
            
            <!-- Étape 1: Calendrier et créneaux -->
            <div id="step1" class="step-content active">
                <div class="calendar-wrapper">
                    <label>Choisissez une date</label>
                    <input type="text" id="calendar" placeholder="Sélectionnez une date">
                </div>
                
                <div id="timeSlots" class="time-slots" style="display: none;">
                    <h3>Créneaux disponibles</h3>
                    <div id="slotsGrid" class="slots-grid"></div>
                </div>
                
                <div class="form-actions">
                    <button class="btn-next" id="nextStep1" disabled>Continuer →</button>
                </div>
            </div>
            
            <!-- Étape 2: Informations patient -->
            <div id="step2" class="step-content">
                <div class="selected-info" id="selectedInfo"></div>
                
                <form id="patientForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Civilité</label>
                            <select id="civilite" required>
                                <option value="Mme">Madame</option>
                                <option value="M.">Monsieur</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Type de consultation</label>
                            <div class="radio-group">
                                <label>
                                    <input type="radio" name="type" value="presentiel" checked>
                                    Présentiel
                                </label>
                                <label>
                                    <input type="radio" name="type" value="visio">
                                    Visioconférence
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Prénom *</label>
                            <input type="text" id="prenom" required>
                        </div>
                        <div class="form-group">
                            <label>Nom *</label>
                            <input type="text" id="nom" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Email *</label>
                            <input type="email" id="email" required>
                        </div>
                        <div class="form-group">
                            <label>Téléphone</label>
                            <input type="tel" id="telephone">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Message (optionnel)</label>
                        <textarea id="message" rows="3" placeholder="Décrivez brièvement votre demande..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="consentement" required>
                            J'accepte de recevoir des emails de confirmation et de rappel
                        </label>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-prev" id="prevStep2">← Retour</button>
                        <button type="button" class="btn-next" id="nextStep2">Continuer →</button>
                    </div>
                </form>
            </div>
            
            <!-- Étape 3: Confirmation -->
            <div id="step3" class="step-content">
                <div id="confirmationDetails"></div>
                <div class="form-actions">
                    <button type="button" class="btn-prev" id="prevStep3">← Retour</button>
                    <button type="button" class="btn-submit" id="confirmBtn">Confirmer le rendez-vous (60€)</button>
                </div>
            </div>
        </div>
    </div>
    
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Dr. Martin</h3>
                    <p>Psychothérapeute depuis 15 ans</p>
                </div>
                <div class="footer-section">
                    <h3>Contact</h3>
                    <p><i class="fas fa-phone"></i> 01 23 45 67 89</p>
                    <p><i class="fas fa-envelope"></i> contact@cabinet-psy.fr</p>
                </div>
            </div>
        </div>
    </footer>
    
    <!-- Scripts - L'ordre est important ! -->
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/fr.js"></script>
    
    <script>
        // Attendre que le DOM soit complètement chargé
        document.addEventListener('DOMContentLoaded', function() {
            const API_URL = 'http://localhost:5000/api';
            
            // Variables globales
            let selectedDate = null;
            let selectedTime = null;
            let availableSlots = [];
            
            // Vérifier que flatpickr est chargé
            if (typeof flatpickr === 'undefined') {
                console.error('flatpickr n\'est pas chargé !');
                alert('Erreur de chargement du calendrier');
                return;
            }
            
            // Initialisation du calendrier
            const calendarInput = document.getElementById("calendar");
            if (calendarInput) {
                const calendar = flatpickr(calendarInput, {
                    locale: "fr",
                    minDate: "today",
                    maxDate: new Date().fp_incr(60),
                    dateFormat: "Y-m-d",
                    disable: [
                        function(date) {
                            // Désactiver les dimanches
                            return date.getDay() === 0;
                        }
                    ],
                    onChange: function(selectedDates, dateStr) {
                        console.log('Date sélectionnée:', dateStr);
                        selectedDate = dateStr;
                        loadAvailableSlots(dateStr);
                    }
                });
            } else {
                console.error('Élément calendar non trouvé');
            }
            
            // Charger les créneaux disponibles
            async function loadAvailableSlots(date) {
                const timeSlotsDiv = document.getElementById('timeSlots');
                const slotsGrid = document.getElementById('slotsGrid');
                
                if (!slotsGrid) return;
                
                // Afficher le chargement
                slotsGrid.innerHTML = '<div style="text-align:center; padding:20px;">Chargement des créneaux...</div>';
                timeSlotsDiv.style.display = 'block';
                
                try {
                    console.log('Chargement des créneaux pour:', date);
                    const response = await fetch(`${API_URL}/available-slots?date=${date}`);
                    const data = await response.json();
                    
                    if (data.success) {
                        availableSlots = data.slots;
                        displayTimeSlots(availableSlots);
                    } else {
                        slotsGrid.innerHTML = '<div style="text-align:center; padding:20px; color:red;">Erreur de chargement</div>';
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    slotsGrid.innerHTML = '<div style="text-align:center; padding:20px; color:red;">Erreur de connexion au serveur</div>';
                }
            }
            
            // Afficher les créneaux
            function displayTimeSlots(slots) {
                const slotsGrid = document.getElementById('slotsGrid');
                
                if (!slots) {
                    slotsGrid.innerHTML = '<div style="text-align:center; padding:20px;">Erreur: aucun créneau disponible</div>';
                    document.getElementById('nextStep1').disabled = true;
                    return;
                }
                
                if (slots.length === 0) {
                    slotsGrid.innerHTML = '<div style="text-align:center; padding:20px;">Aucun créneau disponible pour cette date</div>';
                    document.getElementById('nextStep1').disabled = true;
                    return;
                }
                
                slotsGrid.innerHTML = slots.map(slot => `
                    <div class="time-slot" data-time="${slot}">
                        ${slot}
                    </div>
                `).join('');
                
                // Ajouter les événements de clic
                document.querySelectorAll('.time-slot').forEach(slot => {
                    slot.addEventListener('click', () => {
                        // Retirer la sélection précédente
                        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                        // Sélectionner le créneau
                        slot.classList.add('selected');
                        selectedTime = slot.dataset.time;
                        document.getElementById('nextStep1').disabled = false;
                        console.log('Créneau sélectionné:', selectedTime);
                    });
                });
            }
            
            // Navigation entre les étapes
            let currentStep = 1;
            
            function showStep(step) {
                document.querySelectorAll('.step-content').forEach(content => {
                    content.classList.remove('active');
                });
                const stepToShow = document.getElementById(`step${step}`);
                if (stepToShow) {
                    stepToShow.classList.add('active');
                }
                
                document.querySelectorAll('.step').forEach((stepEl, index) => {
                    const stepNum = index + 1;
                    stepEl.classList.remove('active', 'completed');
                    if (stepNum === step) {
                        stepEl.classList.add('active');
                    } else if (stepNum < step) {
                        stepEl.classList.add('completed');
                    }
                });
                
                currentStep = step;
            }
            
            // Étape 1 -> Étape 2
            const nextStep1Btn = document.getElementById('nextStep1');
            if (nextStep1Btn) {
                nextStep1Btn.addEventListener('click', () => {
                    if (selectedDate && selectedTime) {
                        // Afficher les infos sélectionnées
                        const selectedInfo = document.getElementById('selectedInfo');
                        const dateFormatted = new Date(selectedDate).toLocaleDateString('fr-FR');
                        selectedInfo.innerHTML = `
                            <strong>Rendez-vous sélectionné :</strong><br>
                            📅 ${dateFormatted} à ${selectedTime}<br>
                            💰 Tarif: 60€
                        `;
                        showStep(2);
                    } else {
                        alert('Veuillez sélectionner une date et un créneau');
                    }
                });
            }
            
            // Étape 2 -> Étape 3
            const nextStep2Btn = document.getElementById('nextStep2');
            if (nextStep2Btn) {
                nextStep2Btn.addEventListener('click', () => {
                    // Vérifier les champs obligatoires
                    const prenom = document.getElementById('prenom').value;
                    const nom = document.getElementById('nom').value;
                    const email = document.getElementById('email').value;
                    const consentement = document.getElementById('consentement').checked;
                    
                    if (!prenom || !nom || !email) {
                        alert('Veuillez remplir tous les champs obligatoires');
                        return;
                    }
                    
                    if (!consentement) {
                        alert('Vous devez accepter de recevoir les emails de confirmation');
                        return;
                    }
                    
                    // Afficher la confirmation
                    const dateFormatted = new Date(selectedDate).toLocaleDateString('fr-FR');
                    const typeConsultation = document.querySelector('input[name="type"]:checked').value;
                    const typeText = typeConsultation === 'visio' ? 'Visioconférence' : 'Présentiel';
                    
                    const confirmationDetails = document.getElementById('confirmationDetails');
                    confirmationDetails.innerHTML = `
                        <div class="selected-info">
                            <h3>Récapitulatif de votre rendez-vous</h3>
                            <p><strong>Date :</strong> ${dateFormatted}</p>
                            <p><strong>Heure :</strong> ${selectedTime}</p>
                            <p><strong>Type :</strong> ${typeText}</p>
                            <p><strong>Patient :</strong> ${prenom} ${nom}</p>
                            <p><strong>Email :</strong> ${email}</p>
                            <p><strong>Téléphone :</strong> ${document.getElementById('telephone').value || 'Non renseigné'}</p>
                            <p><strong>Montant :</strong> 60€</p>
                        </div>
                    `;
                    
                    showStep(3);
                });
            }
            
            // Retour étape 2 -> étape 1
            const prevStep2Btn = document.getElementById('prevStep2');
            if (prevStep2Btn) {
                prevStep2Btn.addEventListener('click', () => {
                    showStep(1);
                });
            }
            
           
            const prevStep3Btn = document.getElementById('prevStep3');
            if (prevStep3Btn) {
                prevStep3Btn.addEventListener('click', () => {
                    showStep(2);
                });
            }
            
            // Confirmation finale
            const confirmBtn = document.getElementById('confirmBtn');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', async () => {
                    const btn = document.getElementById('confirmBtn');
                    const originalText = btn.innerHTML;
                    btn.innerHTML = 'Confirmation en cours... <span class="loading"></span>';
                    btn.disabled = true;
                    
                    const appointmentData = {
                        civilite: document.getElementById('civilite').value,
                        prenom: document.getElementById('prenom').value,
                        nom: document.getElementById('nom').value,
                        email: document.getElementById('email').value,
                        telephone: document.getElementById('telephone').value,
                        date: selectedDate,
                        time: selectedTime,
                        type_consultation: document.querySelector('input[name="type"]:checked').value,
                        notes: document.getElementById('message').value
                    };
                    
                    try {
                        console.log('Envoi des données:', appointmentData);
                        const response = await fetch(`${API_URL}/appointments`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(appointmentData)
                        });
                        
                        const result = await response.json();
                        console.log('Réponse:', result);
                        
                        if (result.success) {
                            document.getElementById('successMessage').style.display = 'block';
                            document.getElementById('errorMessage').style.display = 'none';
                            
                            // Réinitialiser le formulaire
                            setTimeout(() => {
                                window.location.href = '/index.html';
                            }, 3000);
                        } else {
                            document.getElementById('errorMessage').style.display = 'block';
                            document.getElementById('errorMessage').textContent = result.error || 'Erreur lors de la réservation';
                            btn.innerHTML = originalText;
                            btn.disabled = false;
                        }
                    } catch (error) {
                        console.error('Erreur:', error);
                        document.getElementById('errorMessage').style.display = 'block';
                        document.getElementById('errorMessage').textContent = 'Erreur de connexion au serveur';
                        btn.innerHTML = originalText;
                        btn.disabled = false;
                    }
                })
            };
        );
    </script>
</body>
</html>