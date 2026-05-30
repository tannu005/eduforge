import React, { useState, useEffect, useRef } from 'react';
import { EmiCalcContent } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { 
  formatIndianNumber, calculateEMI, 
  generateAmortisationSchedule, AmortisationRow 
} from '../../utils/financial';
import { Calculator, Table, PieChart, Download, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmiCalculatorProps {
  id: string;
  content: EmiCalcContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const EmiCalculator: React.FC<EmiCalculatorProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);

  // Active inputs in the state (these sync with slide debouncing or direct values)
  const [principal, setPrincipal] = useState(content.principal);
  const [rate, setRate] = useState(content.rate);
  const [tenure, setTenure] = useState(content.tenure);
  const [tenureUnit, setTenureUnit] = useState(content.tenureUnit || 'months');

  // Debounced calculation trigger
  const debounceTimer = useRef<any | null>(null);

  // Synchronize state when block loads / changes
  useEffect(() => {
    setPrincipal(content.principal);
    setRate(content.rate);
    setTenure(content.tenure);
    setTenureUnit(content.tenureUnit || 'months');
  }, [content]);

  const handleValueChange = (key: 'principal' | 'rate' | 'tenure', val: number) => {
    if (key === 'principal') setPrincipal(val);
    if (key === 'rate') setRate(val);
    if (key === 'tenure') setTenure(val);

    // Debounce the Zustand store update so dragging slides doesn't trigger 100 calculations per second
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateBlockContent(id, { [key]: val }, true);
    }, 150);
  };

  const toggleTenureUnit = () => {
    const newUnit = tenureUnit === 'months' ? 'years' : 'months';
    let newTenure = tenure;
    if (newUnit === 'years') {
      newTenure = Math.max(1, Math.round(tenure / 12));
    } else {
      newTenure = Math.min(360, tenure * 12);
    }
    setTenureUnit(newUnit);
    setTenure(newTenure);
    updateBlockContent(id, { tenure: newTenure, tenureUnit: newUnit }, false);
  };

  // Perform actual calculation
  const monthsCount = tenureUnit === 'years' ? tenure * 12 : tenure;
  const { monthlyEmi, totalInterest, totalPayment } = calculateEMI(principal, rate, monthsCount);
  
  // Amortisation
  const schedule = generateAmortisationSchedule(principal, rate, monthsCount, monthlyEmi);

  // Show all toggle for schedule
  const [showAllSchedule, setShowAllSchedule] = useState(false);
  const displayedSchedule = showAllSchedule ? schedule : schedule.slice(0, 12);

  // Sort schedule table
  const [sortColumn, setSortColumn] = useState<keyof AmortisationRow>('month');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (col: keyof AmortisationRow) => {
    if (sortColumn === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortOrder('asc');
    }
  };

  const sortedSchedule = [...displayedSchedule].sort((a, b) => {
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Amortisation Table CSV Export (A5.2)
  const exportToCSV = () => {
    const headers = ['Month', 'Opening Balance', 'EMI', 'Principal Paid', 'Interest Paid', 'Closing Balance'];
    const rows = schedule.map(r => [
      r.month,
      r.openingBalance.toFixed(2),
      r.emi.toFixed(2),
      r.principalComponent.toFixed(2),
      r.interest.toFixed(2),
      r.closingBalance.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EMI_Amortisation_Schedule_₹${principal}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart: Doughnut
  const totalWeight = principal + totalInterest;
  const principalPercent = (principal / totalWeight) * 100;
  const interestPercent = (totalInterest / totalWeight) * 100;

  // Pie stroke calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (interestPercent / 100) * circumference;

  // Warnings color codes (amber if interest > principal, red if interest > 2x principal) (A5.2)
  const getInterestColor = () => {
    if (totalInterest > principal * 2) {
      return 'text-rose-400 font-extrabold';
    }
    if (totalInterest > principal) {
      return 'text-[#e5c158] font-bold';
    }
    return 'text-emerald-400 font-bold';
  };

  const getInterestBg = () => {
    if (totalInterest > principal * 2) {
      return 'bg-rose-950/20 border-rose-900/30';
    }
    if (totalInterest > principal) {
      return 'bg-emerald-950/25 border-[#d4af37]/30';
    }
    return 'bg-emerald-950/20 border-emerald-900/30';
  };

  const emiSliderClass = "w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none";

  return (
    <div 
      className="flex flex-col gap-6 p-5 border border-emerald-950/80 bg-[#041208]/25 rounded-2xl shadow-xl w-full"
      role="region"
      aria-label="EMI Calculator Widget"
    >
      <div className="flex items-center justify-between border-b border-emerald-950 pb-3 select-none">
        <div className="flex items-center gap-2.5 text-slate-300">
          <Calculator className="h-5 w-5 text-[#d4af37]" />
          <h3 className="font-bold text-base font-display">
            EMI Calculator {isPreview ? '(Live Simulator)' : '(Editor Mode)'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTenureUnit}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-[#030a06] hover:bg-[#06140b] border border-emerald-950 text-slate-400 hover:text-white transition-colors cursor-pointer select-none"
            title="Toggle months / years tenure units"
          >
            Unit: {tenureUnit === 'months' ? 'Months' : 'Years'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* principal */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center select-none">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Loan Principal
              </label>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#030a06] border border-emerald-950 rounded-lg text-sm font-semibold text-slate-100 font-mono">
                <span>₹</span>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => handleValueChange('principal', Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={isLocked && !isPreview}
                  className="bg-transparent border-none outline-none text-right w-28 text-slate-100 py-0 focus:ring-0 select-text"
                />
              </div>
            </div>
            <input
              type="range"
              min={10000}
              max={100000000}
              step={10000}
              value={principal}
              onChange={(e) => handleValueChange('principal', parseInt(e.target.value))}
              disabled={isLocked && !isPreview}
              className={emiSliderClass}
              aria-label="Loan Principal range slider"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium font-mono select-none">
              <span>₹10,000</span>
              <span className="text-slate-400 font-semibold">{formatIndianNumber(principal)}</span>
              <span>₹10 Cr</span>
            </div>
          </div>

          {/* rate */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center select-none">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Interest Rate (Annual)
              </label>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#030a06] border border-emerald-950 rounded-lg text-sm font-semibold text-slate-100 font-mono">
                <input
                  type="number"
                  step={0.1}
                  value={rate}
                  onChange={(e) => handleValueChange('rate', Math.max(0, parseFloat(e.target.value) || 0))}
                  disabled={isLocked && !isPreview}
                  className="bg-transparent border-none outline-none text-right w-16 text-slate-100 py-0 focus:ring-0 select-text"
                />
                <span>%</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={36}
              step={0.1}
              value={rate}
              onChange={(e) => handleValueChange('rate', parseFloat(e.target.value))}
              disabled={isLocked && !isPreview}
              className={emiSliderClass}
              aria-label="Annual Interest Rate range slider"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium font-mono select-none">
              <span>1.0%</span>
              <span className="text-slate-400 font-semibold">{rate.toFixed(1)}%</span>
              <span>36.0%</span>
            </div>
          </div>

          {/* tenure */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center select-none">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tenure ({tenureUnit === 'months' ? 'Months' : 'Years'})
              </label>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#030a06] border border-emerald-950 rounded-lg text-sm font-semibold text-slate-100 font-mono">
                <input
                  type="number"
                  value={tenure}
                  onChange={(e) => handleValueChange('tenure', Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isLocked && !isPreview}
                  className="bg-transparent border-none outline-none text-right w-16 text-slate-100 py-0 focus:ring-0 select-text"
                />
                <span className="text-slate-400 text-xs font-semibold capitalize">{tenureUnit}</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={tenureUnit === 'months' ? 360 : 30}
              value={tenure}
              onChange={(e) => handleValueChange('tenure', parseInt(e.target.value))}
              disabled={isLocked && !isPreview}
              className={emiSliderClass}
              aria-label="Tenure range slider"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium font-mono select-none">
              <span>1 {tenureUnit}</span>
              <span className="text-slate-400 font-semibold">{tenure} {tenureUnit}</span>
              <span>{tenureUnit === 'months' ? '360' : '30'} {tenureUnit}</span>
            </div>
          </div>
        </div>

        {/* RESULTS COLUMN */}
        <div className="lg:col-span-6 flex flex-col sm:flex-row gap-5 items-center justify-center p-4 rounded-2xl bg-[#041208]/30 border border-emerald-950">
          <div className="flex flex-col gap-4 w-full sm:w-1/2">
            <div className="flex flex-col select-text">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                Monthly EMI
              </span>
              <span className="text-2xl font-extrabold text-white font-display mt-1">
                ₹{formatIndianNumber(monthlyEmi)}
              </span>
            </div>

            <div className="flex flex-col select-text">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                Principal Component
              </span>
              <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                ₹{formatIndianNumber(principal)} ({principalPercent.toFixed(0)}%)
              </span>
            </div>

            <div className={`flex flex-col p-2.5 border rounded-xl select-text ${getInterestBg()}`}>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                Total Interest Payable
              </span>
              <span className={`text-sm mt-1 font-mono ${getInterestColor()}`}>
                ₹{formatIndianNumber(totalInterest)} ({interestPercent.toFixed(0)}%)
              </span>
            </div>

            <div className="flex flex-col select-text">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                Total Payment (P + I)
              </span>
              <span className="text-sm font-extrabold text-slate-300 font-mono mt-0.5">
                ₹{formatIndianNumber(totalPayment)}
              </span>
            </div>
          </div>

          {/* SVG Doughnut chart */}
          <div className="w-full sm:w-1/2 flex items-center justify-center relative select-none">
            <svg className="w-36 h-36" viewBox="0 0 150 150">
              <circle
                cx="75"
                cy="75"
                r={radius}
                className="stroke-emerald-950/60 fill-none"
                strokeWidth="16"
              />
              <motion.circle
                cx="75"
                cy="75"
                r={radius}
                className="stroke-[#d4af37] fill-none"
                strokeWidth="16"
                strokeLinecap="round"
                initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeOffset }}
                transition={{ type: "spring", stiffness: 70, damping: 15 }}
                transform="rotate(-90 75 75)"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Interest</span>
              <motion.span 
                key={interestPercent}
                initial={{ scale: 0.85, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-base font-extrabold text-[#d4af37] font-mono"
              >
                {interestPercent.toFixed(0)}%
              </motion.span>
            </div>
          </div>
        </div>
      </div>

      {/* AMORTISATION SCHEDULE TABLE */}
      <div className="flex flex-col gap-3 mt-2 border-t border-[#041208] pt-4">
        <div className="flex items-center justify-between select-none">
          <div className="flex items-center gap-2 text-slate-400">
            <Table className="h-4 w-4 text-[#d4af37]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Amortisation Schedule ({schedule.length} months)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[#d4af37]/20 hover:bg-[#d4af37]/35 border border-[#d4af37]/30 text-white rounded-lg transition-colors cursor-pointer"
              title="Download schedule as CSV"
            >
              <Download className="h-3 w-3 text-white" />
              <span className="text-white">Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-emerald-950 bg-[#020805]/45 rounded-xl max-h-[300px]">
          <table className="w-full text-xs text-left text-slate-400 border-collapse select-text">
            <thead className="bg-[#030a06] text-slate-300 font-semibold sticky top-0 z-10 select-none">
              <tr>
                <th className="px-4 py-2 border-b border-emerald-950 cursor-pointer hover:bg-emerald-950/20" onClick={() => handleSort('month')}>
                  Month {sortColumn === 'month' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-4 py-2 border-b border-emerald-950 cursor-pointer hover:bg-emerald-950/20" onClick={() => handleSort('openingBalance')}>
                  Opening Balance {sortColumn === 'openingBalance' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-4 py-2 border-b border-emerald-950 cursor-pointer hover:bg-emerald-950/20" onClick={() => handleSort('emi')}>
                  EMI {sortColumn === 'emi' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-4 py-2 border-b border-emerald-950 cursor-pointer hover:bg-emerald-950/20" onClick={() => handleSort('principalComponent')}>
                  Principal Component {sortColumn === 'principalComponent' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-4 py-2 border-b border-emerald-950 cursor-pointer hover:bg-emerald-950/20" onClick={() => handleSort('interest')}>
                  Interest Component {sortColumn === 'interest' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-4 py-2 border-b border-emerald-950 cursor-pointer hover:bg-emerald-950/20" onClick={() => handleSort('closingBalance')}>
                  Closing Balance {sortColumn === 'closingBalance' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSchedule.map((row) => (
                <tr key={row.month} className="hover:bg-[#041208]/30 border-b border-emerald-950">
                  <td className="px-4 py-2 font-bold font-mono">M{row.month}</td>
                  <td className="px-4 py-2 font-mono">₹{formatIndianNumber(row.openingBalance)}</td>
                  <td className="px-4 py-2 font-mono">₹{formatIndianNumber(row.emi)}</td>
                  <td className="px-4 py-2 text-emerald-400 font-mono">₹{formatIndianNumber(row.principalComponent)}</td>
                  <td className="px-4 py-2 text-[#d4af37] font-mono">₹{formatIndianNumber(row.interest)}</td>
                  <td className="px-4 py-2 font-mono">₹{formatIndianNumber(row.closingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {schedule.length > 12 && (
          <button
            onClick={() => setShowAllSchedule(!showAllSchedule)}
            className="text-xs font-semibold text-[#d4af37] hover:text-[#e5c158] self-center cursor-pointer py-1.5 focus:outline-none select-none"
          >
            {showAllSchedule ? 'Show First 12 Months' : `Show All ${schedule.length} Months`}
          </button>
        )}
      </div>
    </div>
  );
};
