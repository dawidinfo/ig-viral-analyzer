# Instagram API Research

## Ausgewählte API: Instagram Scraper Stable API (RapidAPI)

**URL:** https://rapidapi.com/thetechguy32744/api/instagram-scraper-stable-api

### Preise:
- BASIC: $0.00/mo (Free Tier)
- PRO: $28.99/mo
- ULTRA: $59.99/mo
- MEGA: $209.99/mo

### Verfügbare Endpoints:

#### User Data:
- `POST Account Data V2` - Vollständige Profildaten
- `GET Basic User + Posts` - Basis-Profil mit Posts
- `GET User About` - Über den User
- `POST User Posts` - User Posts
- `POST User Reels` - User Reels
- `POST User Stories` - User Stories
- `POST Followers List` - Follower-Liste
- `POST Following List` - Following-Liste

#### Response-Felder (Account Data V2):
- full_name
- biography_with_entities
- follower_count
- following_count
- media_count
- profile_pic_url
- is_verified
- is_business_account
- account_type
- has_ig_profile
- fbid_v2

### API Integration:
```bash
curl --request POST \
  --url https://instagram-scraper-stable-api.p.rapidapi.com/ig_get_fb_profile_v3.php \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --header 'x-rapidapi-host: instagram-scraper-stable-api.p.rapidapi.com' \
  --header 'x-rapidapi-key: YOUR_API_KEY' \
  --data 'username=cristiano'
```

### Wichtige Hinweise:
- Real-Time Data (kein Caching)
- 100% Service Level
- ~4062ms Latency
- Benötigt RapidAPI Key
