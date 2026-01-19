import { NextResponse } from 'next/server';

// Weather API integration (using Open-Meteo - free, no API key required)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') || '30.2672'; // Austin, TX default
    const lon = searchParams.get('lon') || '-97.7431';
    const location = searchParams.get('location') || 'Austin, TX';

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`
    );

    if (!response.ok) {
      throw new Error('Weather API failed');
    }

    const data = await response.json();

    const currentTemp = Math.round(data.current.temperature_2m);
    const highTemp = Math.round(data.daily.temperature_2m_max[0]);
    const lowTemp = Math.round(data.daily.temperature_2m_min[0]);
    const weatherCode = data.current.weather_code;

    // Map weather codes to conditions
    // https://open-meteo.com/en/docs (WMO Weather interpretation codes)
    let condition: 'sunny' | 'cloudy' | 'rainy' = 'sunny';
    if (weatherCode >= 61 && weatherCode <= 99) {
      condition = 'rainy';
    } else if (weatherCode >= 1 && weatherCode <= 48) {
      condition = weatherCode <= 2 ? 'sunny' : 'cloudy';
    }

    return NextResponse.json({
      weather: {
        temp: currentTemp,
        high: highTemp,
        low: lowTemp,
        condition,
        location,
      },
      source: 'open-meteo'
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({
      weather: {
        temp: 72,
        high: 78,
        low: 65,
        condition: 'sunny',
        location: 'Austin, TX'
      },
      source: 'demo',
      error: 'Failed to fetch weather'
    });
  }
}
