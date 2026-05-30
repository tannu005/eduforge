export type BlockType =
  | 'rich-text'
  | 'image'
  | 'video'
  | 'quiz-mcq'
  | 'quiz-tf'
  | 'emi-calc'
  | 'sip-calc'
  | 'compound-calc'
  | 'callout'
  | 'divider'
  | 'accordion'
  | 'progress'
  | 'badge'
  | 'code'
  | 'explainer';

export interface BlockSettings {
  isVisible: boolean;
  isLocked: boolean;
  customCss?: string;
}

export interface Block<T = any> {
  id: string;
  type: BlockType;
  order: number;
  content: T;
  settings: BlockSettings;
}

export interface ModuleMetadata {
  estimatedDuration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  thumbnail: string;
}

export interface QuizConfig {
  feedbackMode: 'immediate' | 'deferred';
  passingScore: number; // percentage, e.g. 70
  showScoreOnCompletion: boolean;
}

export interface Module {
  moduleId: string;
  title: string;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
  };
  metadata: ModuleMetadata;
  blocks: Block[];
  quizConfig: QuizConfig;
}

// Specific Content Types for the Blocks
export interface RichTextContent {
  html: string;
}

export interface ImageContent {
  url: string;
  alt: string;
  caption: string;
  alignment: 'left' | 'center' | 'right' | 'full-width';
}

export interface VideoContent {
  url: string;
  provider: 'youtube' | 'vimeo' | null;
  videoId: string | null;
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface QuizMcqContent {
  question: string;
  options: QuizOption[];
  points: number;
  attemptLimit: number; // 0 for unlimited
  hasTimer: boolean;
  timerSeconds: number;
}

export interface QuizTfContent {
  question: string;
  isTrueCorrect: boolean;
  explanation: string;
  points: number;
  attemptLimit: number;
  hasTimer: boolean;
  timerSeconds: number;
}

export interface EmiCalcContent {
  principal: number; // default 500000
  rate: number;      // default 8.5
  tenure: number;    // default 240
  tenureUnit: 'months' | 'years';
}

export interface SipCalcContent {
  monthlyInvestment: number; // default 5000
  expectedReturn: number;    // default 12
  durationYears: number;     // default 15
}

export interface CompoundCalcContent {
  principal: number; // default 100000
  rate: number;      // default 8
  timeYears: number; // default 10
  frequency: 'monthly' | 'quarterly' | 'half-yearly' | 'annually';
}

export interface CalloutContent {
  type: 'info' | 'warning' | 'tip' | 'important' | 'danger';
  content: string;
  icon?: string;
}

export interface DividerContent {
  style: 'solid' | 'dashed' | 'dotted' | 'decorative';
  spacing: 'compact' | 'normal' | 'spacious';
}

export interface AccordionItem {
  title: string;
  content: string;
}

export interface AccordionContent {
  items: AccordionItem[];
}

export interface ProgressStep {
  label: string;
}

export interface ProgressContent {
  steps: ProgressStep[];
  currentStep: number;
  isBranching: boolean;
}

export interface BadgeContent {
  icon: string; // Key of pre-defined icons
  title: string;
  description: string;
  unlockCondition: string;
  isUnlocked: boolean;
}

export interface CodeContent {
  code: string;
  language: 'javascript' | 'python' | 'json' | 'sql';
}

export interface ExplainerStep {
  title: string;
  description: string;
}

export interface ExplainerContent {
  steps: ExplainerStep[];
  autoPlay: boolean;
  autoPlaySpeed: number; // in seconds
}
