#!/bin/bash

echo "🧪 Job Application Tracking - Quick Test Script"
echo "================================================"

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Server not running. Please start with: npm run dev"
    exit 1
fi

echo "✅ Server is running on http://localhost:3000"
echo ""

echo "📋 Manual Testing Checklist:"
echo ""

echo "1. 🔐 Authentication Testing:"
echo "   - [ ] Go to http://localhost:3000"
echo "   - [ ] Sign in to the application"
echo "   - [ ] Try accessing /applications without signing in (should redirect)"
echo ""

echo "2. 🔍 Job Search & Application:"
echo "   - [ ] Go to /search"
echo "   - [ ] Search for 'software engineer' or 'developer'"
echo "   - [ ] Click 'Apply Now' on a job card"
echo "   - [ ] Verify job apply link opens in new tab"
echo "   - [ ] Check that job appears in /applications with 'APPLIED' status"
echo ""

echo "3. 📊 Applications Management:"
echo "   - [ ] Go to /applications"
echo "   - [ ] Verify the job you applied to is listed"
echo "   - [ ] Click edit button and change status to 'VIEWED'"
echo "   - [ ] Add some notes to the application"
echo "   - [ ] Verify statistics update correctly"
echo ""

echo "4. 🔍 Search & Filtering:"
echo "   - [ ] Use the search box to find applications"
echo "   - [ ] Filter by different statuses (Applied, Viewed, etc.)"
echo "   - [ ] Test with no search results"
echo ""

echo "5. 🗑️ Bulk Operations:"
echo "   - [ ] Select multiple applications using checkboxes"
echo "   - [ ] Test 'Select All' functionality"
echo "   - [ ] Delete selected applications"
echo ""

echo "6. 📱 Responsive Testing:"
echo "   - [ ] Test on mobile device or browser dev tools"
echo "   - [ ] Verify layout works on different screen sizes"
echo ""

echo "7. 🎨 Theme Testing:"
echo "   - [ ] Switch between light and dark themes"
echo "   - [ ] Verify all elements are visible in both themes"
echo ""

echo "8. 🔄 Edge Cases:"
echo "   - [ ] Try applying to the same job twice (should show error)"
echo "   - [ ] Test with slow network (loading states)"
echo "   - [ ] Test with network disconnected (error handling)"
echo ""

echo "9. 📈 Statistics Verification:"
echo "   - [ ] Check that stats cards show correct counts"
echo "   - [ ] Apply to more jobs and verify stats update"
echo "   - [ ] Update statuses and verify stats change"
echo ""

echo "10. 🔗 Navigation Testing:"
echo "    - [ ] Test navigation between dashboard, search, and applications"
echo "    - [ ] Verify breadcrumbs and links work correctly"
echo ""

echo "🎯 Quick API Tests:"
echo ""

# Test if applications API is accessible
echo "Testing API endpoints..."
if curl -s http://localhost:3000/api/user/applications > /dev/null; then
    echo "✅ Applications API is accessible"
else
    echo "❌ Applications API not accessible (may need authentication)"
fi

echo ""
echo "📝 Test Results:"
echo "================"
echo "Date: $(date)"
echo "Tester: _______________"
echo ""
echo "Core Functionality:"
echo "- [ ] User authentication works"
echo "- [ ] Job application flow works"
echo "- [ ] Application management works"
echo "- [ ] Search and filtering works"
echo "- [ ] Statistics dashboard works"
echo ""
echo "Issues Found:"
echo "1. _______________"
echo "2. _______________"
echo "3. _______________"
echo ""
echo "✅ Testing complete!"
echo ""
echo "💡 Tips:"
echo "- Use browser dev tools to check for console errors"
echo "- Test with different user accounts"
echo "- Try the feature on different browsers"
echo "- Check mobile responsiveness" 