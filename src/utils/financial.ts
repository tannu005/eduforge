/**
 * Formats a number into the Indian numbering system (Lakhs & Crores).
 * Example: 2500000 => "25,00,000"
 * Example: 10000000 => "1,00,00,000"
 */
export const formatIndianNumber = (num: number, decimals: number = 0): string => {
  if (isNaN(num) || num === null || num === undefined) return '0';
  
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const rounded = absNum.toFixed(decimals);
  const parts = rounded.split('.');
  
  let integerPart = parts[0];
  const decimalPart = parts[1];

  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherParts = integerPart.substring(0, integerPart.length - 3);
  
  if (otherParts !== '') {
    lastThree = ',' + lastThree;
  }
  
  const formattedInteger = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const formatted = isNegative ? '-' + formattedInteger : formattedInteger;
  
  return decimalPart ? formatted + '.' + decimalPart : formatted;
};

/**
 * Calculates Equated Monthly Installment (EMI)
 * Formula: EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
 * P = Principal, R = Monthly Interest Rate, N = Tenure in months
 */
export const calculateEMI = (
  principal: number,
  annualRate: number,
  tenureMonths: number
): {
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
} => {
  if (annualRate === 0) {
    const monthlyEmi = principal / tenureMonths;
    const totalPayment = principal;
    return {
      monthlyEmi,
      totalInterest: 0,
      totalPayment,
    };
  }

  const R = annualRate / 12 / 100;
  const N = tenureMonths;
  
  const emiNumerator = principal * R * Math.pow(1 + R, N);
  const emiDenominator = Math.pow(1 + R, N) - 1;
  const monthlyEmi = emiNumerator / emiDenominator;
  
  const totalPayment = monthlyEmi * N;
  const totalInterest = totalPayment - principal;

  return {
    monthlyEmi,
    totalInterest,
    totalPayment,
  };
};

export interface AmortisationRow {
  month: number;
  openingBalance: number;
  emi: number;
  interest: number;
  principalComponent: number;
  closingBalance: number;
}

/**
 * Generates month-by-month amortisation schedule
 */
export const generateAmortisationSchedule = (
  principal: number,
  annualRate: number,
  tenureMonths: number,
  monthlyEmi: number
): AmortisationRow[] => {
  const schedule: AmortisationRow[] = [];
  const R = annualRate / 12 / 100;
  let openingBalance = principal;

  for (let m = 1; m <= tenureMonths; m++) {
    const interest = R > 0 ? openingBalance * R : 0;
    let principalComponent = monthlyEmi - interest;
    
    // For the last month, round off to balance the sheet exactly
    if (openingBalance < principalComponent || m === tenureMonths) {
      principalComponent = openingBalance;
    }

    const closingBalance = Math.max(0, openingBalance - principalComponent);

    schedule.push({
      month: m,
      openingBalance,
      emi: monthlyEmi,
      interest,
      principalComponent,
      closingBalance,
    });

    openingBalance = closingBalance;
    if (openingBalance <= 0) break;
  }

  return schedule;
};

/**
 * Calculates Systematic Investment Plan (SIP) Future Value
 * Formula (Annuity Due): FV = P x [((1 + r)^n - 1) / r] x (1 + r)
 * P = Monthly Investment, r = Monthly Interest Rate, n = Number of months
 */
export const calculateSIP = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number
): {
  futureValue: number;
  totalInvested: number;
  wealthGained: number;
} => {
  const P = monthlyInvestment;
  const r = expectedReturn / 12 / 100;
  const n = years * 12;

  if (r === 0) {
    const totalInvested = P * n;
    return {
      futureValue: totalInvested,
      totalInvested,
      wealthGained: 0,
    };
  }

  const futureValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const totalInvested = P * n;
  const wealthGained = futureValue - totalInvested;

  return {
    futureValue,
    totalInvested,
    wealthGained,
  };
};

export interface SipYearlyBreakdown {
  year: number;
  totalInvested: number;
  futureValue: number;
  wealthGained: number;
}

/**
 * Generates year-by-year SIP accumulation breakdown
 */
export const generateSIPSchedule = (
  monthlyInvestment: number,
  expectedReturn: number,
  totalYears: number
): SipYearlyBreakdown[] => {
  const breakdown: SipYearlyBreakdown[] = [];
  
  for (let y = 1; y <= totalYears; y++) {
    const result = calculateSIP(monthlyInvestment, expectedReturn, y);
    breakdown.push({
      year: y,
      totalInvested: result.totalInvested,
      futureValue: result.futureValue,
      wealthGained: result.wealthGained,
    });
  }

  return breakdown;
};

/**
 * Calculates Compound Interest (Lump Sum Growth)
 * Formula: A = P x (1 + R / (f * 100))^(f * t)
 * P = Principal, R = Annual Rate, f = Compounding frequency per year, t = Time in years
 */
export const calculateCompoundInterest = (
  principal: number,
  annualRate: number,
  years: number,
  frequency: 'monthly' | 'quarterly' | 'half-yearly' | 'annually'
): {
  futureValue: number;
  interestEarned: number;
} => {
  let f = 1;
  switch (frequency) {
    case 'monthly': f = 12; break;
    case 'quarterly': f = 4; break;
    case 'half-yearly': f = 2; break;
    case 'annually': f = 1; break;
  }

  const exponent = f * years;
  const base = 1 + (annualRate / (f * 100));
  const futureValue = principal * Math.pow(base, exponent);
  const interestEarned = futureValue - principal;

  return {
    futureValue,
    interestEarned,
  };
};

export interface CiYearlyBreakdown {
  year: number;
  principal: number;
  interestEarned: number;
  futureValue: number;
}

/**
 * Generates year-by-year compound interest growth path
 */
export const generateCompoundInterestSchedule = (
  principal: number,
  annualRate: number,
  totalYears: number,
  frequency: 'monthly' | 'quarterly' | 'half-yearly' | 'annually'
): CiYearlyBreakdown[] => {
  const breakdown: CiYearlyBreakdown[] = [];

  for (let y = 1; y <= totalYears; y++) {
    const result = calculateCompoundInterest(principal, annualRate, y, frequency);
    breakdown.push({
      year: y,
      principal,
      interestEarned: result.interestEarned,
      futureValue: result.futureValue,
    });
  }

  return breakdown;
};
