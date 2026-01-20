'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  Mail,
  Wallet,
  Heart,
  Users,
  ArrowRight,
  Check,
  ChevronRight,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  provider: 'google' | 'plaid' | 'healthkit' | 'manual';
  comingSoon?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SERVICES: ServiceOption[] = [
  {
    id: 'calendar',
    name: 'Calendar',
    description: 'See your day at a glance with meeting links and prep time',
    icon: <Calendar className="w-6 h-6" />,
    color: 'bg-blue-500',
    provider: 'google',
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Surface priority emails and people waiting on you',
    icon: <Mail className="w-6 h-6" />,
    color: 'bg-red-500',
    provider: 'google',
  },
  {
    id: 'banking',
    name: 'Banking',
    description: 'Track spending, upcoming bills, and financial health',
    icon: <Wallet className="w-6 h-6" />,
    color: 'bg-emerald-500',
    provider: 'plaid',
  },
  {
    id: 'health',
    name: 'Health',
    description: 'Monitor sleep, energy, and detect burnout patterns',
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-pink-500',
    provider: 'healthkit',
    comingSoon: true,
  },
  {
    id: 'relationships',
    name: 'Relationships',
    description: 'Never let important relationships drift',
    icon: <Users className="w-6 h-6" />,
    color: 'bg-purple-500',
    provider: 'manual',
  },
];

// ============================================================================
// COMPONENTS
// ============================================================================

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center max-w-lg mx-auto px-6"
    >
      {/* Logo/Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center shadow-xl"
      >
        <Sparkles className="w-10 h-10 text-amber-400" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-semibold text-stone-900 mb-4"
      >
        Welcome to Daily Pulse
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-stone-600 mb-8"
      >
        Your personal command center for life.
        <br />
        See what matters, when it matters.
      </motion.p>

      {/* Features preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center gap-3 mb-10"
      >
        {['🗓️', '📧', '💰', '❤️', '👥'].map((emoji, i) => (
          <motion.span
            key={emoji}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="w-12 h-12 flex items-center justify-center text-2xl bg-stone-100 rounded-xl"
          >
            {emoji}
          </motion.span>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={onNext}
        className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition shadow-lg"
      >
        Get Started
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-4 text-sm text-stone-400"
      >
        Takes about 2 minutes
      </motion.p>
    </motion.div>
  );
}

function ServiceCard({
  service,
  selected,
  onSelect,
  index,
}: {
  service: ServiceOption;
  selected: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onSelect}
      disabled={service.comingSoon}
      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
        selected
          ? 'border-stone-900 bg-stone-50'
          : service.comingSoon
            ? 'border-stone-200 bg-stone-50 opacity-60 cursor-not-allowed'
            : 'border-stone-200 hover:border-stone-300 bg-white'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl ${service.color} text-white flex items-center justify-center flex-shrink-0`}
        >
          {service.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-stone-900">{service.name}</h3>
            {service.comingSoon && (
              <span className="text-xs bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full">
                Coming soon
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500 mt-1">{service.description}</p>
        </div>
        <div
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
            selected ? 'border-stone-900 bg-stone-900' : 'border-stone-300'
          }`}
        >
          {selected && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
    </motion.button>
  );
}

function SelectServicesStep({
  onNext,
  onSkip,
}: {
  onNext: (services: string[]) => void;
  onSkip: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleService = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-lg mx-auto px-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-stone-900 mb-2">Connect your life</h2>
        <p className="text-stone-500">
          Select what you want to track. You can always add more later.
        </p>
      </div>

      {/* Service options */}
      <div className="space-y-3 mb-8">
        {SERVICES.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            selected={selected.includes(service.id)}
            onSelect={() => !service.comingSoon && toggleService(service.id)}
            index={index}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => onNext(selected)}
          disabled={selected.length === 0}
          className={`w-full py-4 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
            selected.length > 0
              ? 'bg-stone-900 text-white hover:bg-stone-800'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          Connect {selected.length > 0 && `(${selected.length})`}
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={onSkip}
          className="w-full py-3 text-stone-500 hover:text-stone-700 transition text-sm"
        >
          Skip for now — use demo data
        </button>
      </div>

      {/* Privacy note */}
      <p className="text-center text-xs text-stone-400 mt-6">
        🔒 Your data stays on your device. We never store it on our servers.
      </p>
    </motion.div>
  );
}

function ConnectingStep({
  services,
  onComplete,
}: {
  services: string[];
  onComplete: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [_connected, setConnected] = useState<string[]>([]);

  const currentService = SERVICES.find((s) => s.id === services[currentIndex]);

  useEffect(() => {
    // Simulate connection process
    // In production, this would initiate the actual OAuth flow
    const timer = setTimeout(() => {
      if (currentIndex < services.length) {
        setConnected((prev) => [...prev, services[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
      } else {
        onComplete();
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentIndex, services, onComplete]);

  if (currentIndex >= services.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg mx-auto px-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="w-20 h-20 mx-auto mb-8 rounded-full bg-emerald-100 flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-emerald-600" />
        </motion.div>
        <h2 className="text-2xl font-semibold text-stone-900 mb-2">All connected!</h2>
        <p className="text-stone-500 mb-8">Your Daily Pulse is ready.</p>
        <button
          onClick={onComplete}
          className="inline-flex items-center gap-2 px-8 py-4 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition"
        >
          View your dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center max-w-lg mx-auto px-6"
    >
      {/* Progress */}
      <div className="flex justify-center gap-2 mb-8">
        {services.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i < currentIndex
                ? 'bg-emerald-500'
                : i === currentIndex
                  ? 'bg-stone-900'
                  : 'bg-stone-200'
            }`}
          />
        ))}
      </div>

      {/* Current service */}
      {currentService && (
        <motion.div
          key={currentService.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div
            className={`w-16 h-16 mx-auto mb-6 rounded-xl ${currentService.color} text-white flex items-center justify-center`}
          >
            {currentService.icon}
          </div>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">
            Connecting {currentService.name}...
          </h2>
          <p className="text-stone-500">{currentService.description}</p>

          {/* Loading spinner */}
          <div className="mt-8">
            <div className="w-8 h-8 mx-auto border-3 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type OnboardingStep = 'welcome' | 'select' | 'connecting' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const handleSelectServices = (services: string[]) => {
    setSelectedServices(services);
    setStep('connecting');
  };

  const handleSkip = () => {
    // Mark onboarding as complete with demo mode
    localStorage.setItem('daily_pulse_onboarding', 'completed');
    localStorage.setItem('daily_pulse_demo_mode', 'true');
    router.push('/');
  };

  const handleComplete = () => {
    localStorage.setItem('daily_pulse_onboarding', 'completed');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-stone-50 flex items-center justify-center py-12">
      <AnimatePresence mode="wait">
        {step === 'welcome' && <WelcomeStep key="welcome" onNext={() => setStep('select')} />}
        {step === 'select' && (
          <SelectServicesStep key="select" onNext={handleSelectServices} onSkip={handleSkip} />
        )}
        {step === 'connecting' && (
          <ConnectingStep
            key="connecting"
            services={selectedServices}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
