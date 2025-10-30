#!/bin/bash
set -e

echo "🚀 Publishing to GitHub: HederaAfrica..."

# Configuration
GITHUB_USER="itsaina207"
GITHUB_REPO="HederaAfrica"
REPO_URL="https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/${GITHUB_USER}/${GITHUB_REPO}.git"

# Vérifier si le remote 'origin-hederaafrica' existe
if git remote | grep -q "origin-hederaafrica"; then
    echo "✓ Removing old remote..."
    git remote remove origin-hederaafrica
fi

# Ajouter le nouveau remote
echo "✓ Adding remote 'origin-hederaafrica'..."
git remote add origin-hederaafrica "$REPO_URL"

# Vérifier la branche actuelle
CURRENT_BRANCH=$(git branch --show-current)
echo "✓ Current branch: $CURRENT_BRANCH"

# Ajouter tous les fichiers
echo "✓ Adding all files..."
git add -A

# Créer le commit
echo "✓ Creating commit..."
git commit -m "Initial deployment: Hedera Stablecoin Studio with Mobile Money Management

Features:
- Landing page: Mobile money on-chain, cash out anywhere
- Mobile Money Management: Orange Money transaction analysis dashboard
- Analytics Dashboard: Supply vs reserves pie charts, coverage ratio
- NiaSync API Webhooks: Real-time message system with pagination
- Backend: NestJS REST API with PostgreSQL database
- Frontend: React application optimized for production
- Deployment: Autoscale configuration with production server
- Database: PostgreSQL with 1500+ webhook messages, 585 financial transactions
" 2>&1 || {
    echo "ℹ️  No new changes to commit, using existing commits..."
}

# Pousser vers GitHub sur la branche main
echo "✓ Pushing to GitHub (branch: main)..."
git push origin-hederaafrica HEAD:main --force 2>&1

echo ""
echo "✅ SUCCESS! Project published to:"
echo "   https://github.com/${GITHUB_USER}/${GITHUB_REPO}"
echo ""
echo "📂 Repository contents:"
echo "   - Landing page + Mobile Money features"
echo "   - Backend (NestJS) + Frontend (React)"
echo "   - Database schema and migrations"
echo "   - Production deployment configuration"
echo ""
