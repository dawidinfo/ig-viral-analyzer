import axios from 'axios';

const key = process.env.RAPIDAPI_KEY;
console.log('RAPIDAPI_KEY exists:', !!key);
console.log('Key length:', key ? key.length : 0);
console.log('Key starts with:', key ? key.substring(0, 10) + '...' : 'N/A');

try {
  const response = await axios.post(
    'https://instagram-scraper-stable-api.p.rapidapi.com/ig_get_fb_profile_v3.php',
    new URLSearchParams({ username_or_url: 'instagram' }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': 'instagram-scraper-stable-api.p.rapidapi.com',
        'x-rapidapi-key': key,
      },
      timeout: 15000,
    }
  );
  
  console.log('API Response Status:', response.status);
  console.log('API Response Data:', JSON.stringify(response.data).substring(0, 500));
  console.log('Username found:', response.data?.username);
  console.log('Followers:', response.data?.follower_count);
} catch (err) {
  console.log('API Error:', err.message);
  if (err.response) {
    console.log('Error Status:', err.response.status);
    console.log('Error Data:', JSON.stringify(err.response.data).substring(0, 500));
  }
}
