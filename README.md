# 🏥 Cabinet de Psychothérapie - Plateforme de prise de rendez-vous

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)](https://flask.palletsprojects.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.0+-orange.svg)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Description

Plateforme web complète pour la gestion de rendez-vous dans un cabinet de psychothérapie.

### ✨ Fonctionnalités

- ✅ **Prise de rendez-vous en ligne** avec calendrier interactif
- ✅ **Créneaux disponibles** en temps réel (9h-18h, toutes les 30min)
- ✅ **Dashboard administrateur** avec statistiques
- ✅ **Base de données SQLite** pour le suivi des patients
- ✅ **API REST** complète
- ✅ **Interface responsive** (mobile/desktop)

## 🛠️ Stack Technique

| Catégorie | Technologies |
|-----------|--------------|
| Backend | Python, Flask |
| Frontend | HTML5, CSS3, JavaScript |
| Base de données | SQLite |
| Authentification | JWT |
| UI | Flatpickr, FontAwesome |

## 🚀 Installation

### Prérequis
- Python 3.8+
- Git

### Installation locale

```bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/cabinet-psy.git
cd cabinet-psy

# Installer les dépendances
pip install flask flask-cors

# Lancer l'application
python backend/app_final.py
