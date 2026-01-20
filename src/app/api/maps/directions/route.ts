import { NextResponse } from 'next/server';

/**
 * Google Maps Directions API
 * Returns route information including traffic-aware travel times
 */
export async function POST(request: Request) {
  try {
    const { origin, destination, departureTime } = await request.json();

    // Validate inputs
    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // If no API key, return estimated time (fallback)
    if (!apiKey) {
      console.warn('GOOGLE_MAPS_API_KEY not configured, using estimated travel time');
      return NextResponse.json({
        distance: '~10 miles',
        duration: '~20 mins',
        durationInTraffic: '~25 mins',
        steps: [],
        polyline: '',
        start: origin,
        end: destination,
        isEstimate: true,
      });
    }

    // Build API URL
    const params = new URLSearchParams({
      origin,
      destination,
      key: apiKey,
      mode: 'driving',
      departure_time: departureTime
        ? Math.floor(new Date(departureTime).getTime() / 1000).toString()
        : 'now',
      traffic_model: 'best_guess',
    });

    const url = `https://maps.googleapis.com/maps/api/directions/json?${params}`;

    // Call Google Maps Directions API
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('Maps API error:', data.status, data.error_message);
      return NextResponse.json(
        { error: data.error_message || 'Failed to get directions' },
        { status: 400 }
      );
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // Transform to our format
    return NextResponse.json({
      distance: leg.distance.text,
      duration: leg.duration.text,
      durationInTraffic: leg.duration_in_traffic?.text || leg.duration.text,
      steps: leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Strip HTML tags
        distance: step.distance.text,
        duration: step.duration.text,
      })),
      polyline: route.overview_polyline.points,
      start: leg.start_address,
      end: leg.end_address,
      isEstimate: false,
    });
  } catch (error) {
    console.error('Directions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
