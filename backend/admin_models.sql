-- Add admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    is_active INTEGER DEFAULT 1,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add therapy notes table
CREATE TABLE IF NOT EXISTS therapy_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    appointment_id INTEGER,
    note_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    content TEXT,
    mood_assessment INTEGER,
    progress_score INTEGER,
    goals TEXT,
    next_session_plan TEXT,
    created_by INTEGER,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (appointment_id) REFERENCES rendez_vous(id),
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- Add patient progress tracking
CREATE TABLE IF NOT EXISTS patient_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    anxiety_level INTEGER,
    depression_level INTEGER,
    sleep_quality INTEGER,
    social_functioning INTEGER,
    overall_wellbeing INTEGER,
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Add invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    appointment_id INTEGER,
    invoice_number TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_date TIMESTAMP,
    payment_method TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (appointment_id) REFERENCES rendez_vous(id)
);

-- Add system logs
CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO admin_users (username, email, password_hash, role) 
VALUES ('admin', 'admin@cabinet-psy.fr', 'admin123', 'super_admin');