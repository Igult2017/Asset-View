import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  TrendingUp, 
  BarChart3, 
  BrainCircuit, 
  Compass,
  ChevronRight,
  ChevronLeft,
  Save,
  Zap,
  Activity,
  History,
  LayoutGrid,
  MousePointer2,
  Gauge,
  Clock,
  AlertTriangle,
  RefreshCcw,
  CheckCircle2,
  Target,
  Trash2,
  RotateCcw,
  ZapOff,
  LineChart,
  Boxes,
  Microscope,
  Workflow,
  X
} from 'lucide-react';

const INITIAL_FORM_STATE = {
  screenshot: null,
  screenshotTimestamp: '',
  hotTimestamp: '',
  instrument: '',
  direction: 'Long',
  lotSize: '',
  entryPrice: '',
  stopLoss: '',
  stopLossDistancePips: '',
  takeProfit: '',
  takeProfitDistancePips: '',
  entryTime: '',
  exitTime: '',
  tradeDuration: '',
  dayOfWeek: 'Monday',
  outcome: 'Win',
  profitLoss: '',
  accountBalance: '',
  orderType: 'Market',
  riskPercent: '',
  entryTF: '5M',
  analysisTF: '1HR',
  contextTF: '1D',
  marketRegime: 'Trending',
  trendDirection: 'Bullish',
  volatilityState: 'Normal',
  liquidity: 'High',
  newsEnvironment: 'Clear',
  entryTimeUTC: '',
  sessionPhase: 'Open',
  sessionName: 'London',
  timingContext: 'Impulse',
  candlePattern: '',
  indicatorState: '',
  marketAlignment: 3,
  setupClarity: 3,
  entryPrecision: 3,
  confluence: 3,
  timingQuality: 3,
  primarySignals: '',
  secondarySignals: '',
  keyLevelRespect: 'Yes',
  keyLevelType: 'Support',
  momentumValidity: 'Strong',
  targetLogicClarity: 'High',
  plannedEntry: '',
  plannedSL: '',
  plannedTP: '',
  actualEntry: '',
  actualSL: '',
  actualTP: '',
  pipsGainedLost: '',
  slPips: '',
  tpPips: '',
  mae: '',
  mfe: '',
  monetaryRisk: '',
  potentialReward: '',
  plannedRR: '',
  achievedRR: '',
  riskHeat: 'Low',
  entryMethod: 'Market',
  exitStrategy: '',
  breakEvenApplied: false,
  managementType: 'Rule-based',
  confidenceLevel: 3,
  emotionalState: 'Calm',
  focusStressLevel: 'Low',
  rulesFollowed: 100,
  worthRepeating: true,
  whatWorked: '',
  whatFailed: '',
  adjustments: '',
  notes: ''
};

export function LogEntry() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
        if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('screenshot', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_STATE);
    setStep(1);
    setShowResetConfirm(false);
  };

  const nextStep = () => setStep(s => Math.min(3, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const SectionHeader = ({ icon: Icon, title, color = "blue" }: { icon: any, title: string, color?: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2 rounded-lg ${color === 'blue' ? 'bg-blue-500/10' : color === 'indigo' ? 'bg-indigo-500/10' : 'bg-purple-500/10'}`}>
        <Icon className={`w-5 h-5 ${color === 'blue' ? 'text-blue-400' : color === 'indigo' ? 'text-indigo-400' : 'text-purple-400'}`} />
      </div>
      <h3 className="text-[11px] font-bold text-slate-200 uppercase tracking-widest">
        {title}
      </h3>
      <div className="flex-grow h-px bg-slate-800 ml-2" />
    </div>
  );

  const InputField = ({ label, field, type = "text", placeholder = "" }: { label: string, field: string, type?: string, placeholder?: string }) => (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold placeholder:text-slate-700"
        placeholder={placeholder}
        value={(formData as any)[field]}
        onChange={(e) => updateField(field, e.target.value)}
      />
    </div>
  );

  const SelectField = ({ label, field, options }: { label: string, field: string, options: string[] }) => (
    <div className="flex flex-col gap-2">
      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <select
          className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-200 focus:border-blue-500/50 outline-none transition-all text-sm font-bold appearance-none cursor-pointer"
          value={(formData as any)[field]}
          onChange={(e) => updateField(field, e.target.value)}
        >
          {options.map(opt => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <ChevronRight className="w-4 h-4 rotate-90" />
        </div>
      </div>
    </div>
  );

  const ScoreSlider = ({ label, field }: { label: string, field: string }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
        <span className="text-[10px] font-bold px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">{(formData as any)[field]} / 5</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
        value={(formData as any)[field]}
        onChange={(e) => updateField(field, parseInt(e.target.value))}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] p-4 md:p-10 font-['Montserrat'] font-bold text-slate-300">
      <div className="max-w-6xl mx-auto bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[85vh]">
        
        {/* Sidebar */}
        <div className="md:w-72 bg-slate-950/40 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-8 md:mb-12">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 relative group overflow-hidden">
                <Workflow className="text-white w-6 h-6 z-10" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h1 className="text-xl font-extrabold tracking-tighter text-white">TRD.LOG</h1>
            </div>

            <nav className="flex md:flex-col gap-2 md:space-y-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide">
              {[
                { id: 1, label: 'Core', icon: LineChart, color: 'blue' },
                { id: 2, label: 'Market', icon: Compass, color: 'indigo' },
                { id: 3, label: 'Advanced', icon: Microscope, color: 'violet' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setStep(item.id)}
                  className={`flex-shrink-0 md:w-full group relative flex items-center gap-3 px-4 py-3 md:py-4 rounded-2xl text-xs md:text-sm font-semibold transition-all overflow-hidden ${
                    step === item.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className={`relative z-10 p-1 rounded-lg transition-colors ${step === item.id ? 'bg-white/10' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                    <item.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <span className="relative z-10">{item.label}</span>
                  {step === item.id && (
                    <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] hidden md:block" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="hidden md:block space-y-3 pt-8">
            {showResetConfirm ? (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl">
                <p className="text-[10px] text-rose-400 uppercase text-center mb-3">Confirm Reset?</p>
                <div className="flex gap-2">
                  <button onClick={resetForm} className="flex-1 py-2 bg-rose-600 text-white text-[10px] rounded-lg hover:bg-rose-500 transition-colors">Yes</button>
                  <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 bg-slate-800 text-slate-300 text-[10px] rounded-lg">No</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 p-4 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/5 transition-all group cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:rotate-[-45deg] transition-transform" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-rose-400">Purge Data</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden h-[calc(100vh-200px)] md:h-auto">
          <div className="p-6 md:p-12 overflow-y-auto custom-scrollbar">
            
            <header className="mb-8 md:mb-10 flex justify-between items-end">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {step === 1 ? '1. Execution Core' : step === 2 ? '2. Market Context' : '3. Post-Trade Review'}
                </h2>
                <p className="text-slate-500 text-xs md:text-sm mt-1">
                  {step === 1 ? 'Fundamental positioning and visual evidence' : step === 2 ? 'Quantifying the external environment' : 'Discipline, psychology, and performance data'}
                </p>
              </div>
              <div className="text-slate-800 text-7xl font-black italic select-none opacity-50 hidden sm:block">0{step}</div>
            </header>

            {step === 1 && (
              <div className="space-y-8 md:space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <div className={`relative group overflow-hidden rounded-3xl border-2 transition-all cursor-pointer ${formData.screenshot ? 'border-blue-500/50 bg-slate-900' : 'border-dashed border-slate-800 bg-slate-950/40 hover:border-blue-500/50'}`}>
                      <input type="file" className="hidden" id="chart-upload" onChange={handleFileUpload} accept="image/*" />
                      {formData.screenshot ? (
                        <div className="relative group">
                          <img src={formData.screenshot as string} alt="Trade Evidence" className="w-full h-auto max-h-[400px] object-contain rounded-2xl" />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <label htmlFor="chart-upload" className="p-3 bg-blue-600 rounded-xl cursor-pointer hover:bg-blue-500 transition-colors">
                              <RefreshCcw className="w-5 h-5 text-white" />
                            </label>
                            <button onClick={() => updateField('screenshot', null)} className="p-3 bg-rose-600 rounded-xl hover:bg-rose-500 transition-colors">
                              <Trash2 className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label htmlFor="chart-upload" className="flex flex-col items-center justify-center py-12 md:py-20 cursor-pointer">
                          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Camera className="w-8 h-8 text-blue-400" />
                          </div>
                          <p className="text-sm text-slate-400">Drop trade screenshot or click to upload</p>
                          <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-2 font-bold">PNG, JPG up to 10MB</p>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <SectionHeader icon={Zap} title="Primary Parameters" color="blue" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <InputField label="Instrument" field="instrument" placeholder="e.g. NAS100, EURUSD" />
                      <SelectField label="Direction" field="direction" options={['Long', 'Short']} />
                      <InputField label="Lot Size / Units" field="lotSize" placeholder="0.01" type="number" />
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <SectionHeader icon={Activity} title="Execution Pricing" color="indigo" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <InputField label="Entry Price" field="entryPrice" placeholder="0.00000" type="number" />
                      <InputField label="Stop Loss" field="stopLoss" placeholder="0.00000" type="number" />
                      <InputField label="SL (Pips)" field="slPips" placeholder="0.0" type="number" />
                      <InputField label="Take Profit" field="takeProfit" placeholder="0.00000" type="number" />
                      <InputField label="TP (Pips)" field="tpPips" placeholder="0.0" type="number" />
                      <InputField label="Risk %" field="riskPercent" placeholder="1.0" type="number" />
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <SectionHeader icon={Clock} title="Timing & Context" color="blue" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <InputField label="Entry Date/Time" field="entryTime" type="datetime-local" />
                      <InputField label="Exit Date/Time" field="exitTime" type="datetime-local" />
                      <InputField label="Day of Week" field="dayOfWeek" />
                      <InputField label="Trade Duration" field="tradeDuration" placeholder="e.g. 2h 30m" />
                      <InputField label="Hot Timestamp" field="hotTimestamp" type="datetime-local" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 md:space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <SectionHeader icon={Compass} title="Market Structure" color="indigo" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <SelectField label="Market Regime" field="marketRegime" options={['Trending', 'Ranging', 'Volatile', 'Quiet']} />
                      <SelectField label="Trend Direction" field="trendDirection" options={['Bullish', 'Bearish', 'Sideways']} />
                      <SelectField label="Volatility State" field="volatilityState" options={['Expanding', 'Contracting', 'Normal']} />
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <SectionHeader icon={Gauge} title="Session Information" color="blue" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <SelectField label="Session" field="sessionName" options={['London', 'New York', 'Asian', 'Overlap']} />
                      <SelectField label="Session Phase" field="sessionPhase" options={['Open', 'Mid', 'Close', 'Pre-Session']} />
                      <SelectField label="Liquidity" field="liquidity" options={['High', 'Medium', 'Low']} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 md:space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <SectionHeader icon={BrainCircuit} title="Psychology & Scoring" color="purple" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                      <ScoreSlider label="Setup Clarity" field="setupClarity" />
                      <ScoreSlider label="Market Alignment" field="marketAlignment" />
                      <ScoreSlider label="Execution Precision" field="entryPrecision" />
                      <ScoreSlider label="Confidence Level" field="confidenceLevel" />
                    </div>
                  </div>

                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <SectionHeader icon={History} title="Performance Outcome" color="blue" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <SelectField label="Outcome" field="outcome" options={['Win', 'Loss', 'Breakeven']} />
                      <InputField label="P/L Amount" field="profitLoss" placeholder="0.00" type="number" />
                      <InputField label="Achieved R:R" field="achievedRR" placeholder="0.00" type="number" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-6 md:p-8 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex gap-2">
              {step > 1 && (
                <button 
                  onClick={prevStep}
                  className="px-6 py-3 rounded-xl border border-slate-800 text-slate-400 font-bold text-sm hover:bg-slate-800 hover:text-white transition-all flex items-center gap-2 group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
              )}
            </div>

            <div className="flex gap-4">
              {step < 3 ? (
                <button 
                  onClick={nextStep}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all flex items-center gap-2 group"
                >
                  Next Phase
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button 
                  onClick={() => setShowSuccessModal(true)}
                  className="px-10 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm hover:from-emerald-500 hover:to-teal-500 shadow-xl shadow-emerald-600/20 transition-all flex items-center gap-2 group"
                >
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Commit to Vault
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">TRADE COMMITTED</h3>
            <p className="text-slate-500 text-sm mb-8">Data has been successfully encrypted and stored in the vault.</p>
            <button 
              onClick={() => {
                setShowSuccessModal(false);
                resetForm();
              }}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20"
            >
              Back to Terminal
            </button>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

export default LogEntry;
