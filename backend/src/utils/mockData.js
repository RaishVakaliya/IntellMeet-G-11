const users = new Map(); // Global shared users
let userIdCounter = 1;

const meetings = []; // For future shared meetings if needed
let meetingIdCounter = 1;

// Pre-populate demo user
console.log('mockData init - users size:', users.size);
console.log('✅ Global mockData: No pre-populated users - only real signups allowed');


export const getNextUserId = () => `mock_${userIdCounter++}`;

export { users, userIdCounter, meetings, meetingIdCounter };
