import handler from '../generate'; // Adjust path as needed
import { supabase } from '@/libs/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock dependencies
jest.mock('@/libs/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(),
        })),
      })),
    })),
  },
}));

jest.mock('@google/generative-ai', () => {
  const mockGenerateContent = jest.fn();
  const mockGetGenerativeModel = jest.fn(() => ({
    generateContent: mockGenerateContent,
  }));
  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
    mockGenerateContent, // Export for individual test control
  };
});

// Mock process.env
const OLD_ENV = process.env;
beforeEach(() => {
  jest.resetModules(); // Most important - it clears the cache
  process.env = { ...OLD_ENV, GEMINI_API_KEY: 'test-gemini-key' }; // Ensure API key is set
});
afterAll(() => {
  process.env = OLD_ENV; // Restore old environment
});


describe('/api/itinerary/generate', () => {
  let req, res;

  beforeEach(() => {
    req = {
      method: 'POST',
      body: { tripId: 'test-trip-id' },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
      setHeader: jest.fn(), // For methods other than POST if any are tested
      end: jest.fn(), // For methods other than POST if any are tested
    };
    // Reset mocks for supabase and generative-ai before each test
    supabase.auth.getSession.mockReset();
    supabase.from().select().eq().single.mockReset();
    supabase.from().update().eq().select.mockReset();
    GoogleGenerativeAI.mockClear();
    require('@google/generative-ai').mockGenerateContent.mockReset();


  });

  // --- Success Test Cases ---
  it('should return 200 on successful itinerary generation', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-123' } } }, error: null });
    supabase.from().select().eq().single.mockResolvedValue({ 
      data: { id: 'test-trip-id', destination: 'Paris', startDate: '2024-01-01', endDate: '2024-01-05' /* other fields */ }, 
      error: null 
    });
    require('@google/generative-ai').mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify({ itinerary: [], accommodations: [], transportation: [], totalCost: 1000 }) },
    });
    supabase.from().update().eq().select.mockResolvedValue({ data: [{ id: 'test-trip-id', status: 'generated' }], error: null });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, trip: expect.any(Object) }));
  });

  it('should return 200 when Gemini API fails but local fallback succeeds', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-123' } } }, error: null });
    supabase.from().select().eq().single.mockResolvedValue({ 
      data: { id: 'test-trip-id', destination: 'London', startDate: '2024-02-01', endDate: '2024-02-05' }, 
      error: null 
    });
    // Simulate Gemini API failure
    require('@google/generative-ai').mockGenerateContent.mockRejectedValue(new Error('Gemini API failed'));
    supabase.from().update().eq().select.mockResolvedValue({ data: [{ id: 'test-trip-id', status: 'generated' }], error: null });
    
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, trip: expect.any(Object) }));
    // Optionally, check if the itineraryData matches the local fallback structure
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

  it('should return 400 if tripId is missing', async () => {
    req.body.tripId = null;
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-123' } } }, error: null });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Trip ID is required' });
  });

  it('should return 404 if trip is not found in Supabase', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-123' } } }, error: null });
    supabase.from().select().eq().single.mockResolvedValue({ data: null, error: { message: 'Trip not found' } });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Trip not found' });
  });

  it('should return 400 if trip destination is missing', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-123' } } }, error: null });
    supabase.from().select().eq().single.mockResolvedValue({ 
      data: { id: 'test-trip-id', destination: null, startDate: '2024-01-01', endDate: '2024-01-05' }, 
      error: null 
    });
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Trip destination is missing, cannot generate itinerary' });
  });
  
  it('should return 500 if Gemini API response is unparseable JSON', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-123' } } }, error: null });
    supabase.from().select().eq().single.mockResolvedValue({ 
      data: { id: 'test-trip-id', destination: 'Berlin', startDate: '2024-03-01', endDate: '2024-03-05' }, 
      error: null 
    });
    require('@google/generative-ai').mockGenerateContent.mockResolvedValue({
      response: { text: () => 'This is not JSON' }, // Unparseable
    });
    // No need to mock Supabase update as it should fail before that

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to parse AI response.' });
  });

  it('should return 500 if Supabase trip update fails', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'user-123' } } }, error: null });
    supabase.from().select().eq().single.mockResolvedValue({ 
      data: { id: 'test-trip-id', destination: 'Madrid', startDate: '2024-04-01', endDate: '2024-04-05' }, 
      error: null 
    });
    require('@google/generative-ai').mockGenerateContent.mockResolvedValue({
      response: { text: () => JSON.stringify({ itinerary: [], accommodations: [], transportation: [], totalCost: 1200 }) },
    });
    supabase.from().update().eq().select.mockResolvedValue({ data: null, error: { message: 'Update failed' } });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update trip' });
  });
});
