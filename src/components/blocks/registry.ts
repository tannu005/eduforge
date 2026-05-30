import { BlockType } from '../../types';

export interface BlockDefinition {
  type: BlockType;
  name: string;
  description: string;
  category: 'content' | 'interactive' | 'utility' | 'gamification';
  icon: string;
  defaultContent: any;
}

export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {
  'rich-text': {
    type: 'rich-text',
    name: 'Rich Text',
    description: 'WYSIWYG editor with headings, bold, lists, and quotes',
    category: 'content',
    icon: 'Type',
    defaultContent: {
      html: '<p>Start typing financial insights here. Double click or highlight text to format...</p>',
    },
  },
  image: {
    type: 'image',
    name: 'Image Block',
    description: 'Upload or URL-based image with alt text and captions',
    category: 'content',
    icon: 'Image',
    defaultContent: {
      url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
      alt: 'Financial education overview',
      caption: 'EduForge Module Illustration',
      alignment: 'center',
    },
  },
  video: {
    type: 'video',
    name: 'Video Embed',
    description: 'YouTube or Vimeo responsive video parser',
    category: 'content',
    icon: 'Video',
    defaultContent: {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      provider: 'youtube',
      videoId: 'dQw4w9WgXcQ',
    },
  },
  'quiz-mcq': {
    type: 'quiz-mcq',
    name: 'Multiple-Choice Quiz',
    description: 'MCQ with explanation per option, timer, and score rules',
    category: 'interactive',
    icon: 'HelpCircle',
    defaultContent: {
      question: 'What is the primary benefit of compounding interest?',
      options: [
        {
          text: 'It grows wealth exponentially by earning interest on interest',
          isCorrect: true,
          explanation: 'Correct! Compounding adds accumulated interest back into the principal, growing your wealth exponentially.',
        },
        {
          text: 'It guarantees zero tax liability on your investments',
          isCorrect: false,
          explanation: 'Compounding interest does not affect your tax obligations directly.',
        },
        {
          text: 'It automatically decreases your credit card interest',
          isCorrect: false,
          explanation: 'Credit cards compound interest on debt, which increases what you owe, not decreases it!',
        },
      ],
      points: 10,
      attemptLimit: 1,
      hasTimer: false,
      timerSeconds: 60,
    },
  },
  'quiz-tf': {
    type: 'quiz-tf',
    name: 'True / False Quiz',
    description: 'Binary choice question with dynamic feedback explanations',
    category: 'interactive',
    icon: 'CheckSquare',
    defaultContent: {
      question: 'A Systematic Investment Plan (SIP) guarantees high positive returns on investments.',
      isTrueCorrect: false,
      explanation: 'SIPs reduce market timing risk via rupee cost averaging, but they do not eliminate market volatility or guarantee positive returns.',
      points: 10,
      attemptLimit: 1,
      hasTimer: false,
      timerSeconds: 30,
    },
  },
  'emi-calc': {
    type: 'emi-calc',
    name: 'EMI Calculator',
    description: 'EMI slider inputs with responsive SVG Doughnut & monthly table',
    category: 'interactive',
    icon: 'Calculator',
    defaultContent: {
      principal: 500000,
      rate: 8.5,
      tenure: 120, // 10 years
      tenureUnit: 'months',
    },
  },
  'sip-calc': {
    type: 'sip-calc',
    name: 'SIP Calculator',
    description: 'SIP visual wealth accumulation slider & cumulative chart',
    category: 'interactive',
    icon: 'TrendingUp',
    defaultContent: {
      monthlyInvestment: 5000,
      expectedReturn: 12,
      durationYears: 10,
    },
  },
  'compound-calc': {
    type: 'compound-calc',
    name: 'Compound Interest',
    description: 'Frequency compounder with dynamic growth curves',
    category: 'interactive',
    icon: 'Percent',
    defaultContent: {
      principal: 100000,
      rate: 8,
      timeYears: 5,
      frequency: 'annually',
    },
  },
  callout: {
    type: 'callout',
    name: 'Callout Box',
    description: 'Highlighted note boxes with warning, info, tip and alert icons',
    category: 'content',
    icon: 'AlertCircle',
    defaultContent: {
      type: 'tip',
      content: 'Tip: Start investing early in your career to give compounding the maximum time to work its magic!',
    },
  },
  divider: {
    type: 'divider',
    name: 'Divider Line',
    description: 'Custom separator line spacing and graphical accents',
    category: 'utility',
    icon: 'Minus',
    defaultContent: {
      style: 'solid',
      spacing: 'normal',
    },
  },
  accordion: {
    type: 'accordion',
    name: 'Accordion / FAQ',
    description: 'Expandable/collapsible content groups for Q&A structures',
    category: 'content',
    icon: 'ListCollapse',
    defaultContent: {
      items: [
        {
          title: 'What is a Mutual Fund?',
          content: 'A mutual fund pools money from multiple investors to purchase a diversified portfolio of stocks, bonds, or other securities managed by a professional fund manager.',
        },
        {
          title: 'What is Rupee Cost Averaging?',
          content: 'It is the practice of investing a fixed amount of money at regular intervals, buying more units when prices are low and fewer when prices are high, averaging the cost over time.',
        },
      ],
    },
  },
  progress: {
    type: 'progress',
    name: 'Progress Tracker',
    description: 'Visualize milestones in linear or branching course flows',
    category: 'utility',
    icon: 'Milestone',
    defaultContent: {
      steps: [
        { label: 'Budgeting basics' },
        { label: 'Emergency fund creation' },
        { label: 'Clearing high-interest debt' },
        { label: 'Investing surplus cash' },
      ],
      currentStep: 0,
      isBranching: false,
    },
  },
  badge: {
    type: 'badge',
    name: 'Achievement Badge',
    description: 'Unlock animated badges with customizable criteria',
    category: 'gamification',
    icon: 'Award',
    defaultContent: {
      icon: 'trending-up',
      title: 'Wealth Master',
      description: 'Mastered the principles of compounding growth and systematic investing.',
      unlockCondition: 'Complete the SIP and Compounding calculations in this module',
      isUnlocked: false,
    },
  },
  code: {
    type: 'code',
    name: 'Code Snippet',
    description: 'Formatted financial algorithms with direct copy option',
    category: 'content',
    icon: 'Code2',
    defaultContent: {
      code: 'function calculateCompoundInterest(P, r, t, n) {\n  return P * Math.pow(1 + r / (n * 100), n * t);\n}',
      language: 'javascript',
    },
  },
  explainer: {
    type: 'explainer',
    name: 'Animated Explainer',
    description: 'Step-by-step visual explainer with auto-play sliders',
    category: 'gamification',
    icon: 'Layers',
    defaultContent: {
      steps: [
        {
          title: 'Identify your Goals',
          description: 'Define short-term (e.g. vacation) and long-term (e.g. retirement) financial milestones.',
        },
        {
          title: 'Automate your Savings',
          description: 'Set up standing instructions to invest a percentage of your salary the day it arrives.',
        },
        {
          title: 'Rebalance Annually',
          description: 'Check your asset allocation and rebalance back to your target risk profile.',
        },
      ],
      autoPlay: false,
      autoPlaySpeed: 5,
    },
  },
};
