# Instagram Scraper 2025 API

## Host
`instagram-scraper-20251.p.rapidapi.com`

## Endpoints

### User Info
- **GET** `/userinfo/`
- **Params**: `username_or_id` (required)
- **Optional**: `include_about`, `url_embed_safe`

### User Posts
- **GET** `/userposts/`
- **Params**: `username_or_id` (required)

### User Reels
- **GET** `/userreels/`
- **Params**: `username_or_id` (required)

### User Followers
- **GET** `/userfollowers/`
- **Params**: `username_or_id` (required)

### User Following
- **GET** `/userfollowing/`
- **Params**: `username_or_id` (required)

### User Stories
- **GET** `/userstories/`
- **Params**: `username_or_id` (required)

## Example Request
```bash
curl --request GET \
  --url 'https://instagram-scraper-20251.p.rapidapi.com/userinfo/?username_or_id=instagram' \
  --header 'x-rapidapi-host: instagram-scraper-20251.p.rapidapi.com' \
  --header 'x-rapidapi-key: YOUR_KEY'
```

## Notes
- This is a different API from the previous one
- Uses GET requests instead of POST
- Different endpoint structure
