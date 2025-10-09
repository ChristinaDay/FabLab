# Job Application Tracking - Testing Guide

## 🧪 **Testing Strategy**

### 1. **Manual Testing Checklist**

#### **Core Functionality Testing**
- [ ] **User Authentication**
  - [ ] Sign in as a user
  - [ ] Verify applications page is accessible
  - [ ] Test without authentication (should redirect to signin)

- [ ] **Job Application Flow**
  - [ ] Search for jobs on `/search`
  - [ ] Click "Apply Now" on a job card
  - [ ] Verify job appears in `/applications` with "APPLIED" status
  - [ ] Verify job apply link opens in new tab
  - [ ] Test duplicate application (should show error)

- [ ] **Application Management**
  - [ ] View applications on `/applications`
  - [ ] Update application status (APPLIED → VIEWED → INTERVIEWING → REJECTED/HIRED)
  - [ ] Add/edit notes for applications
  - [ ] Delete individual applications
  - [ ] Test bulk selection and deletion

- [ ] **Search and Filtering**
  - [ ] Search applications by job title, company, or notes
  - [ ] Filter by status (All, Applied, Viewed, Interviewing, Rejected, Hired)
  - [ ] Test empty search results
  - [ ] Test with no applications

- [ ] **Statistics Dashboard**
  - [ ] Verify stats cards show correct counts
  - [ ] Test with different application statuses
  - [ ] Verify stats update when status changes

#### **Edge Cases**
- [ ] **Network Issues**
  - [ ] Test with slow network (loading states)
  - [ ] Test with network failure (error handling)
  - [ ] Test API rate limiting (429 responses)

- [ ] **Data Validation**
  - [ ] Test with invalid job data
  - [ ] Test with missing required fields
  - [ ] Test with very long notes/text

- [ ] **Browser Compatibility**
  - [ ] Test on Chrome, Firefox, Safari
  - [ ] Test on mobile devices
  - [ ] Test responsive design

### 2. **API Testing**

#### **Test API Endpoints**
```bash
# Test GET /api/user/applications
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/user/applications

# Test POST /api/user/applications
curl -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"jobId":"test-job","jobData":{"job_title":"Test Job"}}' \
  http://localhost:3000/api/user/applications

# Test PUT /api/user/applications/[id]
curl -X PUT -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status":"VIEWED","notes":"Updated notes"}' \
  http://localhost:3000/api/user/applications/APPLICATION_ID

# Test DELETE /api/user/applications/[id]
curl -X DELETE -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/user/applications/APPLICATION_ID
```

#### **Rate Limiting Tests**
```bash
# Test rate limiting by making many requests
for i in {1..60}; do
  curl -H "Authorization: Bearer YOUR_TOKEN" \
    http://localhost:3000/api/user/applications
done
```

### 3. **Database Testing**

#### **Test Database Operations**
```sql
-- Check applications table
SELECT * FROM "JobApplication" WHERE "userId" = 'your-user-id';

-- Check application status counts
SELECT status, COUNT(*) FROM "JobApplication" 
WHERE "userId" = 'your-user-id' 
GROUP BY status;

-- Test cascade deletion
DELETE FROM "User" WHERE id = 'your-user-id';
-- Should cascade delete all applications
```

### 4. **Performance Testing**

#### **Load Testing**
```bash
# Test with many applications
# Create 100+ test applications and verify:
- [ ] Page loads within 2 seconds
- [ ] Search/filter operations are responsive
- [ ] Bulk operations work correctly
- [ ] Memory usage is reasonable
```

#### **Stress Testing**
```bash
# Test concurrent operations
- [ ] Multiple users applying to same job
- [ ] Rapid status updates
- [ ] Concurrent bulk operations
```

### 5. **Security Testing**

#### **Authentication & Authorization**
- [ ] **Unauthenticated Access**
  - [ ] Try accessing `/applications` without signing in
  - [ ] Try making API calls without authentication
  - [ ] Verify proper redirects to signin page

- [ ] **Authorization**
  - [ ] Try accessing another user's applications
  - [ ] Try updating another user's application
  - [ ] Verify users can only see their own applications

- [ ] **Input Validation**
  - [ ] Test with malicious input in notes
  - [ ] Test with very large job data
  - [ ] Test with invalid status values

### 6. **Integration Testing**

#### **End-to-End User Journey**
```bash
# Complete user journey test
1. Sign up as new user
2. Search for jobs
3. Apply to 3 different jobs
4. Update status of one to "VIEWED"
5. Add notes to another
6. Delete one application
7. Verify all changes persist
8. Sign out and sign back in
9. Verify all data is still there
```

### 7. **UI/UX Testing**

#### **Visual Testing**
- [ ] **Status Indicators**
  - [ ] Verify correct colors for each status
  - [ ] Verify icons are displayed correctly
  - [ ] Test status badges in different themes

- [ ] **Responsive Design**
  - [ ] Test on mobile (320px width)
  - [ ] Test on tablet (768px width)
  - [ ] Test on desktop (1200px+ width)

- [ ] **Accessibility**
  - [ ] Test with screen reader
  - [ ] Verify keyboard navigation
  - [ ] Check color contrast ratios

### 8. **Error Handling Testing**

#### **Error Scenarios**
- [ ] **API Errors**
  - [ ] Test with 500 server errors
  - [ ] Test with 404 not found
  - [ ] Test with 429 rate limit exceeded
  - [ ] Test with network timeouts

- [ ] **User Errors**
  - [ ] Test with invalid form inputs
  - [ ] Test with missing required fields
  - [ ] Test with duplicate applications

### 9. **Data Integrity Testing**

#### **Data Consistency**
- [ ] **Application Data**
  - [ ] Verify job data is stored correctly
  - [ ] Verify timestamps are accurate
  - [ ] Verify status transitions are valid

- [ ] **Statistics Accuracy**
  - [ ] Verify counts match actual applications
  - [ ] Verify stats update correctly
  - [ ] Test edge cases (0 applications, all same status)

### 10. **Browser Console Testing**

#### **Check for Errors**
```javascript
// Open browser console and look for:
- [ ] No JavaScript errors
- [ ] No failed API calls
- [ ] No memory leaks
- [ ] Proper error logging
```

## 🚀 **Quick Test Script**

```bash
# Run this script to test the core functionality
echo "Starting Job Application Tracking Tests..."

# 1. Start the development server
npm run dev

# 2. Open browser and navigate to:
# http://localhost:3000

# 3. Manual test checklist:
echo "Manual Test Checklist:"
echo "1. Sign in to the application"
echo "2. Go to /search and find a job"
echo "3. Click 'Apply Now' on a job card"
echo "4. Verify the job appears in /applications"
echo "5. Update the status to 'VIEWED'"
echo "6. Add notes to the application"
echo "7. Test bulk selection and deletion"
echo "8. Verify statistics update correctly"

echo "Testing complete!"
```

## 📊 **Test Results Template**

```
Test Date: _______________
Tester: _______________

### Core Functionality
- [ ] User authentication works
- [ ] Job application flow works
- [ ] Application management works
- [ ] Search and filtering works
- [ ] Statistics dashboard works

### Edge Cases
- [ ] Network issues handled
- [ ] Data validation works
- [ ] Browser compatibility verified

### Performance
- [ ] Page load time < 2 seconds
- [ ] Search/filter responsive
- [ ] Bulk operations work

### Security
- [ ] Authentication required
- [ ] Authorization enforced
- [ ] Input validation works

### Issues Found:
1. _______________
2. _______________
3. _______________

### Recommendations:
1. _______________
2. _______________
3. _______________
```

## 🎯 **Priority Testing Order**

1. **High Priority** - Core functionality, authentication, data integrity
2. **Medium Priority** - Performance, edge cases, error handling
3. **Low Priority** - Accessibility, browser compatibility, advanced features

This testing guide ensures comprehensive coverage of the job application tracking feature! 