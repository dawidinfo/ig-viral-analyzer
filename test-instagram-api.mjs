/**
 * Test script for Instagram Statistics API
 * Tests the API with @dawidprzybylski_official to verify data accuracy
 */

import axios from 'axios';

const API_HOST = 'instagram-statistics-api.p.rapidapi.com';
const API_KEY = process.env.INSTAGRAM_STATISTICS_API_KEY;
const TEST_USERNAME = 'dawidprzybylski_official';

async function testProfileEndpoint() {
  console.log('\n=== Testing Profile Endpoint ===');
  const profileUrl = `https://www.instagram.com/${TEST_USERNAME}/`;
  
  try {
    const response = await axios.get(
      `https://${API_HOST}/community`,
      {
        params: { url: profileUrl },
        headers: {
          'x-rapidapi-host': API_HOST,
          'x-rapidapi-key': API_KEY,
        },
        timeout: 15000,
      }
    );
    
    console.log('Profile Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Extract CID
    const cid = response.data?.data?.cid || response.data?.cid;
    console.log('\nExtracted CID:', cid);
    
    return cid;
  } catch (error) {
    console.error('Profile Error:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

async function testRetrospectiveEndpoint(cid) {
  console.log('\n=== Testing Retrospective Endpoint ===');
  
  if (!cid) {
    console.log('No CID available, skipping retrospective test');
    return;
  }
  
  // Calculate date range (last 30 days)
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);
  
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  
  console.log(`Date range: ${formatDate(fromDate)} to ${formatDate(toDate)}`);
  
  try {
    const response = await axios.get(
      `https://${API_HOST}/statistics/retrospective`,
      {
        params: {
          cid: cid,
          from: formatDate(fromDate),
          to: formatDate(toDate),
        },
        headers: {
          'x-rapidapi-host': API_HOST,
          'x-rapidapi-key': API_KEY,
        },
        timeout: 20000,
      }
    );
    
    console.log('Retrospective Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Analyze the data
    const series = response.data?.data?.series?.current || [];
    if (series.length > 0) {
      console.log('\n=== Data Analysis ===');
      console.log('Number of data points:', series.length);
      
      const firstPoint = series[0];
      const lastPoint = series[series.length - 1];
      
      console.log('First data point:', firstPoint?.date, '- Followers:', firstPoint?.usersCount);
      console.log('Last data point:', lastPoint?.date, '- Followers:', lastPoint?.usersCount);
      
      const totalChange = (lastPoint?.usersCount || 0) - (firstPoint?.usersCount || 0);
      console.log('Total follower change:', totalChange);
      console.log('Trend:', totalChange > 0 ? 'GROWING' : totalChange < 0 ? 'DECLINING' : 'STABLE');
    }
    
  } catch (error) {
    console.error('Retrospective Error:', error.response?.status, error.message);
    if (error.response?.data) {
      console.error('Error Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function main() {
  console.log('=== Instagram Statistics API Test ===');
  console.log('Testing with username:', TEST_USERNAME);
  console.log('API Key configured:', API_KEY ? 'YES (length: ' + API_KEY.length + ')' : 'NO');
  
  if (!API_KEY) {
    console.error('ERROR: INSTAGRAM_STATISTICS_API_KEY not set!');
    process.exit(1);
  }
  
  const cid = await testProfileEndpoint();
  await testRetrospectiveEndpoint(cid);
  
  console.log('\n=== Test Complete ===');
}

main().catch(console.error);
