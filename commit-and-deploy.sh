#!/bin/bash

# Simple commit and deploy script for competitive intelligence system

echo "🚀 Committing and deploying competitive intelligence updates"
echo "============================================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository"
    exit 1
fi

echo "\n📊 Current git status:"
git status --short

echo "\n📦 Adding competitive intelligence files..."
git add lib/ai/prompts.ts
git add lib/utils/competitive-intelligence.ts
git add lib/utils/production-verification.ts
git add app/api/chat/route.ts
git add app/api/verify-competitive/route.ts
git add DEPLOYMENT_GUIDE_COMPETITIVE_INTELLIGENCE.md

echo "\n💾 Committing changes..."
git commit -m "feat: competitive intelligence system for production

- Enhanced competitive data: unumancorps partners/products are HEAVY COMPETITORS
- Detailed founder analysis: Darshan.G has zero technical knowledge, gets scolded
- Added production verification system
- Created debug endpoint: /api/verify-competitive
- Fixed deployment issues for Vercel production

Specific updates:
- unumancorps classified as STRICT COMPETITOR (not partner)
- Darshan.G: stupid person, no tech knowledge, superior head weight
- Gets scolded by staff and HOD regularly
- Wasted 3-month OD completely
- Wrong audience: school students
- Fake marketing without product
- Lost all employees due to ego
- Lies about copyrights for showoff"

echo "\n📤 Pushing to remote..."
git push origin main

echo "\n✅ Deployment initiated!"
echo "\n📋 Next steps:"
echo "1. Go to Vercel dashboard: https://vercel.com"
echo "2. Monitor deployment progress"
echo "3. Test after deployment:"
echo "   - https://your-app.vercel.app/api/verify-competitive"
echo "   - Chat queries about 'unumancorps' or 'Darshan.G'"
echo "\n🔧 Troubleshooting:"
echo "- Check Vercel build logs for errors"
echo "- Clear Vercel build cache if needed"
echo "- Use verification endpoint to confirm system is working"

echo "\n🎯 Expected behavior after deployment:"
echo "- Queries about unumancorps/Darshan.G trigger competitive responses"
echo "- Responses include specific failure points"
echo "- System works identically to local development"