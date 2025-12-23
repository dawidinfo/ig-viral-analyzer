# NotJustAnalytics Features Analysis

## Key Features to Implement in ReelSpy.ai

### 1. Profile Overview
- **Followers Count**: 2,149,547
- **Avg Likes**: 8,945
- **Avg Comments**: 596
- **Engagement Rate**: 0.44% (with comparison to similar profiles: "-1.26% lower than average")
- **Follow/Unfollow Activity Detection**: "No follow/unfollow activity"

### 2. Profile Growth Charts (CRITICAL - Missing in our tool)
- **Time Range Options**: 7 days, 1 month, 3 months, 6 months, 1 year, Max, Customised dates
- **Total Follower Growth Chart**: Line chart showing follower growth over time
- **Daily Growth Chart**: Daily followers gained/lost
- **Daily Following Chart**: Following changes over time

### 3. Weekly/Monthly Overview
- **Week Summary**: 17/12/2025 - 23/12/2025
  - Followers: +17,222 (-9,361 vs previous week)
  - Following: -8 (-9 vs previous week)
  - Posts: +9 (-8 vs previous week)
  - Average followers per day: +2,870

### 4. Reels Analysis Section
- **Avg Views**: (requires subscription)
- **View Rate**: (requires subscription)
- **Top 3 Reels by**: Views, Followers, Likes, Comments
- Recommendation to take inspiration from top performing content

### 5. Post and Interactions Overview
- **Sort Options**: By Date, Interactions, Reels views
- **Detailed Post Analysis** with:
  - Date/Time posted
  - Likes count
  - Comments count
  - Views count (for reels)
  - Format (image/video/carousel)
  - Mentions & tags
  - Hashtags used

### 6. Hashtag Analysis
- Most used hashtags
- Note: "@danmartell did not use hashtags in the captions"

### 7. Profile Data History Table (CRITICAL - Missing in our tool)
Daily tracking of:
- Date
- Followers (total)
- New followers (daily change)
- Following (total)
- New following (daily change)
- Posts (total)
- New posts (daily change)

Example data:
| Date | Followers | New followers | Following | New following | Posts | New posts |
|------|-----------|---------------|-----------|---------------|-------|-----------|
| 12/23/2025 | 2,149,547 | +645 | 575 | 0 | 3,094 | -3 |
| 12/22/2025 | 2,148,902 | +2,806 | 575 | 0 | 3,097 | +3 |
| 12/21/2025 | 2,146,096 | +3,115 | 575 | 0 | 3,094 | +2 |

## What We Need to Add to ReelSpy.ai

### Priority 1 - Profile Growth
- [ ] Follower growth chart over time (7d, 1m, 3m, 6m, 1y, max)
- [ ] Daily follower gain/loss chart
- [ ] Following changes chart
- [ ] Historical data table with daily changes

### Priority 2 - Enhanced Post Analysis
- [ ] Top posts by Likes, Comments, Views
- [ ] Post timeline with all metrics
- [ ] Post format detection (image/video/carousel)
- [ ] Mentions and tags extraction
- [ ] Posting time analysis

### Priority 3 - SEO & Content Analysis
- [ ] Caption text analysis
- [ ] Hashtag usage patterns
- [ ] Common words/phrases in captions
- [ ] Correlation between caption content and engagement

### Priority 4 - Comparison Features
- [ ] Compare engagement rate to similar profiles
- [ ] Industry benchmarks
- [ ] Growth rate comparison

## API Data Requirements
To implement these features, we need:
1. Historical follower data (daily snapshots)
2. All posts with full metadata (likes, comments, views, caption, hashtags, mentions)
3. Posting timestamps
4. Post format type
5. Reel-specific metrics (views, plays)

## Current API Limitations
Our RapidAPI Instagram Scraper provides:
- Profile info (followers, following, posts count)
- Recent posts with likes, comments
- Reels with views

Missing:
- Historical follower data (would need to track over time ourselves)
- Detailed post analytics
- View rate calculations
