const users = new Map(); // Global shared users
let userIdCounter = 1;

const meetings = []; // For future shared meetings if needed
let meetingIdCounter = 1;

// Pre-populate demo user
console.log('mockData init - users size:', users.size);
if (users.size === 0) {
  const demoUser = {
    _id: 'mock_1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'demo',
  };
  users.set(demoUser.email, demoUser);
  console.log('✅ Global mockData: Demo user created - demo@example.com / demo');
}

export { users, userIdCounter, meetings, meetingIdCounter };
