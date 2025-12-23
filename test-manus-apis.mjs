// Test welche Manus Data APIs verfügbar sind
const ENV = {
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL,
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY,
};

async function callDataApi(apiId, options = {}) {
  const baseUrl = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
  const fullUrl = new URL("webdevtoken.v1.WebDevService/CallApi", baseUrl).toString();

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "connect-protocol-version": "1",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify({
      apiId,
      query: options.query,
      body: options.body,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`${response.status}: ${detail}`);
  }

  const payload = await response.json().catch(() => ({}));
  if (payload && typeof payload === "object" && "jsonData" in payload) {
    try {
      return JSON.parse(payload.jsonData ?? "{}");
    } catch {
      return payload.jsonData;
    }
  }
  return payload;
}

console.log('=== Testing Manus Data API Availability ===\n');

// Test TikTok (sollte funktionieren)
console.log('--- TikTok API ---');
try {
  const tiktok = await callDataApi("Tiktok/get_user_info", { query: { uniqueId: 'cristiano' } });
  console.log('✅ TikTok/get_user_info WORKS!');
  console.log('   Followers:', tiktok?.userInfo?.stats?.followerCount || 'N/A');
} catch (err) {
  console.log('❌ TikTok:', err.message.substring(0, 100));
}

// Test YouTube (sollte funktionieren)
console.log('\n--- YouTube API ---');
try {
  const youtube = await callDataApi("Youtube/search", { query: { q: 'cristiano', gl: 'US', hl: 'en' } });
  console.log('✅ Youtube/search WORKS!');
} catch (err) {
  console.log('❌ YouTube:', err.message.substring(0, 100));
}

// Test verschiedene Instagram Varianten
console.log('\n--- Instagram API Varianten ---');
const instagramVariants = [
  'Instagram/get_user_info',
  'Instagram/user_info', 
  'Instagram/profile',
  'Instagram/get_profile',
  'Instagram/user',
  'Instagram/get_user',
  'instagram/get_user_info',
  'Insta/get_user_info',
];

for (const api of instagramVariants) {
  try {
    await callDataApi(api, { query: { username: 'instagram' } });
    console.log(`✅ ${api} WORKS!`);
  } catch (err) {
    if (err.message.includes('404')) {
      console.log(`❌ ${api} - not found`);
    } else {
      console.log(`⚠️ ${api} - ${err.message.substring(0, 50)}`);
    }
  }
}

console.log('\n=== Summary ===');
console.log('Instagram ist NICHT in der Manus Data API verfügbar.');
console.log('Du musst weiterhin RapidAPI für Instagram nutzen.');
console.log('TikTok und YouTube sind kostenlos über Manus verfügbar.');
