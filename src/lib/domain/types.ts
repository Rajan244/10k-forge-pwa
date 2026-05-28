export type TabId = 'home' | 'start' | 'dashboard' | 'plan' | 'profile';
export type SessionType = 'hiit' | 'run' | 'mobility' | 'rest';
export type BlockType = 'checklist' | 'interval' | 'timer' | 'run';
export type Intensity = 'easy' | 'medium' | 'hard' | 'rest';
export type FitnessLevel = 'beginner' | 'improver' | 'intermediate' | 'advanced';

export type Equipment = {
  id: string;
  type: 'dumbbell' | 'kettlebell' | 'jump_rope' | 'abs_wheel' | 'bodyweight';
  name: string;
  weightKg?: number;
  active: boolean;
};

export type TrackingSchema = {
  completion?: boolean;
  weight?: boolean;
  reps?: boolean;
  sets?: boolean;
  duration?: boolean;
  distance?: boolean;
  effort?: boolean;
  pain?: boolean;
};

export type ExerciseTarget = {
  level: FitnessLevel;
  metric: 'reps' | 'duration' | 'weight' | 'distance' | 'pace' | 'completion';
  targetText: string;
  value?: number;
  unit?: 'reps' | 'sec' | 'kg' | 'km' | 'sec_per_km' | 'sessions';
  note?: string;
};

export type Exercise = {
  id: string;
  slug: string;
  name: string;
  category: 'upper' | 'lower' | 'core' | 'cardio' | 'mobility' | 'run';
  equipment: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  level: FitnessLevel;
  instructionSteps: string[];
  coachingCues: string[];
  commonMistakes: string[];
  safetyNotes: string[];
  targets: ExerciseTarget[];
  tutorial?: {
    image?: string;
    video?: string;
  };
  tracking: TrackingSchema;
};

export type SessionItem = {
  exerciseId: string;
  durationSeconds?: number;
  targetReps?: string;
  equipment?: string;
  note?: string;
};

export type SessionBlock = {
  id: string;
  name: string;
  type: BlockType;
  rounds?: number;
  workSeconds?: number;
  restSeconds?: number;
  items: SessionItem[];
};

export type WorkoutSession = {
  id: string;
  name: string;
  type: SessionType;
  targetDurationMinutes: number;
  intensity: Intensity;
  goal: string;
  blocks: SessionBlock[];
};

export type PlannedDay = {
  date: string;
  dayName: string;
  sessionId: string;
};

export type Plan = {
  id: string;
  name: string;
  version: number;
  raceDate: string;
  targetLabel?: string;
  days: PlannedDay[];
};

export type SessionLog = {
  id: string;
  planId: string;
  sessionId: string;
  scheduledDate: string;
  completedAt: string;
  durationSeconds: number;
  status: 'completed' | 'partial' | 'skipped';
  effort: number;
  energyAfter: 'low' | 'normal' | 'good';
  pain: boolean;
  painNotes?: string;
  notes?: string;
};

export type ExerciseLog = {
  id: string;
  sessionLogId: string;
  exerciseId: string;
  completed: boolean;
  sets?: number;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  distanceKm?: number;
  effort?: number;
  notes?: string;
};

export type RunLog = {
  id: string;
  sessionLogId?: string;
  date: string;
  runType: 'easy' | 'long' | 'test' | 'race';
  distanceKm: number;
  durationSeconds: number;
  paceSecondsPerKm: number;
  effort: number;
  breathing: 'good' | 'okay' | 'bad';
  walkBreaks: number;
  notes?: string;
};

export type WeightLog = {
  id: string;
  date: string;
  weightKg: number;
};


export type UserProfile = {
  id: string;
  raceDate: string;
  goal: string;
  preferredSessionMinutes: number;
  reminderTime: string;
  units: 'km' | 'miles';
  bodyWeightKg: number;
  lifestyle: 'desk_it' | 'active' | 'mixed';
  dietQuality: 'needs_work' | 'partial_healthy' | 'strong';
  staminaLevel: 'low' | 'medium' | 'high';
  targetLevel: FitnessLevel;
};

export type StorageStatus = {
  persistentRequested: boolean;
  persistentGranted: boolean;
  checkedAt?: string;
};

export type AppData = {
  schemaVersion: number;
  storageStatus: StorageStatus;
  profile: UserProfile;
  equipment: Equipment[];
  exercises: Exercise[];
  sessions: WorkoutSession[];
  plan: Plan;
  sessionLogs: Record<string, SessionLog>;
  exerciseLogs: Record<string, ExerciseLog>;
  runLogs: Record<string, RunLog>;
  weightLogs: Record<string, WeightLog>;
};
