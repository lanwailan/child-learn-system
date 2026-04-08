#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:4322"
CREATED_ITEM_ID=""

echo -e "${BLUE}🚀 Child Learn System API Test Suite${NC}\n"

# Test 1: Health Check
echo -e "${BLUE}[1/7] Testing Health Check...${NC}"
response=$(curl -s "$BASE_URL/api/health")
if echo "$response" | grep -q "\"status\":\"ok\""; then
  echo -e "${GREEN}✅ Health check passed${NC}\n"
else
  echo -e "${RED}❌ Health check failed${NC}"
  exit 1
fi

# Test 2: Upload Learning Item
echo -e "${BLUE}[2/7] Testing Upload...${NC}"
upload_response=$(curl -s -X POST "$BASE_URL/api/upload" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "vocabulary",
    "title": "Animals - Dog",
    "raw_content": "Dog is a domestic animal that is popular as a pet.",
    "tags": ["animals", "english"],
    "difficulty": "easy",
    "estimated_time": 5
  }')

CREATED_ITEM_ID=$(echo "$upload_response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$CREATED_ITEM_ID" ]; then
  echo -e "${GREEN}✅ Upload successful - ID: $CREATED_ITEM_ID${NC}\n"
else
  echo -e "${RED}❌ Upload failed${NC}"
  echo "$upload_response"
  exit 1
fi

# Test 3: Generate Content
echo -e "${BLUE}[3/7] Testing Generate...${NC}"
generate_response=$(curl -s -X POST "$BASE_URL/api/generate" \
  -H "Content-Type: application/json" \
  -d "{
    \"learning_item_id\": \"$CREATED_ITEM_ID\",
    \"llm_provider\": \"deepseek\"
  }")

if echo "$generate_response" | grep -q "Content generated"; then
  echo -e "${GREEN}✅ Content generation successful${NC}\n"
else
  echo -e "${RED}❌ Content generation failed${NC}"
  echo "$generate_response"
fi

# Test 4: Get Recommendations
echo -e "${BLUE}[4/7] Testing Recommendations...${NC}"
recommend_response=$(curl -s "$BASE_URL/api/recommend?limit=10")

if echo "$recommend_response" | grep -q "recommended_items"; then
  echo -e "${GREEN}✅ Recommendations retrieved${NC}\n"
else
  echo -e "${RED}❌ Recommendations failed${NC}"
  echo "$recommend_response"
fi

# Test 5: Record Review
echo -e "${BLUE}[5/7] Testing Review Feedback...${NC}"
review_response=$(curl -s -X POST "$BASE_URL/api/review" \
  -H "Content-Type: application/json" \
  -d "{
    \"learning_item_id\": \"$CREATED_ITEM_ID\",
    \"user_feedback\": \"good\",
    \"time_spent\": 300
  }")

if echo "$review_response" | grep -q "new_mastery_level"; then
  mastery=$(echo "$review_response" | grep -o '"new_mastery_level":[0-9]*' | cut -d':' -f2)
  echo -e "${GREEN}✅ Review recorded - New mastery: $mastery%${NC}\n"
else
  echo -e "${RED}❌ Review failed${NC}"
  echo "$review_response"
fi

# Test 6: Get Statistics
echo -e "${BLUE}[6/7] Testing Statistics...${NC}"
stats_response=$(curl -s "$BASE_URL/api/stats")

if echo "$stats_response" | grep -q "total_items"; then
  total=$(echo "$stats_response" | grep -o '"total_items":[0-9]*' | cut -d':' -f2)
  echo -e "${GREEN}✅ Statistics retrieved - Total items: $total${NC}\n"
else
  echo -e "${RED}❌ Statistics failed${NC}"
  echo "$stats_response"
fi

# Test 7: Get Schedule
echo -e "${BLUE}[7/7] Testing Schedule...${NC}"
schedule_response=$(curl -s "$BASE_URL/api/schedule?days=30")

if echo "$schedule_response" | grep -q "schedule"; then
  echo -e "${GREEN}✅ Schedule generated${NC}\n"
else
  echo -e "${RED}❌ Schedule failed${NC}"
  echo "$schedule_response"
fi

echo -e "${GREEN}✅ All tests completed!${NC}"
echo -e "${BLUE}📚 Next step: Visit http://localhost:3000 to see the UI${NC}"
