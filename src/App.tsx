import { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

// Skip data interface based on API response
interface Skip {
  id: number;
  size: number;
  hire_period_days: number;
  transport_cost: number | null;
  per_tonne_cost: number | null;
  price_before_vat: number;
  vat: number;
  postcode: string;
  area: string;
  forbidden: boolean;
  created_at: string;
  updated_at: string;
  allowed_on_road: boolean;
  allows_heavy_waste: boolean;
}

export default function App() {
  const [skips, setSkips] = useState<Skip[]>([]);
  const [selectedSkip, setSelectedSkip] = useState<Skip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchSkips = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          'https://app.wewantwaste.co.uk/api/skips/by-location?postcode=NR32&area=Lowestoft',
          {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Only update state if component is still mounted
        if (mounted) {
          // Validate data structure
          if (!Array.isArray(data)) {
            throw new Error('Invalid data format received');
          }
          setSkips(data.slice(0, 6));
        }
      } catch (err) {
        if (mounted) {
          if (err instanceof Error) {
            if (err.name === 'AbortError') {
              // Don't show error for intentional aborts (component unmounting)
              console.log('Request was aborted');
            } else {
              setError(`Failed to load skips: ${err.message}`);
            }
          } else {
            setError('An unexpected error occurred');
          }
          console.error('Error fetching skips:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchSkips();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const calculateFinalPrice = (skip: Skip) => {
    return skip.price_before_vat + (skip.price_before_vat * skip.vat / 100);
  };

  // Skip SVG Component to match the original yellow skip design
  const SkipSVG = ({ size }: { size: number }) => (
    <svg viewBox="0 0 200 120" className="w-full h-full">
      <defs>
        <linearGradient id={`skipGradient${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* Skip container */}
      <path 
        d="M20 30 L180 30 L170 90 L30 90 Z" 
        fill={`url(#skipGradient${size})`} 
        stroke="#d97706" 
        strokeWidth="2"
      />
      {/* Skip front face */}
      <path 
        d="M30 90 L170 90 L160 100 L40 100 Z" 
        fill="#d97706"
      />
      {/* Skip side */}
      <path 
        d="M170 90 L160 100 L160 40 L170 30 Z" 
        fill="#b45309"
      />
      {/* Chains/hooks */}
      <circle cx="40" cy="35" r="3" fill="#6b7280" />
      <circle cx="160" cy="35" r="3" fill="#6b7280" />
      {/* WeWantWaste logo */}
      <text x="100" y="55" textAnchor="middle" fontSize="8" fill="#1e40af" fontWeight="bold">WE</text>
      <text x="100" y="65" textAnchor="middle" fontSize="8" fill="#1e40af" fontWeight="bold">WANT</text>
      <text x="100" y="75" textAnchor="middle" fontSize="8" fill="#1e40af" fontWeight="bold">WASTE</text>
    </svg>
  );

  // Skeleton loader for better UX
  const SkipSkeleton = () => (
    <div className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-700"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-10 bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load Skips</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Top Progress Bar */}
      <div className="bg-gray-800 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2 text-blue-400">
                <CheckCircle className="h-4 w-4" />
                <span>Postcode</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <CheckCircle className="h-4 w-4" />
                <span>Waste Type</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400">
                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                <span>Select Skip</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-4 h-4 rounded-full border-2 border-gray-600"></div>
                <span>Permit Check</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-4 h-4 rounded-full border-2 border-gray-600"></div>
                <span>Choose Date</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-4 h-4 rounded-full border-2 border-gray-600"></div>
                <span>Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Skip Size</h1>
          <p className="text-gray-400">Select the skip size that best suits your needs</p>
        </div>

        {/* Loading State with Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, index) => (
              <SkipSkeleton key={index} />
            ))}
          </div>
        ) : (
          /* Skip Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {skips.map((skip) => (
              <div
                key={skip.id}
                className={`relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:bg-gray-750 ${
                  selectedSkip?.id === skip.id 
                    ? 'ring-2 ring-blue-500 bg-gray-750' 
                    : ''
                }`}
                onClick={() => setSelectedSkip(skip)}
              >
                {/* Skip Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-600 to-gray-700 p-4">
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {skip.size} Yards
                  </div>
                  <div className="h-full flex items-center justify-center">
                    <div className="w-40 h-24">
                      <SkipSVG size={skip.size} />
                    </div>
                  </div>
                </div>

                {/* Skip Details */}
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{skip.size} Yard Skip</h3>
                  <div className="text-sm text-gray-400 mb-3">
                    {skip.hire_period_days} day hire period
                  </div>
                  <div className="text-2xl font-bold text-blue-400 mb-4">
                    £{Math.round(calculateFinalPrice(skip))}
                  </div>
                  <button
                    className={`w-full py-2 px-4 rounded font-semibold transition-colors ${
                      selectedSkip?.id === skip.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSkip(skip);
                    }}
                  >
                    {selectedSkip?.id === skip.id ? 'Selected' : 'Select This Skip'}
                    <ChevronRight className="h-4 w-4 ml-2 inline" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Section */}
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            {selectedSkip && (
              <div className="text-sm">
                <span className="text-gray-400">{selectedSkip.size} Yard Skip</span>
                <span className="ml-4 text-blue-400 font-bold">
                  £{Math.round(calculateFinalPrice(selectedSkip))} 
                </span>
                <span className="ml-1 text-gray-400 text-xs">7 day hire</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-6 py-2 text-gray-400 hover:text-white transition-colors">
              Back
            </button>
            <button
              disabled={!selectedSkip || loading}
              className={`px-6 py-2 rounded font-semibold transition-colors ${
                selectedSkip && !loading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-2 inline" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}