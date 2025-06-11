import { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle, AlertCircle, Truck, Clock, MapPin, Shield, Star, ArrowLeft } from 'lucide-react';

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
        
        if (mounted) {
          if (!Array.isArray(data)) {
            throw new Error('Invalid data format received');
          }
          setSkips(data.slice(0, 6));
        }
      } catch (err) {
        if (mounted) {
          if (err instanceof Error) {
            if (err.name === 'AbortError') {
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

  const getSkipDescription = (size: number) => {
    const descriptions = {
      4: "Perfect for small home projects and garden clearance",
      6: "Ideal for medium renovations and bathroom refits", 
      8: "Great for kitchen renovations and large clearouts",
      10: "Perfect for full room clearouts and extensions",
      12: "Ideal for major home renovations and construction",
      14: "Perfect for large construction and commercial projects"
    };
    return descriptions[size as keyof typeof descriptions] || "Suitable for various waste disposal needs";
  };

  const SkipIcon = ({ size, isSelected }: { size: number; isSelected: boolean }) => (
    <div className={`relative w-16 h-12 transition-all duration-300 ${isSelected ? 'scale-110' : ''}`}>
      <svg viewBox="0 0 80 48" className="w-full h-full">
        <defs>
          <linearGradient id={`gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isSelected ? "#3b82f6" : "#10b981"} />
            <stop offset="100%" stopColor={isSelected ? "#1d4ed8" : "#059669"} />
          </linearGradient>
        </defs>
        <path 
          d="M8 12 L72 12 L68 36 L12 36 Z" 
          fill={`url(#gradient-${size})`} 
          stroke={isSelected ? "#1e40af" : "#047857"}
          strokeWidth="1.5"
        />
        <path 
          d="M12 36 L68 36 L64 40 L16 40 Z" 
          fill={isSelected ? "#1e40af" : "#047857"}
        />
        <path 
          d="M68 36 L64 40 L64 16 L68 12 Z" 
          fill={isSelected ? "#1e3a8a" : "#065f46"}
        />
        <circle cx="16" cy="14" r="1.5" fill="#6b7280" />
        <circle cx="64" cy="14" r="1.5" fill="#6b7280" />
      </svg>
    </div>
  );

  const ProgressStep = ({ step, currentStep, label, icon: Icon }: { 
    step: number; 
    currentStep: number; 
    label: string; 
    icon: any;
  }) => (
    <div className="flex flex-col items-center space-y-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
        step < currentStep 
          ? 'bg-green-500 text-white' 
          : step === currentStep 
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
            : 'bg-gray-700 text-gray-400'
      }`}>
        {step < currentStep ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>
      <span className={`text-xs font-medium transition-colors duration-300 ${
        step <= currentStep ? 'text-white' : 'text-gray-500'
      }`}>
        {label}
      </span>
    </div>
  );

  const SkipCard = ({ skip }: { skip: Skip }) => {
    const isSelected = selectedSkip?.id === skip.id;
    const finalPrice = Math.round(calculateFinalPrice(skip));
    
    return (
      <div
        className={`group relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
          isSelected ? 'ring-4 ring-blue-500 shadow-2xl shadow-blue-500/20 -translate-y-1' : ''
        }`}
        onClick={() => setSelectedSkip(skip)}
      >
        {/* Premium Badge */}
        {skip.size >= 10 && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 z-10">
            <Star className="w-3 h-3" />
            <span>POPULAR</span>
          </div>
        )}
        
        {/* Header */}
        <div className={`relative h-32 flex items-center justify-center transition-all duration-300 ${
          isSelected 
            ? 'bg-gradient-to-br from-blue-50 to-indigo-100' 
            : 'bg-gradient-to-br from-gray-50 to-green-50'
        }`}>
          <div className="text-center">
            <SkipIcon size={skip.size} isSelected={isSelected} />
            <div className={`mt-2 px-4 py-1 rounded-full text-sm font-bold ${
              isSelected 
                ? 'bg-blue-500 text-white' 
                : 'bg-green-500 text-white'
            }`}>
              {skip.size} Yards
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {skip.size} Yard Skip
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 leading-relaxed">
            {getSkipDescription(skip.size)}
          </p>

          {/* Features */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-green-500" />
              <span>{skip.hire_period_days} day hire period</span>
            </div>
            {skip.allowed_on_road && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="w-4 h-4 text-blue-500" />
                <span>Road placement allowed</span>
              </div>
            )}
            {skip.allows_heavy_waste && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-orange-500" />
                <span>Heavy waste accepted</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-900">£{finalPrice}</span>
              <span className="text-sm text-gray-500">inc. VAT</span>
            </div>
          </div>

          {/* Button */}
          <button
            className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
              isSelected
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 group-hover:bg-green-500 group-hover:text-white'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSkip(skip);
            }}
          >
            <span>{isSelected ? 'Selected' : 'Select Skip'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-colors font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">REMWaste</h1>
                  <p className="text-sm text-gray-500">Professional Waste Solutions</p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Lowestoft, NR32</span>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="py-6">
            <div className="flex justify-between items-center max-w-2xl mx-auto">
              <ProgressStep step={1} currentStep={3} label="Location" icon={MapPin} />
              <div className="flex-1 h-0.5 bg-green-500 mx-4"></div>
              <ProgressStep step={2} currentStep={3} label="Waste Type" icon={Shield} />
              <div className="flex-1 h-0.5 bg-blue-500 mx-4"></div>
              <ProgressStep step={3} currentStep={3} label="Skip Size" icon={Truck} />
              <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
              <ProgressStep step={4} currentStep={3} label="Schedule" icon={Clock} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Skip Size
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From small garden clearances to major renovations, we have the right skip for your project
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Skip Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {skips.map((skip) => (
              <SkipCard key={skip.id} skip={skip} />
            ))}
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="sticky bottom-0 bg-white border border-gray-200 rounded-2xl shadow-xl p-6 mx-4 md:mx-0">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Selection Summary */}
            <div className="flex items-center space-x-4">
              {selectedSkip ? (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8">
                    <SkipIcon size={selectedSkip.size} isSelected={true} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedSkip.size} Yard Skip Selected
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedSkip.hire_period_days} day hire • £{Math.round(calculateFinalPrice(selectedSkip))} inc. VAT
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Select a skip size to continue</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                disabled={!selectedSkip || loading}
                className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedSkip && !loading
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Continue to Booking</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}