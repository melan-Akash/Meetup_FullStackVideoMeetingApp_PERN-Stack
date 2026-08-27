import React from 'react';
import { Check, Star, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMockAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Pricing() {
  const { user, updatePlan } = useMockAuth();

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      description: 'Ideal for rapid peer-to-peer connections and team collaborations.',
      icon: Zap,
      color: 'text-blue-600 bg-blue-50',
      features: [
        'Unlimited meeting duration',
        'HD audio and video calls',
        'Real-time collaborative Whiteboard',
        'AI In-Meeting Assistant & Summary',
        'In-Chat permanent cloud file sharing'
      ]
    },
    {
      name: 'Premium',
      price: '$19',
      period: '/month',
      description: 'Built for corporate teams requiring enterprise scalability and priority support.',
      icon: Star,
      color: 'text-amber-500 bg-amber-50',
      features: [
        'All Free features included',
        'Up to 100 peers concurrently',
        'Priority OpenRouter AI summary speed',
        'Advanced Cloudinary media retention',
        '24/7 dedicated support'
      ]
    }
  ];

  const handleUpgrade = (plan) => {
    updatePlan(plan);
    toast.success(`Successfully switched to ${plan} Plan! 🚀`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 py-3 sm:py-6 px-3 sm:px-6 max-w-5xl mx-auto">
      
      {/* Back button */}
      <Link 
        to="/dashboard" 
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Simple, Transparent Pricing.
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
          Upgrade your plan dynamically to access enterprise features and higher bandwidth video conferencing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 max-w-3xl mx-auto pt-2">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isActive = user?.plan?.toLowerCase() === tier.name.toLowerCase();

          return (
            <div 
              key={tier.name}
              className={`bg-white/85 backdrop-blur-2xl rounded-3xl sm:rounded-4xl p-6 sm:p-8 flex flex-col justify-between shadow-sm border transition-all duration-200 ${
                isActive 
                  ? 'ring-2 ring-[#0055ff] border-blue-300 shadow-lg shadow-blue-500/10' 
                  : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase text-slate-700 tracking-wider">{tier.name}</span>
                  <div className={`p-2.5 rounded-2xl ${tier.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">{tier.price}</span>
                  {tier.period && <span className="text-xs text-slate-500 font-semibold ml-1">{tier.period}</span>}
                </div>

                <p className="text-xs text-slate-600 mb-6 leading-relaxed">{tier.description}</p>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleUpgrade(tier.name)}
                disabled={isActive}
                className={`w-full py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 cursor-default'
                    : 'bg-[#0055ff] hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                }`}
              >
                {isActive ? 'Current Active Plan' : `Switch to ${tier.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}