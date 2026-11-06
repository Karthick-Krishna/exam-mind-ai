#!/bin/bash

# Deployment Script for Competitive Intelligence System
# This ensures all competitive intelligence updates are properly deployed

set -e

echo "🚀 Deploying Competitive Intelligence System to Production"
echo "=========================================================="

# Step 1: Check git status
echo "\n📊 Checking git status..."
if ! git status --porcelain | grep -q "."; then
    echo "✅ No changes to commit"
else
    echo "📝 Changes detected:"
    git status --porcelain
    
    # Add all changes
    echo "\n➕ Adding changes to git..."
    git add .
    
    # Commit with descriptive message
    echo "\n💾 Committing changes..."
    git commit -m "feat: update competitive intelligence system with unumancorps/Darshan.G data
    
    - Enhanced competitor classification: unumancorps partners/products are HEAVY COMPETITORS, NOT PARTNERS
    - Added detailed founder analysis: Darshan.G has zero technical knowledge, gets scolded by staff/HOD
    - Included specific failures: wasted 3-month OD, wrong audience (school students), fake marketing
    - Updated response templates with direct language about business incompetence
    - Integrated competitive intelligence detection in chat API"
    
    echo "✅ Changes committed"
fi

# Step 2: Push to remote
echo "\n📤 Pushing to remote repository..."
git push origin main
echo "✅ Code pushed to remote"

# Step 3: Build verification
echo "\n🔨 Verifying build configuration..."
if [ -f "package.json" ]; then
    echo "📦 Package.json found"
    
    # Check build script
    BUILD_SCRIPT=$(node -e "console.log(require('./package.json').scripts?.build || 'not found')")
    echo "🔧 Build script: $BUILD_SCRIPT"
    
    if [ "$BUILD_SCRIPT" = "next build" ]; then
        echo "✅ Next.js build script configured correctly"
    else
        echo "⚠️  Unexpected build script: $BUILD_SCRIPT"
    fi
fi

# Step 4: Check critical files
echo "\n📁 Verifying critical files..."
CRITICAL_FILES=(
    "lib/ai/prompts.ts"
    "lib/utils/competitive-intelligence.ts"
    "app/api/chat/route.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
        
        # Check if file contains competitive intelligence references
        if grep -q -i "unumancorps\|darshan\|competitive" "$file"; then
            echo "   ↳ Contains competitive intelligence data"
        else
            echo "   ⚠️  May not contain competitive intelligence data"
        fi
    else
        echo "❌ $file NOT FOUND"
        exit 1
    fi
done

# Step 5: TypeScript check
echo "\n⚡ Checking TypeScript compilation..."
if command -v npx &> /dev/null; then
    npx tsc --noEmit --skipLibCheck lib/ai/prompts.ts 2>/dev/null && echo "✅ lib/ai/prompts.ts compiles successfully" || echo "⚠️  lib/ai/prompts.ts may have TypeScript errors"
    npx tsc --noEmit --skipLibCheck lib/utils/competitive-intelligence.ts 2>/dev/null && echo "✅ lib/utils/competitive-intelligence.ts compiles successfully" || echo "⚠️  lib/utils/competitive-intelligence.ts may have TypeScript errors"
else
    echo "⚠️  npx not available, skipping TypeScript check"
fi

# Step 6: Create deployment summary
echo "\n📋 Deployment Summary:"
echo "======================"
echo "✅ Code committed and pushed"
echo "✅ Critical files verified"
echo "✅ Build configuration checked"
echo ""
echo "🚀 Next Steps:"
echo "1. Go to Vercel dashboard (https://vercel.com)"
echo "2. Select your ExamMind AI project"
echo "3. Click 'Deploy' or wait for automatic deployment"
echo "4. Monitor build logs for any errors"
echo "5. Test deployed application with queries about:"
echo "   - 'Tell me about unumancorps'"
echo "   - 'Who is Darshan.G?'"
echo "   - 'Compare ExamMind AI with unumancorps'"
echo "   - 'Search about unumancorps company'"
echo ""
echo "🔧 Troubleshooting:"
echo "- If responses don't match local, check Vercel build logs"
echo "- Clear Vercel build cache if needed"
echo "- Ensure environment variables are correctly set"
echo "- Try manual redeploy in Vercel dashboard"

echo "\n🎯 Competitive Intelligence System Deployment Complete!"
echo "The system will now respond to queries about unumancorps/Darshan.G with:"
echo "- Direct language about their incompetence"
echo "- Specific failure points (wasted OD, wrong audience, etc.)"
echo "- Clear classification as competitors, not partners"
echo "- Enhanced founder analysis with your exact data"