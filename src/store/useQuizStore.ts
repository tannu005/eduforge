import { create } from 'zustand';

export interface StudentQuizState {
  selectedOptions: number[]; // Indicies of options selected
  isSubmitted: boolean;
  isCorrect: boolean | null;
  attempts: number;
  score: number;
  timeSpent: number;
}

interface QuizStoreState {
  quizzes: Record<string, StudentQuizState>;
  unlockedBadgeIds: string[];
  totalScore: number;
  maxPossibleScore: number;

  // Actions
  selectOption: (blockId: string, optionIndex: number, isMultiSelect?: boolean) => void;
  submitAnswer: (blockId: string, correctIndices: number[], maxPoints: number, isPartialAllowed?: boolean) => void;
  incrementTimeSpent: (blockId: string) => void;
  resetQuiz: (blockId: string) => void;
  resetAll: () => void;

  // Badges
  unlockBadge: (badgeId: string) => void;
  resetBadges: () => void;
}

const INITIAL_QUIZ_STATE: StudentQuizState = {
  selectedOptions: [],
  isSubmitted: false,
  isCorrect: null,
  attempts: 0,
  score: 0,
  timeSpent: 0,
};

export const useQuizStore = create<QuizStoreState>((set, get) => {
  const recalculateTotalScores = (quizzes: Record<string, StudentQuizState>) => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    Object.values(quizzes).forEach((q) => {
      totalScore += q.score;
      // We'll calculate maxPossibleScore elsewhere or aggregate it based on submitted items
    });

    return { totalScore };
  };

  return {
    quizzes: {},
    unlockedBadgeIds: [],
    totalScore: 0,
    maxPossibleScore: 0,

    selectOption: (blockId, optionIndex, isMultiSelect = false) => {
      set((state) => {
        const quiz = state.quizzes[blockId] || { ...INITIAL_QUIZ_STATE };
        if (quiz.isSubmitted) return {}; // Prevent modifications after submission

        let newSelected: number[];
        if (isMultiSelect) {
          newSelected = quiz.selectedOptions.includes(optionIndex)
            ? quiz.selectedOptions.filter((i) => i !== optionIndex)
            : [...quiz.selectedOptions, optionIndex];
        } else {
          newSelected = [optionIndex];
        }

        const updatedQuizzes = {
          ...state.quizzes,
          [blockId]: {
            ...quiz,
            selectedOptions: newSelected,
          },
        };

        return { quizzes: updatedQuizzes };
      });
    },

    submitAnswer: (blockId, correctIndices, maxPoints, isPartialAllowed = false) => {
      set((state) => {
        const quiz = state.quizzes[blockId] || { ...INITIAL_QUIZ_STATE };
        if (quiz.isSubmitted) return {};

        const selected = quiz.selectedOptions;
        if (selected.length === 0) return {}; // Nothing selected

        // Evaluate correctness
        const isExactlyCorrect =
          selected.length === correctIndices.length &&
          selected.every((val) => correctIndices.includes(val));

        let scoreEarned = 0;
        let isCorrect: boolean | null = false;

        if (isExactlyCorrect) {
          scoreEarned = maxPoints;
          isCorrect = true;
        } else if (isPartialAllowed) {
          // Calculate partial credit
          const correctSelected = selected.filter((val) => correctIndices.includes(val)).length;
          const wrongSelected = selected.length - correctSelected;
          
          const fraction = correctSelected / correctIndices.length;
          // Deduct penalty for wrong selections to avoid cheating by selecting everything
          const adjustedFraction = Math.max(0, fraction - wrongSelected * 0.25);
          scoreEarned = Math.round(adjustedFraction * maxPoints);
          isCorrect = scoreEarned > 0 ? (scoreEarned === maxPoints ? true : null) : false; // null represents partially correct
        }

        const updatedQuizzes = {
          ...state.quizzes,
          [blockId]: {
            ...quiz,
            isSubmitted: true,
            isCorrect,
            attempts: quiz.attempts + 1,
            score: scoreEarned,
          },
        };

        const { totalScore } = recalculateTotalScores(updatedQuizzes);

        return {
          quizzes: updatedQuizzes,
          totalScore,
        };
      });
    },

    incrementTimeSpent: (blockId) => {
      set((state) => {
        const quiz = state.quizzes[blockId] || { ...INITIAL_QUIZ_STATE };
        return {
          quizzes: {
            ...state.quizzes,
            [blockId]: {
              ...quiz,
              timeSpent: quiz.timeSpent + 1,
            },
          },
        };
      });
    },

    resetQuiz: (blockId) => {
      set((state) => {
        const quiz = state.quizzes[blockId] || { ...INITIAL_QUIZ_STATE };
        const updatedQuizzes = {
          ...state.quizzes,
          [blockId]: {
            ...INITIAL_QUIZ_STATE,
            attempts: quiz.attempts, // Retain attempt counts across resets
          },
        };

        const { totalScore } = recalculateTotalScores(updatedQuizzes);

        return {
          quizzes: updatedQuizzes,
          totalScore,
        };
      });
    },

    resetAll: () => {
      set({ quizzes: {}, totalScore: 0 });
    },

    unlockBadge: (badgeId) => {
      set((state) => {
        if (state.unlockedBadgeIds.includes(badgeId)) return {};
        return {
          unlockedBadgeIds: [...state.unlockedBadgeIds, badgeId],
        };
      });
    },

    resetBadges: () => {
      set({ unlockedBadgeIds: [] });
    },
  };
});
