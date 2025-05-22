import handler from '../[cuisine]'; // Adjust path as needed
import { Client } from '@googlemaps/google-maps-services-js';

// Mock dependencies
jest.mock('@googlemaps/google-maps-services-js', () => {
  const mockTextSearch = jest.fn();
  return {
    Client: jest.fn(() => ({
      textSearch: mockTextSearch,
    })),
    mockTextSearch, // Export for individual test control
  };
});

// Mock process.env
const OLD_ENV = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { ...OLD_ENV, GOOGLE_PLACES_API_KEY: 'test-google-key' };
});
afterAll(() => {
  process.env = OLD_ENV;
});

describe('/api/restaurants/[cuisine]', () => {
  let req, res;

  beforeEach(() => {
    req = {
      method: 'GET',
      query: { cuisine: 'italian', city: 'Rome' },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res),
    };
    // Reset mocks for Google Maps client before each test
    Client.mockClear();
    require('@googlemaps/google-maps-services-js').mockTextSearch.mockReset();
  });

  // --- Success Test Cases ---
  it('should return 200 and restaurant data on successful API call', async () => {
    const mockResponseData = { status: 'OK', results: [{ name: 'Test Restaurant' }] };
    require('@googlemaps/google-maps-services-js').mockTextSearch.mockResolvedValue({ data: mockResponseData });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResponseData);
    expect(Client().textSearch).toHaveBeenCalledWith({
      params: {
        query: 'italian restaurants in Rome',
        key: 'test-google-key',
      },
      timeout: 5000,
    });
  });

  // --- Failure Test Cases ---
  it('should return 500 if GOOGLE_PLACES_API_KEY is missing', async () => {
    delete process.env.GOOGLE_PLACES_API_KEY; // Simulate missing API key
    // Re-import or re-evaluate handler if it captures env vars at module load time (depends on implementation)
    // For this example, we assume the handler re-checks process.env on each call.
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server configuration error: Google Places API key is missing.' });
  });

  it('should return 400 if cuisine is missing', async () => {
    req.query.cuisine = null;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required query parameters: cuisine and city.' });
  });

  it('should return 400 if city is missing', async () => {
    req.query.city = null;
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing required query parameters: cuisine and city.' });
  });

  it('should return 500 if Google Maps API returns non-OK status (e.g., ZERO_RESULTS)', async () => {
    const mockErrorResponse = { status: 'ZERO_RESULTS', error_message: 'No results found.' };
    require('@googlemaps/google-maps-services-js').mockTextSearch.mockResolvedValue({ data: mockErrorResponse });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to fetch restaurants from Google Places API. Status: ZERO_RESULTS',
      details: 'No results found.',
    });
  });
  
  it('should return 500 if Google Maps API returns non-OK status (e.g., OVER_QUERY_LIMIT)', async () => {
    const mockErrorResponse = { status: 'OVER_QUERY_LIMIT', error_message: 'You are over your quota.' };
    require('@googlemaps/google-maps-services-js').mockTextSearch.mockResolvedValue({ data: mockErrorResponse });

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Failed to fetch restaurants from Google Places API. Status: OVER_QUERY_LIMIT',
      details: 'You are over your quota.',
    }));
  });

  it('should return 500 if Google Maps client.textSearch call fails (network error, etc.)', async () => {
    require('@googlemaps/google-maps-services-js').mockTextSearch.mockRejectedValue(new Error('Network connection failed'));
    
    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    // The exact error message depends on how the catch block in the handler is structured.
    // This test assumes a generic error message for client/network failures.
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch restaurants: Client library or network error.' });
  });

  it('should handle Google API specific errors (e.g. error.response from client library)', async () => {
    const googleApiError = {
      response: {
        status: 403, // Forbidden, e.g., API key issue
        data: { error_message: "API key invalid." }
      }
    };
    require('@googlemaps/google-maps-services-js').mockTextSearch.mockRejectedValue(googleApiError);

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to fetch restaurants from Google Places API.',
      details: { error_message: "API key invalid." }
    });
  });
});
