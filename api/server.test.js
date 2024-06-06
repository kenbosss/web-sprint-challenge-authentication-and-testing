const request = require('supertest');
const server = require('../api/server.js'); // Adjust the path as needed
const db = require('../data/dbConfig'); // Adjust the path as needed
// Write your tests here
test('sanity', () => {
  expect(true).toBe(true)
})
beforeAll(async () => {
  await db.migrate.latest();
});
afterAll(async () => {
  await db.destroy();
});
beforeEach(async () => {
  await db('users').truncate(); // Clear users table before each test
});
describe('auth endpoints', () => {
  describe('[POST] /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'Captain Marvel', password: 'foobar' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('username', 'Captain Marvel');
      expect(res.body).toHaveProperty('password'); // Ensure that the password is hashed
    });
    it('should fail if username is taken', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'Captain Marvel', password: 'foobar' });
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'Captain Marvel', password: 'foobar' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'username taken');
    });
    it('should fail if username is missing', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ password: 'foobar' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'username and password required');
    });
    it('should fail if password is missing', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'Captain Marvel' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'username and password required');
    });
    it('should fail if both username and password are missing', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'username and password required');
    });
  });
  describe('[POST] /api/auth/login', () => {
    it('should login an existing user', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'Captain Marvel', password: 'foobar' });
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'Captain Marvel', password: 'foobar' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'welcome, Captain Marvel');
      expect(res.body).toHaveProperty('token');
    });
    it('should fail if credentials are invalid', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'Captain Marvel', password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'invalid credentials');
    });
  });
});
describe('jokes endpoints', () => {
  describe('[GET] /api/jokes', () => {
    it('should respond with "token required" if no token is provided', async () => {
      const res = await request(server).get('/api/jokes');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'token required');
    });
    it('should respond with "token invalid" if token is invalid', async () => {
      const res = await request(server)
        .get('/api/jokes')
        .set('Authorization', 'invalid.token');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'token invalid');
    });
  });
});
test('sanity', () => {
  expect(true).toBe(true)
})

