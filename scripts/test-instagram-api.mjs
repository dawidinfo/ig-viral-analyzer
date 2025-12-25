import axios from 'axios';

async function testApi() {
  const apiKey = process.env.INSTAGRAM_STATISTICS_API_KEY;
  
  if (!apiKey) {
    console.log('❌ API Key nicht gefunden in Umgebungsvariablen');
    return;
  }
  
  console.log('🔑 API Key gefunden (erste 10 Zeichen):', apiKey.substring(0, 10) + '...');
  
  try {
    const response = await axios.get('https://instagram-statistics-api.p.rapidapi.com/community', {
      params: { url: 'https://www.instagram.com/cristiano/' },
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'instagram-statistics-api.p.rapidapi.com'
      }
    });
    
    console.log('✅ API funktioniert!');
    console.log('📊 Response Status:', response.status);
    console.log('👤 Username:', response.data?.data?.username || 'N/A');
    console.log('👥 Followers:', response.data?.data?.followers?.toLocaleString() || 'N/A');
    console.log('\n🎉 Pro Plan ist aktiv und funktioniert!');
  } catch (error) {
    console.log('❌ API Fehler:', error.response?.status);
    console.log('📝 Message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 429) {
      console.log('\n⚠️  Quota überschritten - Pro Plan noch nicht aktiv oder Limit erreicht');
    } else if (error.response?.status === 403) {
      console.log('\n⚠️  Zugriff verweigert - API Key ungültig oder nicht berechtigt');
    }
  }
}

testApi();
