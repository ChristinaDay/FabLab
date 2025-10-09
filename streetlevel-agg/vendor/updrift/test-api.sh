#!/bin/bash

echo "🧪 Testing UpFetch API Setup..."
echo ""

echo "1️⃣ Checking API status:"
curl -s http://localhost:3000/api/jobs/test | jq '.'
echo ""

echo "2️⃣ Testing job search:"
curl -s "http://localhost:3000/api/jobs/search?query=developer&location=san+francisco" | jq '.status, .data | length'
echo ""

echo "✅ Test complete! Look for 'Live Data' badge in your app at http://localhost:3000" 