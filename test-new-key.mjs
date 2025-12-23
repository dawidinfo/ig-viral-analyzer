import axios from 'axios';

const key = '96267f1895msh0bb9134159d4674p1ea1b8jsn451f534557b3';
console.log('Testing new RAPIDAPI_KEY');
console.log('Key length:', key.length);

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
  
  console.log('✅ API Response Status:', response.status);
  console.log('Username found:', response.data?.username);
  console.log('Followers:', response.data?.follower_count);
  console.log('Full Name:', response.data?.full_name);
  console.log('\n🎉 API KEY WORKS!');
} catch (err) {
  console.log('❌ API Error:', err.message);
  if (err.response) {
    console.log('Error Status:', err.response.status);
    console.log('Error Data:', JSON.stringify(err.response.data));
  }
}
