#!/bin/bash

# ===================================
# Rasim Otomotiv Panel - Quick Deploy Script
# ===================================

set -e

echo "🚀 Rasim Otomotiv Panel - Production Deployment"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if git is clean
if [[ -n $(git status -s) ]]; then
  echo -e "${YELLOW}⚠️  You have uncommitted changes!${NC}"
  echo ""
  git status -s
  echo ""
  read -p "Do you want to commit these changes? (yes/no): " commit_changes

  if [[ $commit_changes == "yes" || $commit_changes == "y" ]]; then
    read -p "Enter commit message: " commit_msg
    git add .
    git commit -m "$commit_msg"
    echo -e "${GREEN}✅ Changes committed${NC}"
  else
    echo -e "${YELLOW}⚠️  Proceeding with uncommitted changes${NC}"
  fi
fi

echo ""
echo "📋 Pre-deployment Checklist:"
echo "=============================="

# Check if .env files exist
if [[ ! -f "backend/.env" ]]; then
  echo -e "${RED}❌ backend/.env not found${NC}"
  echo "   Copy backend/.env.example to backend/.env and configure it"
  exit 1
else
  echo -e "${GREEN}✅ Backend environment configured${NC}"
fi

if [[ ! -f "frontend/.env" ]]; then
  echo -e "${YELLOW}⚠️  frontend/.env not found (optional for local)${NC}"
else
  echo -e "${GREEN}✅ Frontend environment configured${NC}"
fi

# Check if Supabase schema has been applied
echo ""
read -p "Have you applied the Supabase schema (supabase-schema-fixed.sql)? (yes/no): " schema_applied

if [[ $schema_applied != "yes" && $schema_applied != "y" ]]; then
  echo -e "${RED}❌ Please apply the database schema first!${NC}"
  echo "   Go to Supabase Dashboard → SQL Editor → Run backend/supabase-schema-fixed.sql"
  exit 1
fi

# Check deployment target
echo ""
echo "📦 Where are you deploying?"
echo "1) Railway (Backend) + Vercel (Frontend) - Recommended"
echo "2) Render (Backend) + Vercel (Frontend)"
echo "3) Manual deployment"
read -p "Select option (1-3): " deploy_option

# Push to git
echo ""
echo -e "${BLUE}📤 Pushing to GitHub...${NC}"
git push origin main
echo -e "${GREEN}✅ Code pushed to GitHub${NC}"

case $deploy_option in
  1)
    echo ""
    echo "🚂 Railway + Vercel Deployment"
    echo "================================"
    echo ""
    echo "Backend (Railway):"
    echo "1. Go to: https://railway.app/new"
    echo "2. Click 'Deploy from GitHub repo'"
    echo "3. Select your repository"
    echo "4. Railway will auto-detect the configuration"
    echo "5. Add environment variables from backend/.env.example"
    echo "6. Click 'Deploy'"
    echo ""
    echo "Frontend (Vercel):"
    echo "1. Go to: https://vercel.com/new"
    echo "2. Import your GitHub repository"
    echo "3. Vercel will auto-detect the configuration"
    echo "4. Add environment variable: VITE_API_URL=<your-railway-url>"
    echo "5. Click 'Deploy'"
    echo ""
    ;;
  2)
    echo ""
    echo "🎨 Render + Vercel Deployment"
    echo "==============================="
    echo ""
    echo "Backend (Render):"
    echo "1. Go to: https://dashboard.render.com/new"
    echo "2. Select 'Web Service'"
    echo "3. Connect your GitHub repository"
    echo "4. Configure:"
    echo "   - Root Directory: backend"
    echo "   - Build Command: npm install && npm run build"
    echo "   - Start Command: npm run start:prod"
    echo "5. Add environment variables"
    echo "6. Click 'Create Web Service'"
    echo ""
    echo "Frontend (Vercel):"
    echo "1. Go to: https://vercel.com/new"
    echo "2. Import your GitHub repository"
    echo "3. Add environment variable: VITE_API_URL=<your-render-url>"
    echo "4. Click 'Deploy'"
    echo ""
    ;;
  3)
    echo ""
    echo "📖 Manual Deployment"
    echo "===================="
    echo "Please refer to DEPLOYMENT_GUIDE.md for detailed instructions"
    echo ""
    ;;
  *)
    echo -e "${RED}Invalid option${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment preparation complete!${NC}"
echo ""
echo "📝 Next Steps:"
echo "=============="
echo "1. Complete the deployment on your chosen platform"
echo "2. Get your backend URL and update frontend environment"
echo "3. Run: node backend/setup-production-db.js (to create admin user)"
echo "4. Test your application"
echo "5. Configure custom domain (optional)"
echo ""
echo "📚 Full documentation: DEPLOYMENT_GUIDE.md"
echo ""
