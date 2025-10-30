#!/bin/bash
set -e

echo "🚀 Publishing to GitHub: HederaAfrica..."

# Configuration
REPO_URL="https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/itsaina207/HederaAfrica.git"
BRANCH="main"

# Vérifier si le remote existe déjà
if git remote | grep -q "hederaafrica"; then
    echo "✓ Remote 'hederaafrica' already exists, updating URL..."
    git remote set-url hederaafrica "$REPO_URL"
else
    echo "✓ Adding remote 'hederaafrica'..."
    git remote add hederaafrica "$REPO_URL"
fi

# Ajouter tous les fichiers
echo "✓ Adding files..."
git add .

# Créer le commit
echo "✓ Creating commit..."
git commit -m "Deploy: Hedera Stablecoin Studio with Mobile Money Management, Analytics Dashboard, and NiaSync Webhooks

Features:
- Landing page with 'Mobile money on-chain, cash out anywhere'
- Mobile Money Management dashboard with Orange Money transaction analysis
- Analytics dashboard with pie charts (supply vs reserves, coverage ratio)
- NiaSync API Webhooks system with pagination
- Backend NestJS with PostgreSQL
- Frontend React optimized for production
- Autoscale deployment configuration
" || echo "No changes to commit"

# Pousser vers GitHub
echo "✓ Pushing to GitHub..."
git push -u hederaafrica $BRANCH --force

echo ""
echo "✅ Successfully published to https://github.com/itsaina207/HederaAfrica"
echo ""
