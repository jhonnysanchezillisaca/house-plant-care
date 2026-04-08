#!/bin/bash
set -e

BASE_URL="${1:-http://localhost:3000}"

echo "House Plant Care - API Token Integration Test"
echo "================================================"
echo "Testing against: $BASE_URL"
echo ""

TOKEN="${2}"
if [ -z "$TOKEN" ]; then
  echo "Usage: $0 <base_url> <api_token>"
  echo ""
  echo "Steps to get an API token:"
  echo "  1. Open $BASE_URL in your browser"
  echo "  2. Sign up / log in"
  echo "  3. Go to Settings → API Tokens"
  echo "  4. Create a token and copy it"
  echo "  5. Run: $0 $BASE_URL <your_token>"
  exit 1
fi

AUTH_HEADER="Authorization: Bearer $TOKEN"

echo "--- Testing API Token Authentication ---"

echo -n "GET /api/user ... "
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH_HEADER" "$BASE_URL/api/user")
if [ "$STATUS" = "200" ]; then echo "PASS ($STATUS)"; else echo "FAIL ($STATUS)"; fi

echo -n "GET /api/rooms ... "
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH_HEADER" "$BASE_URL/api/rooms")
if [ "$STATUS" = "200" ]; then echo "PASS ($STATUS)"; else echo "FAIL ($STATUS)"; fi

echo -n "GET /api/plants ... "
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH_HEADER" "$BASE_URL/api/plants")
if [ "$STATUS" = "200" ]; then echo "PASS ($STATUS)"; else echo "FAIL ($STATUS)"; fi

echo -n "GET /api/care-types ... "
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH_HEADER" "$BASE_URL/api/care-types")
if [ "$STATUS" = "200" ]; then echo "PASS ($STATUS)"; else echo "FAIL ($STATUS)"; fi

echo -n "GET /api/overdue ... "
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH_HEADER" "$BASE_URL/api/overdue")
if [ "$STATUS" = "200" ]; then echo "PASS ($STATUS)"; else echo "FAIL ($STATUS)"; fi

echo -n "GET /api/care-logs ... "
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH_HEADER" "$BASE_URL/api/care-logs")
if [ "$STATUS" = "200" ]; then echo "PASS ($STATUS)"; else echo "FAIL ($STATUS)"; fi

echo ""
echo "--- Testing Token Revocation ---"

echo -n "GET /api/user (no auth) ... "
STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/user")
if [ "$STATUS" = "401" ]; then echo "PASS ($STATUS - correctly unauthorized)"; else echo "FAIL ($STATUS - should be 401)"; fi

echo -n "GET /api/user (bad token) ... "
STATUS=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer hpc_invalidtoken123" "$BASE_URL/api/user")
if [ "$STATUS" = "401" ]; then echo "PASS ($STATUS - correctly unauthorized)"; else echo "FAIL ($STATUS - should be 401)"; fi

echo ""
echo "--- Sample Data ---"

echo "Rooms:"
curl -s -H "$AUTH_HEADER" "$BASE_URL/api/rooms" | python3 -m json.tool 2>/dev/null || curl -s -H "$AUTH_HEADER" "$BASE_URL/api/rooms"

echo ""
echo "Plants:"
curl -s -H "$AUTH_HEADER" "$BASE_URL/api/plants" | python3 -m json.tool 2>/dev/null || curl -s -H "$AUTH_HEADER" "$BASE_URL/api/plants"

echo ""
echo "Overdue:"
curl -s -H "$AUTH_HEADER" "$BASE_URL/api/overdue" | python3 -m json.tool 2>/dev/null || curl -s -H "$AUTH_HEADER" "$BASE_URL/api/overdue"

echo ""
echo "Done!"