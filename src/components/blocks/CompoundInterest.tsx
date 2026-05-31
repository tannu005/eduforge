import React, { useState, useEffect, useRef } from 'react';
import { CompoundCalcContent } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { 
  formatIndianNumber, calculateCompoundInterest, 
  generateCompoundInterestSchedule, CiYearlyBreakdown 
} from '../../utils/financial';
import { Percent, Activity, Download, Table } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompoundInterestProps {
  id: string;
  content: CompoundCalcContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const CompoundInterest: React.FC<CompoundInterestProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);

  // Active inputs
  const [principal, setPrincipal] = useState(content.principal);
  const [rate, setRate] = useState(content.rate);
  const [timeYears, setTimeYears] = useState(content.timeYears);
  const [frequency, setFrequency] = useState(content.frequency || 'annually');

  // Debounced update
  const debounceTimer = useRef<any | null>(null);

  useEffect(() => {
    setPrincipal(content.principal);
    setRate(content.rate);
    setTimeYears(content.timeYears);
    setFrequency(content.frequency || 'annually');
  }, [content]);

  const handleValueChange = (key: 'principal' | 'rate' | 'timeYears' | 'frequency', val: any) => {
    if (key === 'principal') setPrincipal(val);
    if (key === 'rate') setRate(val);
    if (key === 'timeYears') setTimeYears(val);
    if (key === 'frequency') setFrequency(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateBlockContent(id, { [key]: val }, true);
    }, 150);
  };

  const { futureValue, interestEarned } = calculateCompoundInterest(principal, rate, timeYears, frequency);
  const schedule = generateCompoundInterestSchedule(principal, rate, timeYears, frequency);

  // CSV Export
  const exportToCSV = () => {
    const headers = ['Year', 'Principal (Lump Sum)', 'Interest Earned', 'Future Value'];
    const rows = schedule.map(r => [
      r.year,
      r.principal.toFixed(2),
      r.interestEarned.toFixed(2),
      r.futureValue.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Compound_Interest_Lumpsum_₹${principal}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom SVG line chart points
  const drawChartPath = () => {
    if (schedule.length === 0) return '';
    const width = 220;
    const height = 110;
    const padding = 10;
    
    const maxVal = schedule[schedule.length - 1].futureValue;
    const minVal = principal;
    const valRange = maxVal - minVal || 1;

    const points = schedule.map((row, index) => {
      const x = padding + (index / (schedule.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((row.futureValue - minVal) / valRange) * (height - 2 * padding);
      return `${x},${y}`;
    });

    // Draw baseline
    const startPoint = `${padding},${height - padding}`;
    const firstPoint = points[0] || startPoint;
    
    return {
      linePath: `M ${points.join(' L ')}`,
      areaPath: `M ${firstPoint} L ${points.join(' L ')} L ${points[points.length - 1].split(',')[0]},${height - padding} Z`
    };
  };

  const chartPaths = drawChartPath();
  const frequencies = ['monthly', 'quarterly', 'half-yearly', 'annually'] as const;
  const ciSliderClass = "w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none";

  return (
    <div 
      className="flex flex-col gap-6 p-5 border border-emerald-950/80 bg-[#041208]/25 rounded-2xl shadow-xl w-full"
      role="region"
      aria-label="Compound Interest Widget"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-950 pb-3 select-none">
        <div className="flex items-center gap-2.5 text-slate-300">
          <Percent className="h-5 w-5 text-[#d4af37]" />
          <h3 className="font-bold text-base font-display">
            Compound Interest Calculator {isPreview ? '(Live Simulator)' : '(Editor Mode)'}
          </h3>
        </div>
        {!isLocked && (
          <select
            value={frequency}
            onChange={(e) => handleValueChange('frequency', e.target.value as any)}
            disabled={isLocked && !isPreview}
            className="bg-[#030a06] border border-emerald-950 text-slate-300 text-xs font-bold px-2 py-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d4af37] cursor-pointer select-none"
          >
            {frequencies.map((freq) => (
              <option key={freq} value={freq} className="bg-slate-950 capitalize">
                Compounded: {freq}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* principal */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap justify-between items-center gap-2 select-none">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Initial Principal (Lump Sum)
              </label>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#030a06] border border-emerald-950 rounded-lg text-sm font-semibold text-slate-100 font-mono">
                <span>₹</span>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => handleValueChange('principal', Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={isLocked && !isPreview}
                  className="bg-transparent border-none outline-none text-right w-24 text-slate-100 py-0 focus:ring-0 select-text"
                />
              </div>
            </div>
            <input
              type="range"
              min={1000}
              max={10000000}
              step={1000}
              value={principal}
              onChange={(e) => handleValueChange('principal', parseInt(e.target.value))}
              disabled={isLocked && !isPreview}
              className={ciSliderClass}
              aria-label="Lump Sum Principal range slider"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium font-mono select-none">
              <span>₹1,000</span>
              <span className="text-slate-400 font-semibold">{formatIndianNumber(principal)}</span>
              <span>₹1 Cr</span>
            </div>
          </div>

          {/* rate */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap justify-between items-center gap-2 select-none">
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
              max={30}
              step={0.5}
              value={rate}
              onChange={(e) => handleValueChange('rate', parseFloat(e.target.value))}
              disabled={isLocked && !isPreview}
              className={ciSliderClass}
              aria-label="Annual rate range slider"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium font-mono select-none">
              <span>1.0%</span>
              <span className="text-slate-400 font-semibold">{rate.toFixed(1)}%</span>
              <span>30.0%</span>
            </div>
          </div>

          {/* time */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap justify-between items-center gap-2 select-none">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Time Duration (Years)
              </label>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#030a06] border border-emerald-950 rounded-lg text-sm font-semibold text-slate-100 font-mono">
                <input
                  type="number"
                  value={timeYears}
                  onChange={(e) => handleValueChange('timeYears', Math.max(1, parseInt(e.target.value) || 1))}
                  disabled={isLocked && !isPreview}
                  className="bg-transparent border-none outline-none text-right w-16 text-slate-100 py-0 focus:ring-0 select-text"
                />
                <span className="text-slate-400 text-xs font-semibold">Yrs</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={40}
              value={timeYears}
              onChange={(e) => handleValueChange('timeYears', parseInt(e.target.value))}
              disabled={isLocked && !isPreview}
              className={ciSliderClass}
              aria-label="Time in years range slider"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium font-mono select-none">
              <span>1 Year</span>
              <span className="text-slate-400 font-semibold">{timeYears} Years</span>
              <span>40 Years</span>
            </div>
          </div>
        </div>

        {/* RESULTS COLUMN */}
        <div className="lg:col-span-6 flex flex-col sm:flex-row gap-5 items-center justify-center p-4 rounded-2xl bg-[#041208]/30 border border-emerald-950">
          <div className="flex flex-col gap-4 w-full sm:w-1/2">
            <div className="flex flex-col select-text">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                Maturity Future Value
              </span>
              <span className="text-2xl font-extrabold text-[#d4af37] font-display mt-1">
                ₹{formatIndianNumber(futureValue)}
              </span>
            </div>

            <div className="flex flex-col select-text">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                Initial Principal
              </span>
              <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                ₹{formatIndianNumber(principal)}
              </span>
            </div>

            <div className="flex flex-col p-2.5 border border-emerald-950/20 bg-emerald-950/20 rounded-xl select-text">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                Total Interest Earned
              </span>
              <span className="text-sm font-bold text-[#d4af37] font-mono mt-1">
                ₹{formatIndianNumber(interestEarned)}
              </span>
            </div>
          </div>

          {/* SVG Line Graph showing compound growth curve */}
          <div className="w-full sm:w-1/2 flex flex-col items-center justify-center relative select-none">
            {chartPaths ? (
              <div className="flex flex-col items-center gap-1.5">
                <svg className="w-48 h-28 border border-emerald-950 bg-[#020805]/65 rounded-xl" viewBox="0 0 220 110">
                  <motion.path
                    d={chartPaths.areaPath}
                    className="fill-[#d4af37]/10 stroke-none"
                    initial={{ opacity: 0 }}
                    animate={{ d: chartPaths.areaPath, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  />
                  <motion.path
                    d={chartPaths.linePath}
                    className="stroke-[#d4af37] fill-none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    animate={{ d: chartPaths.linePath }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  />
                </svg>
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
                  <Activity className="h-3 w-3 text-[#d4af37]" />
                  <span>Growth Trajectory Curve</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-650">No chart data</div>
            )}
          </div>
        </div>
      </div>

      {/* PROJECTION TABLE */}
      <div className="flex flex-col gap-3 mt-2 border-t border-emerald-950 pt-4">
        <div className="flex items-center justify-between select-none">
          <div className="flex items-center gap-2 text-slate-400">
            <Table className="h-4 w-4 text-[#d4af37]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Year-on-Year Growth Projection
            </span>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[#d4af37]/20 hover:bg-[#d4af37]/35 border border-[#d4af37]/30 text-white rounded-lg transition-colors cursor-pointer"
            title="Download CI projection as CSV"
          >
            <Download className="h-3 w-3 text-white" />
            <span className="text-white">Export CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-emerald-950 bg-[#020805]/45 rounded-xl max-h-[220px]">
          <table className="w-full text-xs text-left text-slate-400 border-collapse select-text">
            <thead className="bg-[#030a06] text-slate-300 font-semibold sticky top-0 z-10 select-none">
              <tr>
                <th className="px-4 py-2 border-b border-emerald-950">Year</th>
                <th className="px-4 py-2 border-b border-emerald-950">Principal Deposit</th>
                <th className="px-4 py-2 border-b border-emerald-950">Interest Accrued</th>
                <th className="px-4 py-2 border-b border-emerald-950">Future Value (Corpus)</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.year} className="hover:bg-[#041208]/30 border-b border-emerald-950">
                  <td className="px-4 py-2 font-bold font-mono">Year {row.year}</td>
                  <td className="px-4 py-2 font-mono">₹{formatIndianNumber(row.principal)}</td>
                  <td className="px-4 py-2 text-[#d4af37] font-mono">₹{formatIndianNumber(row.interestEarned)}</td>
                  <td className="px-4 py-2 font-mono">₹{formatIndianNumber(row.futureValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
