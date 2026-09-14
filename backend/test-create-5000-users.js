const http = require('http');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhOTU5YmFjM2I1ODI1NzZiOWExMjRlMiIsInJvbGUiOiJTVVBFUl9BRE1JTiIsInVzZXJuYW1lIjoiYWRtaW4iLCJuYW1lIjoiU3VwZXIgQWRtaW4iLCJpYXQiOjE3ODg2MTc3NTgsImV4cCI6MTc4ODcwNDE1OH0.PX1EnHjEgvSELKCzA0ixKxf98Zd-Srf_-z8sOxG7IBM';
const TOTAL_USERS = 5000;
const CONCURRENCY = 20;

let completed = 0;
let errors = 0;
let active = 0;
let currentIndex = 0;

const startTime = Date.now();

function makeRequest(index) {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      username: \	estuser_\_\\,
      password: 'password123',
      name: \Test User \\,
      role: 'STUDENT',
      email: \	estuser_\_\@example.com\
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \Bearer \\,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          resolve(true);
        } else {
          console.error('Error status:', res.statusCode, body);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

async function worker() {
  while (currentIndex < TOTAL_USERS) {
    const index = currentIndex++;
    const success = await makeRequest(index);
    if (success) {
      completed++;
    } else {
      errors++;
    }
    
    if ((completed + errors) % 100 === 0) {
      console.log(\Progress: \/\ (\ errors)\);
    }
  }
}

async function runTest() {
  console.log(\Starting workload test: creating \ users with concurrency \\);
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker());
  }
  
  await Promise.all(workers);
  
  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 1000;
  
  console.log('--- Test Completed ---');
  console.log(\Total Time: \ seconds\);
  console.log(\Successfully created: \\);
  console.log(\Errors/Timeouts: \\);
  console.log(\Throughput: \ creations/sec\);
}

runTest();