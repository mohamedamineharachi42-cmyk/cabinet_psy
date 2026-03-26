// Admin Dashboard JavaScript
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api'
    : '/api';

let reportChart = null;

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('admin_token');
    if (!token && !window.location.pathname.includes('admin-login.html')) {
        window.location.href = '/admin-login.html';
        return false;
    }
    return true;
}

// Logout function
window.logout = function() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
    window.location.href = '/admin-login.html';
};

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        border-radius: 10px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;
    
    // Load admin name
    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    const adminNameSpan = document.querySelector('#adminName');
    if (adminNameSpan) adminNameSpan.textContent = admin.username || 'Admin';
    
    initNavigation();
    loadDashboard();
});

// Navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            switchTab(tab);
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchTab(tab) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected tab
    const tabId = tab + 'Tab';
    const activeTab = document.getElementById(tabId);
    if (activeTab) {
        activeTab.style.display = 'block';
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = getTabTitle(tab);
        
        // Load tab data
        switch(tab) {
            case 'dashboard': loadDashboard(); break;
            case 'patients': loadPatients(); break;
            case 'appointments': loadAppointments(); break;
            case 'reports': loadReports(); break;
            case 'notes': loadTherapyNotes(); break;
            case 'invoices': loadInvoices(); break;
            case 'database': loadDatabaseStructure(); break;
        }
    }
}

function getTabTitle(tab) {
    const titles = {
        dashboard: 'Dashboard',
        patients: 'Gestion des patients',
        appointments: 'Rendez-vous',
        reports: 'Rapports et statistiques',
        notes: 'Notes thérapeutiques',
        invoices: 'Facturation',
        database: 'Structure de la base de données'
    };
    return titles[tab] || tab;
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/admin/stats`);
        const data = await response.json();
        
        if (data.success) {
            displayStats(data.stats);
            displayRecentAppointments(data.recent_appointments);
        } else {
            console.error('Error in stats response:', data);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Erreur de chargement du dashboard', 'error');
    }
}

function displayStats(stats) {
    const statsGrid = document.getElementById('statsGrid');
    if (!statsGrid) return;
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <h3>Total patients</h3>
            <div class="stat-value">${stats.total_patients || 0}</div>
        </div>
        <div class="stat-card">
            <h3>Rendez-vous aujourd'hui</h3>
            <div class="stat-value">${stats.today_appointments || 0}</div>
        </div>
        <div class="stat-card">
            <h3>Rendez-vous ce mois</h3>
            <div class="stat-value">${stats.month_appointments || 0}</div>
        </div>
        <div class="stat-card">
            <h3>Chiffre d'affaires (mois)</h3>
            <div class="stat-value">${stats.month_revenue || 0}€</div>
        </div>
    `;
}

function displayRecentAppointments(appointments) {
    const container = document.getElementById('recentAppointments');
    if (!container) return;
    
    if (!appointments || appointments.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center;">Aucun rendez-vous récent</div>';
        return;
    }
    
    container.innerHTML = `
        <table style="width: 100%;">
            <thead>
                <tr><th>Patient</th><th>Date</th><th>Type</th><th>Statut</th>
            </thead>
            <tbody>
                ${appointments.map(apt => `
                    <tr>
                        <td>${apt.prenom} ${apt.nom}</td>
                        <td>${formatDate(apt.date_rdv)}</td>
                        <td>${apt.type_consultation === 'visio' ? 'Visio' : 'Présentiel'}</td>
                        <td><span class="status-badge status-${apt.statut}">${apt.statut}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ==================== PATIENTS ====================
async function loadPatients() {
    try {
        const response = await fetch(`${API_URL}/admin/patients`);
        const data = await response.json();
        
        if (data.success) {
            displayPatients(data.patients);
            loadPatientsForSelect();
        }
    } catch (error) {
        console.error('Error loading patients:', error);
        showNotification('Erreur de chargement des patients', 'error');
    }
}

function displayPatients(patients) {
    const tbody = document.getElementById('patientsList');
    if (!tbody) return;
    
    tbody.innerHTML = patients.map(patient => `
        <tr>
            <td>${patient.id}</td>
            <td>${patient.nom}</td>
            <td>${patient.prenom}</td>
            <td>${patient.email}</td>
            <td>${patient.telephone || '-'}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="viewPatient(${patient.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deletePatient(${patient.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

async function loadPatientsForSelect() {
    try {
        const response = await fetch(`${API_URL}/admin/patients`);
        const data = await response.json();
        if (data.success) {
            const select = document.getElementById('notePatientId');
            if (select) {
                select.innerHTML = '<option value="">Sélectionner un patient</option>' +
                    data.patients.map(p => `<option value="${p.id}">${p.prenom} ${p.nom}</option>`).join('');
            }
        }
    } catch (error) {
        console.error('Error loading patients for select:', error);
    }
}

// Modal functions
window.openAddPatientModal = function() {
    const modal = document.getElementById('patientModal');
    const title = document.getElementById('patientModalTitle');
    if (title) title.textContent = 'Ajouter un patient';
    const form = document.getElementById('patientForm');
    if (form) form.reset();
    if (modal) modal.style.display = 'flex';
};

window.closePatientModal = function() {
    const modal = document.getElementById('patientModal');
    if (modal) modal.style.display = 'none';
};

window.openAddNoteModal = function() {
    const modal = document.getElementById('noteModal');
    const form = document.getElementById('noteForm');
    if (form) form.reset();
    if (modal) modal.style.display = 'flex';
};

window.closeNoteModal = function() {
    const modal = document.getElementById('noteModal');
    if (modal) modal.style.display = 'none';
};

window.viewPatient = function(id) {
    showNotification(`Affichage du patient ${id}`, 'info');
};

// Add patient
async function addPatient(patientData) {
    try {
        const response = await fetch(`${API_URL}/admin/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patientData)
        });
        const data = await response.json();
        if (data.success) {
            closePatientModal();
            loadPatients();
            showNotification('Patient ajouté avec succès');
        }
    } catch (error) {
        console.error('Error adding patient:', error);
        showNotification('Erreur lors de l\'ajout', 'error');
    }
}

window.deletePatient = async function(id) {
    if (confirm('Voulez-vous vraiment supprimer ce patient ?')) {
        try {
            const response = await fetch(`${API_URL}/admin/patients/${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (data.success) {
                loadPatients();
                showNotification('Patient supprimé');
            }
        } catch (error) {
            console.error('Error deleting patient:', error);
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
};

// ==================== APPOINTMENTS ====================
async function loadAppointments() {
    try {
        const response = await fetch(`${API_URL}/admin/appointments`);
        const data = await response.json();
        
        if (data.success) {
            displayAppointments(data.appointments);
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        showNotification('Erreur de chargement des rendez-vous', 'error');
    }
}

function displayAppointments(appointments) {
    const tbody = document.getElementById('appointmentsList');
    if (!tbody) return;
    
    tbody.innerHTML = appointments.map(apt => `
        <tr>
            <td>${apt.id}</td>
            <td>${apt.prenom} ${apt.nom}</td>
            <td>${formatDate(apt.date_rdv)}</td>
            <td>${apt.type_consultation === 'visio' ? 'Visio' : 'Présentiel'}</td>
            <td><span class="status-badge status-${apt.statut}">${apt.statut}</span></td>
            <td>${apt.montant || 60}€</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editAppointment(${apt.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="cancelAppointment(${apt.id})">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ==================== REPORTS ====================
async function loadReports() {
    const period = document.getElementById('reportPeriod')?.value || 'month';
    try {
        const response = await fetch(`${API_URL}/admin/reports?period=${period}`);
        const data = await response.json();
        
        if (data.success) {
            displayReportChart(data.chart_data);
            displayReportStats(data.stats);
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        showNotification('Erreur de chargement des rapports', 'error');
    }
}

function displayReportChart(chartData) {
    const ctx = document.getElementById('reportChart');
    if (!ctx) return;
    
    if (reportChart) {
        reportChart.destroy();
    }
    
    reportChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels || [],
            datasets: [{
                label: 'Nombre de consultations',
                data: chartData.values || [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top' }
            }
        }
    });
}

function displayReportStats(stats) {
    const container = document.getElementById('reportStats');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total consultations</h3>
                <div class="stat-value">${stats.total_appointments || 0}</div>
            </div>
            <div class="stat-card">
                <h3>Nouveaux patients</h3>
                <div class="stat-value">${stats.new_patients || 0}</div>
            </div>
            <div class="stat-card">
                <h3>Taux d'annulation</h3>
                <div class="stat-value">${stats.cancellation_rate || 0}%</div>
            </div>
            <div class="stat-card">
                <h3>Revenu total</h3>
                <div class="stat-value">${stats.total_revenue || 0}€</div>
            </div>
        </div>
    `;
}

// ==================== THERAPY NOTES ====================
async function loadTherapyNotes() {
    try {
        const response = await fetch(`${API_URL}/admin/therapy-notes`);
        const data = await response.json();
        
        if (data.success) {
            displayTherapyNotes(data.notes);
        }
    } catch (error) {
        console.error('Error loading therapy notes:', error);
        showNotification('Erreur de chargement des notes', 'error');
    }
}

function displayTherapyNotes(notes) {
    const container = document.getElementById('therapyNotesList');
    if (!container) return;
    
    if (!notes || notes.length === 0) {
        container.innerHTML = '<div class="data-table" style="padding: 20px; text-align: center;">Aucune note thérapeutique</div>';
        return;
    }
    
    container.innerHTML = notes.map(note => `
        <div class="data-table" style="margin-bottom: 20px; padding: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <strong>${note.prenom} ${note.nom}</strong>
                <small>${formatDate(note.note_date)}</small>
            </div>
            <p><strong>Humeur:</strong> ${note.mood_assessment || '-'}/10</p>
            <p><strong>Progression:</strong> ${note.progress_score || '-'}/10</p>
            <p><strong>Notes:</strong> ${note.content}</p>
            <p><strong>Objectifs:</strong> ${note.goals || '-'}</p>
        </div>
    `).join('');
}

async function addTherapyNote(noteData) {
    try {
        const response = await fetch(`${API_URL}/admin/therapy-notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(noteData)
        });
        const data = await response.json();
        if (data.success) {
            closeNoteModal();
            loadTherapyNotes();
            showNotification('Note ajoutée avec succès');
        }
    } catch (error) {
        console.error('Error adding therapy note:', error);
        showNotification('Erreur lors de l\'ajout', 'error');
    }
}

// ==================== INVOICES ====================
async function loadInvoices() {
    try {
        const response = await fetch(`${API_URL}/admin/invoices`);
        const data = await response.json();
        
        if (data.success) {
            displayInvoices(data.invoices);
        }
    } catch (error) {
        console.error('Error loading invoices:', error);
        showNotification('Erreur de chargement des factures', 'error');
    }
}

function displayInvoices(invoices) {
    const tbody = document.getElementById('invoicesList');
    if (!tbody) return;
    
    tbody.innerHTML = invoices.map(inv => `
        <tr>
            <td>${inv.invoice_number}</td>
            <td>${inv.prenom} ${inv.nom}</td>
            <td>${inv.amount}€</td>
            <td><span class="status-badge status-${inv.status}">${inv.status}</span></td>
            <td>${formatDate(inv.created_at)}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="viewInvoice(${inv.id})">
                    <i class="fas fa-download"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ==================== DATABASE STRUCTURE ====================
async function loadDatabaseStructure() {
    try {
        const response = await fetch(`${API_URL}/admin/database-structure`);
        const data = await response.json();
        
        if (data.success) {
            displayDatabaseStructure(data.tables);
        }
    } catch (error) {
        console.error('Error loading database structure:', error);
        showNotification('Erreur de chargement de la structure', 'error');
    }
}

function displayDatabaseStructure(tables) {
    const container = document.getElementById('databaseStructure');
    if (!container) return;
    
    container.innerHTML = tables.map(table => `
        <div class="data-table" style="margin-bottom: 20px;">
            <div style="padding: 20px; background: #667eea; color: white;">
                <h3>📊 Table: ${table.name}</h3>
            </div>
            <table>
                <thead>
                    <tr><th>Colonne</th><th>Type</th><th>Contrainte</th>
                </thead>
                <tbody>
                    ${table.columns.map(col => `
                        <tr>
                            <td>${col.name}</td>
                            <td>${col.type}</td>
                            <td>${col.constraint ? 'NOT NULL' : ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div style="padding: 15px; background: #f7fafc;">
                <strong>Total enregistrements:</strong> ${table.row_count}
            </div>
        </div>
    `).join('');
}

// Form submissions
document.addEventListener('DOMContentLoaded', () => {
    // Patient form
    const patientForm = document.getElementById('patientForm');
    if (patientForm) {
        patientForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const patientData = {
                civilite: document.getElementById('patientCivilite').value,
                prenom: document.getElementById('patientPrenom').value,
                nom: document.getElementById('patientNom').value,
                email: document.getElementById('patientEmail').value,
                telephone: document.getElementById('patientTelephone').value,
                password: 'default123'
            };
            await addPatient(patientData);
        });
    }
    
    // Note form
    const noteForm = document.getElementById('noteForm');
    if (noteForm) {
        noteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const noteData = {
                patient_id: document.getElementById('notePatientId').value,
                content: document.getElementById('noteContent').value,
                mood_assessment: document.getElementById('noteMood').value,
                progress_score: document.getElementById('noteProgress').value,
                goals: document.getElementById('noteGoals').value
            };
            await addTherapyNote(noteData);
        });
    }
    
    // Settings form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Paramètres enregistrés', 'success');
        });
    }
    
    // Period selector
    const periodSelect = document.getElementById('reportPeriod');
    if (periodSelect) {
        periodSelect.addEventListener('change', loadReports);
    }
});