import { describe, it, expect } from 'vitest';
import { 
  formatIndianNumber, calculateEMI, 
  calculateSIP, calculateCompoundInterest 
} from './financial';

describe('Financial Utilities Unit Tests', () => {
  describe('formatIndianNumber', () => {
    it('should format small numbers without commas', () => {
      expect(formatIndianNumber(500)).toBe('500');
    });

    it('should format thousands correctly (Indian style)', () => {
      expect(formatIndianNumber(15000)).toBe('15,000');
    });

    it('should format lakhs correctly (Indian style)', () => {
      expect(formatIndianNumber(500000)).toBe('5,00,000');
      expect(formatIndianNumber(2500000)).toBe('25,00,000');
    });

    it('should format crores correctly (Indian style)', () => {
      expect(formatIndianNumber(10000000)).toBe('1,00,00,000');
      expect(formatIndianNumber(123456789)).toBe('12,34,56,789');
    });

    it('should respect decimal places', () => {
      expect(formatIndianNumber(123456.789, 2)).toBe('1,23,456.79');
    });
  });

  describe('calculateEMI', () => {
    it('should calculate accurate monthly EMI (compounded monthly)', () => {
      // Test with ₹5,00,000 at 8.5% for 240 months
      const { monthlyEmi, totalInterest, totalPayment } = calculateEMI(500000, 8.5, 240);
      expect(Math.round(monthlyEmi)).toBe(4339);
      expect(Math.round(totalPayment)).toBe(1041388);
      expect(Math.round(totalInterest)).toBe(541388);
    });

    it('should handle zero interest rate (interest-free EMI)', () => {
      const { monthlyEmi, totalInterest } = calculateEMI(12000, 0, 12);
      expect(monthlyEmi).toBe(1000);
      expect(totalInterest).toBe(0);
    });
  });

  describe('calculateSIP', () => {
    it('should calculate accurate SIP Future Value using Annuity-Due method', () => {
      // Test with ₹5,000 monthly, 12% expected annual return, for 10 years (120 months)
      const { futureValue, totalInvested, wealthGained } = calculateSIP(5000, 12, 10);
      
      // Annuity-due checks: P * (((1+r)^n - 1)/r) * (1+r)
      // Standard ordinary annuity would yield ~1,120,442
      // Annuity due variant yields ~1,131,646 (approximately 1% higher)
      expect(Math.round(totalInvested)).toBe(600000);
      expect(Math.round(futureValue)).toBe(1161695); // Due variant matches exactly
      expect(Math.round(wealthGained)).toBe(561695);
    });
  });

  describe('calculateCompoundInterest', () => {
    it('should calculate accurate lump sum compound interest', () => {
      // ₹1,00,000 compounding annually at 8% for 5 years
      const resultAnnually = calculateCompoundInterest(100000, 8, 5, 'annually');
      expect(Math.round(resultAnnually.futureValue)).toBe(146933);
      expect(Math.round(resultAnnually.interestEarned)).toBe(46933);

      // ₹1,00,000 compounding monthly at 8% for 5 years
      const resultMonthly = calculateCompoundInterest(100000, 8, 5, 'monthly');
      expect(Math.round(resultMonthly.futureValue)).toBe(148985);
    });
  });
});
