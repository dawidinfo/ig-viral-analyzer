// Test Manus Data API for Instagram
const ENV = {
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL,
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY,
};

console.log('Testing Manus Data API for Instagram...');
console.log('API URL exists:', !!ENV.forgeApiUrl);
console.log('API Key exists:', !!ENV.forgeApiKey);

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
      path_params: options.pathParams,
      multipart_form_data: options.formData,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Data API request failed (${response.status} ${response.statusText}): ${detail}`);
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

// Test verschiedene Instagram API Endpoints
const testEndpoints = [
  { name: 'Instagram/get_user_info', params: { query: { username: 'cristiano' } } },
  { name: 'Instagram/get_user_profile', params: { query: { username: 'cristiano' } } },
  { name: 'Instagram/user_info', params: { query: { username: 'cristiano' } } },
  { name: 'Instagram/profile', params: { query: { username: 'cristiano' } } },
];

for (const endpoint of testEndpoints) {
  console.log(`\n--- Testing: ${endpoint.name} ---`);
  try {
    const result = await callDataApi(endpoint.name, endpoint.params);
    console.log('✅ SUCCESS!');
    console.log('Result preview:', JSON.stringify(result).substring(0, 500));
  } catch (err) {
    console.log('❌ Failed:', err.message);
  }
}

// Test auch Posts und Reels
console.log('\n--- Testing: Instagram/get_user_posts ---');
try {
  const posts = await callDataApi('Instagram/get_user_posts', { query: { username: 'cristiano', count: '3' } });
  console.log('✅ Posts SUCCESS!');
  console.log('Result preview:', JSON.stringify(posts).substring(0, 500));
} catch (err) {
  console.log('❌ Posts Failed:', err.message);
}

console.log('\n--- Testing: Instagram/get_user_reels ---');
try {
  const reels = await callDataApi('Instagram/get_user_reels', { query: { username: 'cristiano', count: '3' } });
  console.log('✅ Reels SUCCESS!');
  console.log('Result preview:', JSON.stringify(reels).substring(0, 500));
} catch (err) {
  console.log('❌ Reels Failed:', err.message);
}
