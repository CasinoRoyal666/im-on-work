export interface PreparedQuestion {
  question: string;
  options: string[];
  correct: number;
  fact: string;
}

export interface RowResult {
  question: string;
  options: string[];
  chosen: number | null;
  correctIndex: number;
  correct: boolean;
  timedOut: boolean;
  time: number;
}
