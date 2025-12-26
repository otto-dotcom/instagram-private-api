/**
 * Example test script for Instagram DM automation
 *
 * Usage:
 * 1. Copy this file: cp test-dm.example.js test-dm.js
 * 2. Edit test-dm.js with your credentials
 * 3. Run: node test-dm.js
 */

const SERVER_URL = 'http://localhost:3000';
const API_KEY = 'my-secret-key-123';

// Test data
const testData = {
  username: 'YOUR_INSTAGRAM_USERNAME',
  password: 'YOUR_INSTAGRAM_PASSWORD',
  recipient: 'TARGET_USERNAME',
  message: 'Hey! This is a test message from my automation system. 🤖'
};

async function testHealthCheck() {
  console.log('\n🏥 Testing health check...');
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    const data = await response.json();
    console.log('✅ Health check passed:', data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testSendDM() {
  console.log('\n📤 Testing DM send...');
  try {
    const response = await fetch(`${SERVER_URL}/api/send-dm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ DM sent successfully!');
      console.log('   Recipient:', data.data.recipient);
      console.log('   Thread ID:', data.data.threadId);
      console.log('   Session ID:', data.data.sessionId);
      console.log('\n💡 Save this sessionId for faster subsequent requests!');
      return data.data.sessionId;
    } else {
      console.error('❌ DM failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

async function testWithSession(sessionId) {
  console.log('\n♻️  Testing with existing session...');
  try {
    const response = await fetch(`${SERVER_URL}/api/send-dm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({
        ...testData,
        sessionId,
        message: 'This message is using a cached session! ⚡'
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Session reuse successful! Much faster!');
      return true;
    } else {
      console.error('❌ Session reuse failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

async function testBulkDM() {
  console.log('\n📮 Testing bulk DM send...');
  try {
    const bulkData = {
      username: testData.username,
      password: testData.password,
      recipients: [
        {
          username: 'recipient1',
          message: 'Personalized message for recipient 1'
        },
        {
          username: 'recipient2',
          message: 'Personalized message for recipient 2'
        }
      ],
      delayMs: 3000
    };

    const response = await fetch(`${SERVER_URL}/api/send-bulk-dm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(bulkData)
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Bulk DM test completed!');
      console.log(`   Total: ${data.data.total}`);
      console.log(`   Successful: ${data.data.successful}`);
      console.log(`   Failed: ${data.data.failed}`);
      return true;
    } else {
      console.error('❌ Bulk DM failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Instagram DM Automation - Test Suite');
  console.log('=========================================');

  // Check if credentials are set
  if (testData.username === 'YOUR_INSTAGRAM_USERNAME') {
    console.error('\n❌ Please edit this file and add your Instagram credentials first!');
    console.log('   1. Copy this file: cp test-dm.example.js test-dm.js');
    console.log('   2. Edit test-dm.js with your credentials');
    console.log('   3. Run: node test-dm.js');
    return;
  }

  // Test 1: Health check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.error('\n⚠️  Server is not running! Start it with: npm start');
    return;
  }

  // Test 2: Send DM (creates session)
  const sessionId = await testSendDM();
  if (!sessionId) {
    console.error('\n⚠️  DM send failed. Check your credentials and server logs.');
    return;
  }

  // Test 3: Reuse session (faster)
  await new Promise(resolve => setTimeout(resolve, 2000));
  await testWithSession(sessionId);

  // Optional: Test bulk DM (uncomment to test)
  // console.log('\n⏳ Waiting 5 seconds before bulk test...');
  // await new Promise(resolve => setTimeout(resolve, 5000));
  // await testBulkDM();

  console.log('\n✅ All tests completed!');
  console.log('\n📚 Next steps:');
  console.log('   - Integrate with n8n using the examples in README.md');
  console.log('   - Set up your AI agent for message personalization');
  console.log('   - Connect your data source (Airtable/Supabase/etc.)');
}

// Run tests
runTests().catch(console.error);
