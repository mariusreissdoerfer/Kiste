const request = require('supertest');
jest.mock('pg');
const { Pool } = require('pg');
const app = require('../index');

describe('API endpoints', () => {
  let mClient;
  let mPool;

  beforeEach(() => {
    mClient = { query: jest.fn(), release: jest.fn() };
    mPool = { connect: jest.fn().mockResolvedValue(mClient) };
    Pool.mockImplementation(() => mPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/data returns rows', async () => {
    const rows = [{ key: 'foo', value: 'bar' }];
    mClient.query.mockResolvedValue({ rows });
    const res = await request(app).get('/api/data');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(rows);
    expect(mPool.connect).toHaveBeenCalled();
    expect(mClient.query).toHaveBeenCalledWith('SELECT * FROM data');
  });

  test('POST /api/data inserts data', async () => {
    mClient.query.mockResolvedValue({});
    const res = await request(app)
      .post('/api/data')
      .send({ key: 'foo', value: 'bar' });
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Data inserted');
    expect(mClient.query).toHaveBeenCalledWith(
      'INSERT INTO data (key, value) VALUES ($1, $2)',
      ['foo', 'bar']
    );
  });
});
