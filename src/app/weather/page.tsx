import GenerativeWeatherUI from '../components/GenerativeWeatherUI';

export const metadata = {
  title: 'Weather - Generative UI',
  description: 'Weather information with Vercel AI SDK generative UI',
};

export default function WeatherPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <GenerativeWeatherUI />
    </div>
  );
} 