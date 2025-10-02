#!/bin/bash

# Script de commit sécurisé pour Auto Pièces Équipements
# Créé le : 2 octobre 2025

echo "🔒 COMMIT SÉCURISÉ - Configuration Google Business"
echo "=================================================="
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur : Exécutez ce script depuis la racine du projet"
    exit 1
fi

echo "📋 Fichiers à commiter :"
echo ""
git status --short
echo ""

# Vérifier que .env n'est PAS dans les fichiers à commiter
if git status --short | grep -q "^A.*\.env$"; then
    echo "❌ ERREUR : Le fichier .env est marqué pour commit !"
    echo "   Ceci est DANGEREUX. Le fichier .env contient des informations sensibles."
    echo "   Il a été retiré du tracking Git."
    exit 1
fi

echo "✅ Vérification : .env n'est pas dans le commit (Bon !)"
echo ""

# Confirmer avec l'utilisateur
read -p "Voulez-vous commiter ces changements ? (o/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[OoYy]$ ]]; then
    echo "❌ Commit annulé"
    exit 1
fi

# Stage tous les nouveaux fichiers
echo ""
echo "📦 Ajout des fichiers au staging..."
git add .gitignore
git add .env.example
git add docs/
git add admin/google-business-dashboard.html
git add admin/qr-code-generator.html

echo "✅ Fichiers ajoutés"
echo ""

# Commit avec un message descriptif
echo "💾 Création du commit..."
git commit -m "🔒 Security & Google Business Configuration

- Add comprehensive security documentation
- Remove .env from Git tracking (security)
- Add .gitignore to protect sensitive files
- Add .env.example template with instructions
- Create Google Business setup guides
- Add admin tools (QR generator, dashboard)
- Document current status (28 reviews, 4.9/5 rating)
- Add action plan and security checklist

Security improvements:
- .env removed from version control
- Sensitive files protected via .gitignore
- Documentation for API key management
- Guidelines for password security

New admin tools:
- admin/qr-code-generator.html (Generate QR codes for reviews)
- admin/google-business-dashboard.html (Monitor reviews and stats)

Documentation:
- docs/README.md (Quick start guide)
- docs/ACTION_PLAN.md (Implementation checklist)
- docs/SECURITY_GUIDE.md (Security best practices)
- docs/GOOGLE_BUSINESS_SETUP.md (Complete setup guide)
- docs/GOOGLE_BUSINESS_CURRENT_STATUS.md (Current analysis)

Place ID: ChIJVVXZlqAT5kcRICTpgHlqx9A
Current rating: 4.9/5 ⭐
Current reviews: 28
Goal: 100+ reviews by end of 2025"

if [ $? -eq 0 ]; then
    echo "✅ Commit créé avec succès !"
    echo ""
    echo "📤 Voulez-vous pousser les changements sur GitHub ? (o/n)"
    read -p "" -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[OoYy]$ ]]; then
        echo "📤 Push vers origin/main..."
        git push origin main
        
        if [ $? -eq 0 ]; then
            echo "✅ Changements poussés avec succès !"
        else
            echo "❌ Erreur lors du push"
            exit 1
        fi
    else
        echo "ℹ️  Changements committé localement. Push annulé."
        echo "   Pour pousser plus tard : git push origin main"
    fi
else
    echo "❌ Erreur lors du commit"
    exit 1
fi

echo ""
echo "=================================================="
echo "🎉 CONFIGURATION SÉCURISÉE AVEC SUCCÈS !"
echo "=================================================="
echo ""
echo "📚 Prochaines étapes :"
echo ""
echo "1. 🔒 URGENT : Sécuriser votre compte Google"
echo "   👉 Lire : docs/ACTION_PLAN.md"
echo ""
echo "2. 📖 Lire la documentation"
echo "   - docs/README.md (Démarrage rapide)"
echo "   - docs/SECURITY_GUIDE.md (Sécurité)"
echo "   - docs/GOOGLE_BUSINESS_SETUP.md (Configuration)"
echo ""
echo "3. 🛠️  Tester les outils admin"
echo "   - admin/qr-code-generator.html"
echo "   - admin/google-business-dashboard.html"
echo ""
echo "4. ⚙️  Configurer les clés API"
echo "   - Créer un projet Google Cloud Platform"
echo "   - Générer des clés API avec restrictions"
echo "   - Mettre à jour le fichier .env"
echo ""
echo "=================================================="
echo "✅ Tout est prêt ! Bonne configuration !"
echo "=================================================="
