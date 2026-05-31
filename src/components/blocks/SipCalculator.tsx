import React, { useState, useEffect, useRef } from 'react';
import { SipCalcContent } from '../../types';
import { useModuleStore } from '../../store/useModuleStore';
import { 
  formatIndianNumber, calculateSIP, 
  generateSIPSchedule, SipYearlyBreakdown 
} from '../../utils/financial';
import { Landmark, TrendingUp, Download, PieChart, Table } from 'lucide-react';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface SipCalculatorProps {
  id: string;
  content: SipCalcContent;
  isLocked: boolean;
  isPreview?: boolean;
}

export const SipCalculator: React.FC<SipCalculatorProps> = ({
  id,
  content,
  isLocked,
  isPreview = false,
}) => {
  const updateBlockContent = useModuleStore((state) => state.updateBlockContent);

  // Active inputs in states
  const [monthlyInvestment, setMonthlyInvestment] = useState(content.monthlyInvestment);
  const [expectedReturn, setExpectedReturn] = useState(content.expectedReturn);
  const [durationYears, setDurationYears] = useState(content.durationYears);

  // Debounced update
  const debounceTimer = useRef<any | null>(null);

  useEffect(() => {
    setMonthlyInvestment(content.monthlyInvestment);
    setExpectedReturn(content.expectedReturn);
    setDurationYears(content.durationYears);
  }, [content]);

  const handleValueChange = (key: 'monthlyInvestment' | 'expectedReturn' | 'durationYears', val: number) => {
    if (key === 'monthlyInvestment') setMonthlyInvestment(val);
    if (key === 'expectedReturn') setExpectedReturn(val);
    if (key === 'durationYears') setDurationYears(val);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateBlockContent(id, { [key]: val }, true);
    }, 150);
  };

  const { futureValue, totalInvested, wealthGained } = calculateSIP(monthlyInvestment, expectedReturn, durationYears);
  const schedule = generateSIPSchedule(monthlyInvestment, expectedReturn, durationYears);

  // CSV Export
  const exportToCSV = () => {
    const headers = ['Year', 'Total Invested', 'Wealth Gained', 'Future Value'];
    const rows = schedule.map(r => [
      r.year,
      r.totalInvested.toFixed(2),
      r.wealthGained.toFixed(2),
      r.futureValue.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SIP_Wealth_Accumulation_₹${monthlyInvestment}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pie chart calculation
  const totalWeight = futureValue;
  const investedPercent = (totalInvested / totalWeight) * 100;
  const wealthPercent = (wealthGained / totalWeight) * 100;



  const sipSliderClass = "w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none";

  return (
    <div 
      className="flex flex-col gap-6 p-5 border border-emerald-950/80 bg-[#041208]/25 rounded-2xl shadow-xl w-full"
      role="region"
      aria-label="SIP Calculator Widget"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-950 pb-3 select-none">
        <div className="flex items-center gap-2.5 text-slate-300">
          <TrendingUp className="h-5 w-5 text-[#d4af37]" />
          <h3 className="font-bold text-base font-display">
            SIP Calculator {isPreview ? '(Live Simulator)' : '(Editor Mode)'}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* Monthly Investment */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap justify-between items-center gap-2 select-none">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Monthly Investment
              </label>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-[#030a06] border border-emerald-950 rounded-lg text-sm font-semibold text-slate-100 font-mono">
                <span>₹</span>
                <input
                  type="number"
                  value={monthlyInvestment}
                  onChange={(e) => handleValueChange('monthlyInvestment', Math.max(0, parseInt(e.target.value) || 0))}
                  disabled={isLocked && !isPreview}
                  className="bg-transparent border-none outline-none text-right w-24 text-slate-100 py-0 focus:ring-0 select-text"
                />
              </div>
            </div>
            <input
              type="range"
              min={500}
              max={1000000}
              step={500}
              value={monthlyInvestment}
              onChange={(e) => handleValueChange('monthlyInvestment', parseInt(e.target.value))}
              disabled={isLocked && !isPreview}
              className={sipSliderClass}
              aria-label="Monthly Investment range slider"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium font-mono select-none">
              <span>₹500</span>
              <span className="text-slate-400 font-semibold">{formatIndianNumber(monthlyInvestment)}/mo</span>
              <span>₹10 L</span>
            </div>
          </div>

          {/* Expected Return */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap justify-between items-center gap-2 select-none">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Expected Return (Annual)
              </label>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#030a06] border border-emerald-950 rounded-lg text-sm font-semibold text-slate-100 font-mono">
                <input
                  type="number"
                  step={0.5}
                  value={expectedReturn}
                  onChange={(e) => handleValueChange('expectedReturn', Math.max(0, parseFloat(e.target.value) || 0))}
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
              value={expectedReturn}
              onChange={(e) => handleValueChange('expectedReturn', parseFloat(e.target.value))}
              disabled={isLocked && !isPreview}
              className={sipSliderClass}
              aria-label="Expected annual return range slider"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium font-mono select-none">
              <span>1.0%</span>
              <span className="text-slate-400 font-semibold">{expectedReturn.toFixed(1)}%</span>
              <span>30.0%</span>
            </div>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap justify-between items-center gap-2 select-none">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Duration (Years)
              </label>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#030a06] border border-emerald-950 rounded-lg text-sm font-semibold text-slate-100 font-mono">
                <input
                  type="number"
                  value={durationYears}
                  onChange={(e) => handleValueChange('durationYears', Math.max(1, parseInt(e.target.value) || 1))}
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
              value={durationYears}
              onChange={(e) => handleValueChange('durationYears', parseInt(e.target.value))}
              disabled={isLocked && !isPreview}
              className={sipSliderClass}
              aria-label="SIP Duration range slider"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-medium font-mono select-none">
              <span>1 Year</span>
              <span className="text-slate-400 font-semibold">{durationYears} Years</span>
              <span>40 Years</span>
            </div>
          </div>
        </div>

        {/* RESULTS COLUMN */}
        <div className="lg:col-span-6 flex flex-col xl:flex-row gap-5 items-center justify-center p-4 rounded-2xl bg-[#041208]/30 border border-emerald-950">
          <div className="flex flex-col gap-4 w-full xl:w-1/2">
            <div className="flex flex-col select-text">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                Expected Future Value
              </span>
              <span className="text-2xl font-extrabold text-[#d4af37] font-display mt-1">
                ₹{formatIndianNumber(futureValue)}
              </span>
            </div>

            <div className="flex flex-col select-text">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                Invested Amount
              </span>
              <span className="text-sm font-bold text-emerald-450 font-mono mt-0.5">
                ₹{formatIndianNumber(totalInvested)} ({investedPercent.toFixed(0)}%)
              </span>
            </div>

            <div className="flex flex-col p-2.5 border border-emerald-950/20 bg-[#041208]/25 rounded-xl select-text">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-none">
                Estimated Wealth Gained
              </span>
              <span className="text-sm font-bold text-[#d4af37] font-mono mt-1">
                ₹{formatIndianNumber(wealthGained)} ({wealthPercent.toFixed(0)}%)
              </span>
            </div>
          </div>

          {/* Chart.js Doughnut chart */}
          <div className="w-full xl:w-1/2 flex items-center justify-center relative select-none">
            <div className="w-36 h-36 relative">
              <Doughnut
                data={{
                  labels: ['Invested', 'Wealth Gained'],
                  datasets: [{
                    data: [totalInvested, wealthGained],
                    backgroundColor: ['#10b981', '#d4af37'],
                    borderColor: ['#082212', '#082212'],
                    borderWidth: 2,
                    hoverBackgroundColor: ['#0d9f6e', '#e5c158'],
                    hoverBorderColor: ['#d4af37', '#10b981'],
                  }],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  cutout: '65%',
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#020805',
                      titleColor: '#d4af37',
                      bodyColor: '#f1f5f9',
                      borderColor: '#082212',
                      borderWidth: 1,
                      cornerRadius: 12,
                      padding: 10,
                      callbacks: {
                        label: (ctx: any) => ` ₹${formatIndianNumber(ctx.raw)}`,
                      },
                    },
                  },
                  animation: {
                    animateRotate: true,
                    duration: 600,
                  },
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Returns</span>
                <span className="text-base font-extrabold text-[#d4af37] font-mono">
                  {wealthPercent.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCHEDULE TABLE */}
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
            title="Download SIP projection as CSV"
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
                <th className="px-4 py-2 border-b border-emerald-950">Cumulative Invested</th>
                <th className="px-4 py-2 border-b border-emerald-950">Wealth Gained</th>
                <th className="px-4 py-2 border-b border-emerald-950">Future Value (Corpus)</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((row) => (
                <tr key={row.year} className="hover:bg-[#041208]/30 border-b border-emerald-950">
                  <td className="px-4 py-2 font-bold font-mono">Year {row.year}</td>
                  <td className="px-4 py-2 font-mono">₹{formatIndianNumber(row.totalInvested)}</td>
                  <td className="px-4 py-2 text-[#d4af37] font-mono">₹{formatIndianNumber(row.wealthGained)}</td>
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
