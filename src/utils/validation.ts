import { Module, Block } from '../types';

export interface ValidationError {
  severity: 'Blocking' | 'Warning';
  message: string;
  field?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const validateModuleJSON = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== 'object') {
    errors.push({ severity: 'Blocking', message: 'Module JSON must be a valid object.' });
    return errors;
  }

  // 1. Module Title and Basics
  if (!data.title || typeof data.title !== 'string' || data.title.trim() === '') {
    errors.push({ severity: 'Blocking', message: 'Module title is required.', field: 'title' });
  } else if (data.title.length > 200) {
    errors.push({ severity: 'Warning', message: 'Module title exceeds 200 characters.', field: 'title' });
  }

  if (data.description && data.description.length > 1000) {
    errors.push({ severity: 'Warning', message: 'Module description exceeds 1000 characters.', field: 'description' });
  }

  // 2. Block Count
  const blocks = data.blocks;
  if (!Array.isArray(blocks)) {
    errors.push({ severity: 'Blocking', message: 'Module must contain a "blocks" array.', field: 'blocks' });
    return errors;
  }

  if (blocks.length === 0) {
    errors.push({ severity: 'Blocking', message: 'Module must contain at least one block.', field: 'blocks' });
  }

  if (blocks.length > 200) {
    errors.push({ severity: 'Warning', message: 'Module exceeds maximum block count (200).', field: 'blocks' });
  }

  // 3. Block-Level Validations
  const orders = new Set<number>();
  const ids = new Set<string>();

  blocks.forEach((block: any, index: number) => {
    const blockName = block.type ? `[${block.type} Block]` : `Block #${index + 1}`;
    
    // Check ID and formats
    if (!block.id) {
      errors.push({ severity: 'Blocking', message: `Block #${index + 1} is missing an ID.` });
    } else {
      if (ids.has(block.id)) {
        errors.push({ severity: 'Blocking', message: `Internal error: duplicate block ID detected (${block.id}).` });
      }
      ids.add(block.id);

      if (!UUID_REGEX.test(block.id) && !block.id.startsWith('block-')) {
        errors.push({ severity: 'Blocking', message: `Internal error: invalid block ID format (${block.id}).` });
      }
    }

    // Check Block Order
    if (typeof block.order !== 'number') {
      errors.push({ severity: 'Blocking', message: `${blockName} is missing "order" parameter.` });
    } else {
      if (orders.has(block.order)) {
        errors.push({ severity: 'Blocking', message: `Internal error: duplicate block order detected (${block.order}).` });
      }
      orders.add(block.order);
    }

    if (!block.type) {
      errors.push({ severity: 'Blocking', message: `Block #${index + 1} has undefined type.` });
      return;
    }

    const content = block.content || {};

    // 4. Specific Block Type Schemas
    if (block.type === 'image') {
      if (!content.alt || content.alt.trim() === '') {
        errors.push({ severity: 'Warning', message: `Image ${blockName} is missing alt text (accessibility).`, field: `blocks.${index}.content.alt` });
      }
    }

    if (block.type === 'quiz-mcq') {
      const question = content.question || '';
      if (question.length < 10) {
        errors.push({ severity: 'Blocking', message: `Quiz MCQ ${blockName} question must have at least 10 characters.` });
      } else if (question.length > 500) {
        errors.push({ severity: 'Warning', message: `Quiz MCQ ${blockName} question exceeds 500 characters.` });
      }

      const options = content.options;
      if (!Array.isArray(options) || options.length < 2) {
        errors.push({ severity: 'Blocking', message: `Quiz MCQ ${blockName} must have at least 2 options.` });
      } else {
        if (options.length > 6) {
          errors.push({ severity: 'Blocking', message: `Quiz MCQ ${blockName} can have a maximum of 6 options.` });
        }
        
        const hasCorrect = options.some((opt: any) => opt.isCorrect === true);
        if (!hasCorrect) {
          errors.push({ severity: 'Blocking', message: `Quiz MCQ ${blockName} must have at least one correct answer.` });
        }

        options.forEach((opt: any, oIdx: number) => {
          if (opt.text && opt.text.length > 200) {
            errors.push({ severity: 'Warning', message: `Quiz MCQ ${blockName} option #${oIdx + 1} text exceeds 200 characters.` });
          }
          if (opt.explanation && opt.explanation.length > 300) {
            errors.push({ severity: 'Warning', message: `Quiz MCQ ${blockName} option #${oIdx + 1} explanation exceeds 300 characters.` });
          }
        });
      }
    }

    if (block.type === 'quiz-tf') {
      const question = content.question || '';
      if (question.length < 10) {
        errors.push({ severity: 'Blocking', message: `Quiz True/False ${blockName} question must have at least 10 characters.` });
      }
    }

    if (block.type === 'emi-calc') {
      const { principal, rate, tenure } = content;
      if (principal < 10000 || principal > 100000000) {
        errors.push({ severity: 'Blocking', message: `EMI Calculator ${blockName} has invalid input ranges. Principal must be between ₹10,000 and ₹10,00,00,000.` });
      }
      if (rate < 1 || rate > 36) {
        errors.push({ severity: 'Blocking', message: `EMI Calculator ${blockName} has invalid input ranges. Interest Rate must be between 1% and 36%.` });
      }
      if (tenure < 1 || tenure > 360) {
        errors.push({ severity: 'Blocking', message: `EMI Calculator ${blockName} has invalid input ranges. Tenure must be between 1 and 360 months.` });
      }
    }

    if (block.type === 'sip-calc') {
      const { monthlyInvestment, expectedReturn, durationYears } = content;
      if (monthlyInvestment < 500 || monthlyInvestment > 1000000) {
        errors.push({ severity: 'Blocking', message: `SIP Calculator ${blockName} investment must be between ₹500 and ₹10,00,000.` });
      }
      if (expectedReturn < 1 || expectedReturn > 30) {
        errors.push({ severity: 'Blocking', message: `SIP Calculator ${blockName} return must be between 1% and 30%.` });
      }
      if (durationYears < 1 || durationYears > 40) {
        errors.push({ severity: 'Blocking', message: `SIP Calculator ${blockName} duration must be between 1 and 40 years.` });
      }
    }

    if (block.type === 'accordion') {
      const items = content.items;
      if (!Array.isArray(items) || items.length === 0) {
        errors.push({ severity: 'Blocking', message: `Accordion ${blockName} must have at least one item.` });
      }
    }

    if (block.type === 'progress') {
      const steps = content.steps;
      if (!Array.isArray(steps) || steps.length < 2) {
        errors.push({ severity: 'Blocking', message: `Progress Tracker ${blockName} requires at least 2 steps.` });
      }
    }

    if (block.type === 'explainer') {
      const steps = content.steps;
      if (!Array.isArray(steps) || steps.length < 3) {
        errors.push({ severity: 'Blocking', message: `Animated Explainer ${blockName} requires at least 3 steps.` });
      }
    }
  });

  return errors;
};
