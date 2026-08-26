import React from 'react';
import { Check, Star, Zap } from 'lucide-react';
import { useMockAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Pricing() {
  const { user, updatePlan } = useMockAuth();

  const tiers = [
    {
      name: 'Free',
      price: '$0',
      description: 'Ideal for trial conferences and rapid peer-to-peer connections.',
      icon: Zap,
      color: 'text-slate-600 bg-slate-100',
      features: [
        'Up to 40 minutes session limits',
        'Maximum 4 peers concurrently',
        'Standard SD definition presentation',
        'Persistent text chat streams'
      ]
    },
    {
      name: 'Premium',
      price: '$19',
      period: '/month',
      description: 'Ideal for small professional teams requiring unlimited stream duration.',
      icon: Star,
      color: 'text-amber-500 bg-amber-50',
      features: [
        'Unlimited conference meeting time',
        'Up to 100 peers concurrently',
        'Ultra HD audio and video quality',
        'Cloud messaging transcripts archived',
        'Priority technical developer support'
      ]
    }
  ];

  const handleUpgrade = (plan) => {
    updatePlan(plan);
    toast.success(`Successfully upgraded to ${plan}!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 py-4">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Simple, Transparent Pricing</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Upgrade your plan dynamically to support longer, higher bandwidth corporate conferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto pt-4">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          const isActive = user?.plan?.toLowerCase() === tier.name.toLowerCase();

          return (
            <div 
              key={tier.name}
              className={`glass-card rounded-4xl p-8 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-200 ${
                isActive ? 'ring-2 ring-blue-600 shadow-xl' : 'hover:bg-white/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase text-slate-700 tracking-wider">{tier.name}</span>
                  <div className={`p-2.5 rounded-2xl ${tier.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-4xl font-black text-slate-900">{tier.price}</span>
                  {tier.period && <span className="text-xs text-slate-500 font-semibold ml-1">{tier.period}</span>}
                </div>

                <p className="text-xs text-slate-600 mb-6 leading-relaxed">{tier.description}</p>

                <ul className="space-y-3.5 mb-8">
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
                className={`w-full py-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 cursor-default'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10'
                }`}
              >
                {isActive ? 'Current Plan' : `Upgrade to ${tier.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}