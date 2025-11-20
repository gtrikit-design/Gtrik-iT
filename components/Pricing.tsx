
import React from 'react';
import { Check } from 'lucide-react';

interface PricingProps {
  onGoBack: () => void;
}

const featuresList = [
  "Unlimited Metadata Generation",
  "Full Image to Prompt Features",
  "Full Access to Metadata Customization",
  "More Fast Processing",
  "Fully Custom Support",
  "All Future Features"
];

const Pricing: React.FC<PricingProps> = ({ onGoBack }) => {
  return (
    <div className="flex flex-col items-center w-full min-h-full py-10 animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-10">Choose Your Plan</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl px-4 my-auto">
        
        {/* Free Plan */}
        <div className="w-full bg-[#0F1623] border border-gray-800 rounded-2xl p-8 flex flex-col relative hover:border-gray-700 transition-colors">
           <div className="text-center mb-6">
             <h2 className="text-2xl font-bold text-white mb-2">Free</h2>
             <div className="text-4xl font-bold text-white mb-1">0 <span className="text-lg font-normal text-gray-400">Tk</span></div>
             <p className="text-sm text-gray-400 mb-4">All features, unlimited access</p>
             <p className="text-xs text-cyan-400 mb-2">Free users now have access to all premium features</p>
           </div>
           
           <div className="space-y-3 mb-8 flex-1">
             {featuresList.map((f, i) => (
               <div key={i} className="flex items-start text-sm text-gray-300">
                 <Check size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                 <span>{f}</span>
               </div>
             ))}
           </div>
           
           <button 
             onClick={onGoBack}
             className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors"
           >
             Current Plan
           </button>
        </div>

        {/* Premium Plan */}
        <div className="w-full bg-[#0F1623] border-2 border-cyan-500 rounded-2xl p-8 flex flex-col relative transform scale-105 z-10 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
           <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
             Popular
           </div>
           
           <div className="text-center mb-6">
             <h2 className="text-2xl font-bold text-white mb-2">Premium</h2>
             <div className="text-4xl font-bold text-white mb-1">995 <span className="text-lg font-normal text-gray-400">Tk/Yearly</span></div>
             <span className="inline-block bg-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded mt-2 font-bold">Best Value!</span>
             <p className="text-sm text-gray-400 mt-3">All features, unlimited access</p>
           </div>
           
           <div className="space-y-3 mb-8 flex-1">
             {featuresList.map((f, i) => (
               <div key={i} className="flex items-start text-sm text-gray-300">
                 <Check size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                 <span>{f}</span>
               </div>
             ))}
           </div>
           
           <div className="relative">
             <button disabled className="w-full py-3 rounded-lg bg-gray-700 text-gray-400 font-bold cursor-not-allowed opacity-50">
               Upgrade to Premium
             </button>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-black/80 text-yellow-500 text-xs font-bold px-2 py-1 rounded border border-yellow-500/30">⚠ Currently unavailable</span>
             </div>
           </div>
        </div>

        {/* Basic Plan */}
        <div className="w-full bg-[#0F1623] border border-gray-800 rounded-2xl p-8 flex flex-col relative hover:border-gray-700 transition-colors">
           <div className="text-center mb-6">
             <h2 className="text-2xl font-bold text-white mb-2">Basic</h2>
             <div className="text-4xl font-bold text-white mb-1">195 <span className="text-lg font-normal text-gray-400">Tk/Month</span></div>
             <p className="text-sm text-gray-400 mt-4">All features, monthly access</p>
           </div>
           
           <div className="space-y-3 mb-8 flex-1">
             {featuresList.map((f, i) => (
               <div key={i} className="flex items-start text-sm text-gray-300">
                 <Check size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                 <span>{f}</span>
               </div>
             ))}
           </div>
           
           <div className="relative">
             <button disabled className="w-full py-3 rounded-lg bg-gray-700 text-gray-400 font-bold cursor-not-allowed opacity-50">
               Upgrade to Basic
             </button>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-black/80 text-yellow-500 text-xs font-bold px-2 py-1 rounded border border-yellow-500/30">⚠ Currently unavailable</span>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Pricing;
