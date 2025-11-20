
import React, { useState } from 'react';
import { X, Smartphone, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

interface PasswordResetModalProps {
  onClose: () => void;
  onPasswordChange: (newPass: string) => void;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ onClose, onPasswordChange }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Select Method, 2: Verify OTP, 3: New Pass
  const [method, setMethod] = useState<'mobile' | 'email'>('mobile');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Step 1: Send OTP
  const handleSendOtp = () => {
    // Simulate generating a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    
    // Simulate sending logic
    const destination = method === 'mobile' ? '+8801966013771' : 'gtrikit@gmail.com';
    
    // In a real app, this would trigger an API call. 
    // Here we show an alert to simulate the user receiving the code.
    alert(`[SIMULATION] A verification code has been sent to ${destination}.\n\nYour Code is: ${code}`);
    
    setStep(2);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      setStep(3);
      setError('');
    } else {
      setError('Invalid Code. Please check your device.');
    }
  };

  // Step 3: Save Password
  const handleSavePassword = () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    onPasswordChange(newPassword);
    alert('Password successfully changed!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1623] border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
        
        {/* Header */}
        <div className="bg-[#151e2e] p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-white font-bold flex items-center">
            <Lock size={16} className="mr-2 text-purple-500" /> Developer Security
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          
          {/* STEP 1: SELECT METHOD */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-gray-300 text-sm mb-4">
                To change your password, we need to verify your identity. Select where you want to receive the verification code.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setMethod('mobile')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all
                    ${method === 'mobile' ? 'bg-purple-900/30 border-purple-500 text-white' : 'bg-[#1F2937] border-gray-700 text-gray-400 hover:bg-[#2a3646]'}`}
                >
                  <Smartphone size={24} />
                  <span className="text-xs font-bold">Mobile</span>
                  <span className="text-[10px] opacity-60">...3771</span>
                </button>

                <button 
                  onClick={() => setMethod('email')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all
                    ${method === 'email' ? 'bg-purple-900/30 border-purple-500 text-white' : 'bg-[#1F2937] border-gray-700 text-gray-400 hover:bg-[#2a3646]'}`}
                >
                  <Mail size={24} />
                  <span className="text-xs font-bold">Email</span>
                  <span className="text-[10px] opacity-60">gtrikit@...</span>
                </button>
              </div>

              <button 
                onClick={handleSendOtp}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg flex items-center justify-center"
              >
                Send Verification Code <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                 <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-900/30 text-purple-400 mb-3">
                    <Smartphone size={24} />
                 </div>
                 <h4 className="text-white font-bold">Verify it's you</h4>
                 <p className="text-gray-400 text-xs mt-1">
                   Enter the 6-digit code sent to your {method}.
                 </p>
              </div>

              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-3 text-center text-2xl tracking-widest text-white focus:border-purple-500 focus:outline-none font-mono"
              />

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <button 
                onClick={handleVerifyOtp}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg"
              >
                Verify Code
              </button>
              
              <button onClick={() => setStep(1)} className="w-full text-xs text-gray-500 hover:text-gray-300 mt-2">
                Resend Code
              </button>
            </div>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 3 && (
            <div className="space-y-4">
               <div className="text-center mb-4">
                 <CheckCircle size={32} className="text-green-500 mx-auto mb-2" />
                 <h4 className="text-white font-bold">Identity Verified</h4>
                 <p className="text-gray-400 text-xs">Set your new developer password.</p>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">New Password</label>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Confirm Password</label>
                <input 
                  type="text" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <button 
                onClick={handleSavePassword}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg"
              >
                Update Password
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;
