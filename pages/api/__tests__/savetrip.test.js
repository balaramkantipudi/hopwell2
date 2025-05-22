import handler from '../savetrip'; // Adjust path as needed
import { supabase } from '@/libs/supabase';

// Mock dependencies
jest.mock('@/libs/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(),
      })),
    })),
  },
}));

describe('/api/savetrip', () => {
  let req, res;

  beforeEach(() => {
    req = {
      method: 'POST',
      body: {
        tripData: { destination: 'Test Destination', origin: 'Test Origin', startDate: '2024-01-01', endDate: '2024-01-05' },
        itinerary: 'Test itinerary details',
        title: 'My Test Trip',
      },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
    supabase.auth.getSession.mockReset();
    supabase.from().insert().select.mockReset();
  });

  // --- Success Test Cases ---
  it('should return 200 on successful trip save', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-123' } } }, error: null });
    supabase.from().insert().select.mockResolvedValue({ data: [{ id: 'new-trip-id' }], error: null });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, tripId: 'new-trip-id' }));
    expect(supabase.from().insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          user_id: 'user-123',
          title: 'My Test Trip',
          destination: 'Test Destination',
          itinerary_text: 'Test itinerary details',
          preferences: req.body.tripData,
        }),
      ])
    );
  });

  // --- Failure Test Cases ---
  it('should return 405 for non-POST requests', async () => {
    req.method = 'GET';
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should return 401 for unauthenticated users', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: { message: 'Not authenticated' } });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
  });

  it('should return 400 if tripData is missing', async () => {
    req.body.tripData = null;
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-123' } } }, error: null });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required data: tripData and itinerary are required.' });
  });

  it('should return 400 if itinerary is missing', async () => {
    req.body.itinerary = null;
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-123' } } }, error: null });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required data: tripData and itinerary are required.' });
  });

  it('should return 400 if tripData.destination is missing', async () => {
    req.body.tripData.destination = null;
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-123' } } }, error: null });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required field: tripData.destination' });
  });

  it('should return 500 if Supabase insert fails', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-123' } } }, error: null });
    supabase.from().insert().select.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });
    
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to save trip' });
  });
});
