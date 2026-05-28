import type { AppData, Exercise, ExerciseTarget, FitnessLevel, WorkoutSession, Plan } from '../lib/domain/types';

export const equipment = [
  { id: 'db-1', type: 'dumbbell', name: '1kg dumbbell', weightKg: 1, active: true },
  { id: 'db-2-5', type: 'dumbbell', name: '2.5kg dumbbell', weightKg: 2.5, active: true },
  { id: 'db-5', type: 'dumbbell', name: '5kg dumbbell', weightKg: 5, active: true },
  { id: 'db-7', type: 'dumbbell', name: '7kg dumbbell', weightKg: 7, active: true },
  { id: 'kb-18', type: 'kettlebell', name: '18kg kettlebell', weightKg: 18, active: true },
  { id: 'jump-rope', type: 'jump_rope', name: 'Jump rope', active: true },
  { id: 'abs-wheel', type: 'abs_wheel', name: 'Abs wheel', active: true },
  { id: 'bodyweight', type: 'bodyweight', name: 'Bodyweight', active: true }
] as const;

const strengthTargets = (beginner: string, improver: string, intermediate: string, advanced: string, metric: ExerciseTarget['metric'] = 'reps'): ExerciseTarget[] => [
  { level: 'beginner', metric, targetText: beginner },
  { level: 'improver', metric, targetText: improver },
  { level: 'intermediate', metric, targetText: intermediate },
  { level: 'advanced', metric, targetText: advanced }
];

const runTargets: ExerciseTarget[] = [
  { level: 'beginner', metric: 'distance', value: 5, unit: 'km', targetText: 'Comfortably finish 5km using walk breaks if needed.' },
  { level: 'improver', metric: 'distance', value: 8, unit: 'km', targetText: 'Reach 7–8km slow run before race day.' },
  { level: 'intermediate', metric: 'pace', value: 420, unit: 'sec_per_km', targetText: 'Hold about 7:00/km for controlled 10K finish.' },
  { level: 'advanced', metric: 'pace', value: 360, unit: 'sec_per_km', targetText: 'Move toward 6:00/km once stamina base is built.' }
];

export const exercises: Exercise[] = [
  ex('jumping-jacks','Jumping Jacks','cardio',['bodyweight'],'easy','beginner',['Stand tall. Jump feet out while raising arms. Return softly.'],['Light feet','Breathe steadily'],['Landing hard'],[], strengthTargets('60 sec smooth','90 sec smooth','2 min smooth','3 min smooth','duration')),
  ex('easy-jump-rope','Easy Jump Rope','cardio',['jump_rope'],'easy','beginner',['Small jumps. Keep elbows near ribs. Turn rope with wrists.'],['Stay relaxed','Tiny jumps'],['Jumping too high'],['Stop if calf/Achilles pain appears'], strengthTargets('1 min relaxed','3 min relaxed','5 min with few trips','10 min easy rhythm','duration'), { image:'/tutorials/exercises/jump-rope/main.svg' }),
  ex('jump-rope','Jump Rope Finisher','cardio',['jump_rope'],'medium','improver',['Use easy rhythm. Keep shoulders relaxed. Switch to march if calves burn.'],['Smooth rhythm','Soft landing'],['Going max effort'],['No hard jump rope if calves are sore'], strengthTargets('90 sec controlled','3 min controlled','5 min controlled','10 min mixed rhythm','duration'), { image:'/tutorials/exercises/jump-rope/main.svg' }),
  ex('fast-feet','Fast Feet','cardio',['bodyweight'],'medium','improver',['Quick small steps in place. Keep arms moving.'],['Fast but controlled','Stay light'],['Stamping feet'],[], strengthTargets('30 sec controlled','45 sec controlled','60 sec sharp','90 sec sharp','duration')),
  ex('high-knees','High Knees','cardio',['bodyweight'],'medium','improver',['Run in place. Lift knees gently. Keep posture tall.'],['Tall chest','Quick arms'],['Leaning back','Overstriding'],[], strengthTargets('30 sec controlled','45 sec controlled','60 sec controlled','90 sec strong','duration')),
  ex('step-back-burpee','Step-back Burpee','cardio',['bodyweight'],'medium','beginner',['Hands down. Step back one foot at a time. Step in. Stand tall.'],['Smooth not frantic','Protect back'],['Slamming feet back'],[], strengthTargets('6 clean reps','10 clean reps','15 clean reps','20 clean reps')),

  ex('bodyweight-squat','Bodyweight Squat','lower',['bodyweight'],'easy','beginner',['Feet shoulder-width. Sit hips back. Stand tall.'],['Knees track toes','Chest proud'],['Knees collapse inward'],[], strengthTargets('15 clean reps','25 clean reps','40 clean reps','60 clean reps')),
  ex('goblet-squat','Goblet Squat','lower',['kettlebell','dumbbell'],'medium','improver',['Hold 18kg kettlebell at chest. Squat under control. Drive through whole foot.'],['Brace core','Do not rush reps'],['Rounding back','Bouncing at bottom'],['Reduce weight if back or knee pain'], strengthTargets('8 reps with 7kg','10 reps with 18kg KB','3 x 10 with 18kg KB','4 x 12 with 18kg KB','weight'), { image:'/tutorials/exercises/goblet-squat/main.png' }),
  ex('reverse-lunge','Reverse Lunge','lower',['bodyweight','dumbbell'],'medium','beginner',['Step back. Drop rear knee gently. Push front foot into floor. Alternate sides.'],['Tall posture','Controlled knee'],['Stepping too narrow'],['Use bodyweight if balance is poor'], strengthTargets('8/side bodyweight','10/side bodyweight','10/side with 5kg DBs','12/side with 7kg DBs')),
  ex('split-squat','Split Squat','lower',['bodyweight','dumbbell'],'medium','improver',['Stagger stance. Drop down slowly. Push through front foot.'],['Stay tall','Control depth'],['Front knee collapsing'],[], strengthTargets('8/side bodyweight','10/side bodyweight','10/side with 5kg DBs','12/side with 7kg DBs')),
  ex('kettlebell-deadlift','Kettlebell Deadlift','lower',['kettlebell'],'medium','beginner',['KB between feet. Hinge hips back. Stand by squeezing glutes.'],['Hips back','Back neutral'],['Squatting instead of hinging','Rounding back'],['Stop if sharp back pain'], strengthTargets('10 reps with 18kg','3 x 10 with 18kg','4 x 10 with 18kg controlled','5 x 10 with 18kg crisp','weight')),
  ex('glute-bridge','Glute Bridge','lower',['bodyweight','dumbbell'],'easy','beginner',['Lie down. Feet planted. Lift hips. Squeeze glutes.'],['Ribs down','Push through heels'],['Arching lower back'],[], strengthTargets('15 bodyweight','25 bodyweight','20 with 7kg DB','30 with 7kg DB')),
  ex('wall-sit','Wall Sit','lower',['bodyweight'],'medium','beginner',['Back on wall. Knees bent. Hold position.'],['Even pressure','Breathe'],['Holding breath'],[], strengthTargets('30 sec','60 sec','90 sec','2 min','duration')),
  ex('calf-raise','Calf Raise','lower',['bodyweight','dumbbell'],'easy','beginner',['Rise onto toes. Pause. Lower slowly.'],['Full range','Slow lower'],['Bouncing'],['Stop if Achilles pain'], strengthTargets('15 reps','25 reps','20 reps holding DBs','30 reps holding DBs')),

  ex('push-up','Push-up','upper',['bodyweight'],'medium','beginner',['Hands under shoulders. Lower as one unit. Press floor away. Use knees if needed.'],['Body straight','Controlled reps'],['Sagging hips'],[], strengthTargets('8 knee push-ups or 3 full','10 full reps','20 full reps','35 full reps'), { image:'/tutorials/exercises/push-up/main.png' }),
  ex('incline-push-up','Incline Push-up','upper',['bodyweight'],'easy','beginner',['Hands on bench/table. Body straight. Lower chest to hands.'],['Straight line','Control'],['Hips sagging'],[], strengthTargets('10 reps','20 reps','30 reps','40 reps')),
  ex('dumbbell-press','Dumbbell Shoulder Press','upper',['dumbbell'],'medium','improver',['Press dumbbells overhead. Lower slowly. Use 5kg or 7kg.'],['Ribs down','No back arch'],['Shrugging shoulders'],['Use lighter weight if shoulder pinches'], strengthTargets('8 reps with 2.5kg','10 reps with 5kg','10 reps with 7kg','15 reps with 7kg','weight')),
  ex('one-arm-row','One-arm Dumbbell Row','upper',['dumbbell'],'medium','beginner',['Hinge. Pull elbow toward hip. Control down.'],['Flat back','Pull with elbow'],['Twisting torso'],[], strengthTargets('10 reps with 5kg','12 reps with 7kg','15 reps with 7kg','20 reps with 7kg','weight')),
  ex('floor-press','Dumbbell Floor Press','upper',['dumbbell'],'medium','beginner',['Lie on floor. Press dumbbells up. Lower elbows to floor softly.'],['Wrists stacked','Slow lower'],['Flaring elbows too wide'],[], strengthTargets('10 reps with 5kg','12 reps with 7kg','15 reps with 7kg','20 reps with 7kg','weight')),
  ex('biceps-curl','Biceps Curl','upper',['dumbbell'],'easy','beginner',['Stand tall. Curl without swinging. Lower slowly.'],['Elbows still','Slow lower'],['Swinging body'],[], strengthTargets('12 reps with 2.5kg','12 reps with 5kg','12 reps with 7kg','20 reps with 7kg','weight')),
  ex('lateral-raise','Lateral Raise','upper',['dumbbell'],'medium','beginner',['Raise arms to side with soft elbows. Lower slowly.'],['Light weight','Control'],['Shrugging','Too heavy'],[], strengthTargets('10 reps with 1kg','12 reps with 2.5kg','15 reps with 2.5kg','12 reps with 5kg','weight')),

  ex('kettlebell-around-the-world','Kettlebell Around the World','core',['kettlebell'],'medium','improver',['Pass kettlebell around waist slowly. Keep ribs down and hips stable. Change direction each round.'],['Brace abs','Do not twist spine'],['Leaning back','Throwing the bell'],['Use lighter option if grip fails'], strengthTargets('10 each way with light option','10 each way with 18kg','3 x 10 each way with 18kg','4 x 12 each way with 18kg','weight'), { image:'/tutorials/exercises/kettlebell-around-the-world/main.svg' }),
  ex('farmer-carry-march','Farmer Carry March','core',['kettlebell','dumbbell'],'medium','beginner',['Hold weight. March slowly. Keep shoulders level.'],['Tall posture','Brace abs'],['Leaning to side'],[], strengthTargets('30 sec with 7kg','45 sec with 18kg KB','60 sec with 18kg KB','90 sec with 18kg KB','duration')),
  ex('suitcase-carry','Suitcase Carry','core',['kettlebell','dumbbell'],'medium','improver',['Hold weight on one side. Walk or march. Keep body straight.'],['No leaning','Slow steps'],['Shrugging shoulder'],[], strengthTargets('30 sec/side with 7kg','45 sec/side with 18kg','60 sec/side with 18kg','90 sec/side with 18kg','duration')),
  ex('mountain-climbers','Mountain Climbers','core',['bodyweight'],'medium','beginner',['High plank. Drive knees forward one at a time.'],['Hands strong','Hips low'],['Bouncing hips too high'],[], strengthTargets('30 sec','45 sec','60 sec','90 sec','duration')),
  ex('plank','Plank','core',['bodyweight'],'medium','beginner',['Elbows under shoulders. Squeeze glutes. Hold.'],['Ribs down','Breathe'],['Lower back sag'],[], strengthTargets('30 sec','60 sec','90 sec','2 min','duration'), { image:'/tutorials/exercises/plank/main.png' }),
  ex('side-plank','Side Plank','core',['bodyweight'],'medium','beginner',['Elbow under shoulder. Lift hips. Hold side line.'],['Hips high','Breathe'],['Rotating forward'],[], strengthTargets('20 sec/side','40 sec/side','60 sec/side','90 sec/side','duration')),
  ex('abs-wheel','Abs Wheel Rollout','core',['abs_wheel'],'hard','improver',['Start on knees. Roll only as far as you can control. Pull back with abs.'],['Stop before back arches','Slow reps'],['Chasing range','Lower back collapse'],['Keep reps low. Stop if back pain'], strengthTargets('3 clean short reps','6 clean reps','10 clean reps','15 clean reps'), { image:'/tutorials/exercises/abs-wheel/main.svg' }),
  ex('dead-bug','Dead Bug','core',['bodyweight'],'easy','beginner',['Lie on back. Opposite arm and leg extend slowly. Keep back down.'],['Slow movement','Back glued down'],['Arching lower back'],[], strengthTargets('8/side','12/side','20/side','30/side')),
  ex('hollow-hold','Hollow Hold','core',['bodyweight'],'hard','improver',['Brace abs. Lift shoulders and legs. Hold shape.'],['Lower back down','Breathe'],['Neck strain'],[], strengthTargets('10 sec tuck','20 sec tuck','30 sec hollow','45 sec hollow','duration')),
  ex('russian-twist','Russian Twist','core',['dumbbell'],'medium','beginner',['Sit tall. Rotate side to side with light dumbbell.'],['Rotate ribs','Control'],['Yanking with arms'],[], strengthTargets('20 reps bodyweight','20 reps with 2.5kg','30 reps with 5kg','40 reps with 5kg')),
  ex('bear-crawl','Bear Crawl','core',['bodyweight'],'hard','improver',['Hands/knees under body. Lift knees. Crawl slowly.'],['Slow and quiet','Brace'],['Hips too high'],[], strengthTargets('20 sec','30 sec','45 sec','60 sec','duration')),

  ex('easy-run','Easy Run','run',['bodyweight'],'medium','beginner',['Run slow enough to speak short sentences. Walk if breathing spikes.'],['Start slower than you think','3-step inhale, 2-step exhale'],['Starting too fast'],['Stop for chest pain or dizziness'], runTargets),
  ex('long-run','Long Slow Run','run',['bodyweight'],'medium','improver',['Build distance slowly. No sprint finish.'],['Relax shoulders','Finish fresh'],['Racing training runs'],['Pain means stop, not push'], runTargets),
  ex('test-run','Test Run','run',['bodyweight'],'medium','improver',['Use this to check progress, not to destroy yourself.'],['Even pace','Record breathing honestly'],['Starting too fast'],[], runTargets),

  ex('calf-stretch','Calf Stretch','mobility',['bodyweight'],'easy','beginner',['One foot back. Heel down. Hold gently. Switch sides.'],['Gentle stretch'],['Bouncing'],[], strengthTargets('30 sec/side','45 sec/side','60 sec/side','90 sec/side','duration')),
  ex('quad-stretch','Quad Stretch','mobility',['bodyweight'],'easy','beginner',['Hold ankle. Knees close. Squeeze glute. Switch sides.'],['Tall posture'],['Arching back'],[], strengthTargets('30 sec/side','45 sec/side','60 sec/side','90 sec/side','duration')),
  ex('hip-openers','Hip Openers','mobility',['bodyweight'],'easy','beginner',['Move hips slowly through circles and lunges.'],['Slow','Pain free'],['Rushing'],[], strengthTargets('60 sec','2 min','3 min','5 min','duration')),
  ex('hamstring-sweep','Hamstring Sweep','mobility',['bodyweight'],'easy','beginner',['One leg forward, toe up. Sweep hands down. Switch sides.'],['Gentle','Keep back long'],['Forcing stretch'],[], strengthTargets('8/side','12/side','20/side','30/side'))
];

function ex(
  id:string,
  name:string,
  category:Exercise['category'],
  equipment:string[],
  difficulty:Exercise['difficulty'],
  level: FitnessLevel,
  instructionSteps:string[],
  coachingCues:string[],
  commonMistakes:string[],
  safetyNotes:string[],
  targets: ExerciseTarget[],
  tutorial?:Exercise['tutorial']
): Exercise {
  const track = category === 'run'
    ? { distance:true, duration:true, effort:true, pain:true }
    : category === 'lower' || category === 'upper' || id === 'abs-wheel' || id.includes('carry')
      ? { completion:true, weight:true, reps:true, duration:true, effort:true, pain:true }
      : { completion:true, duration:true, effort:true, pain:true };
  return { id, slug:id, name, category, equipment, difficulty, level, instructionSteps, coachingCues, commonMistakes, safetyNotes, targets, tutorial, tracking: track };
}

export const sessions: WorkoutSession[] = [
  {
    id:'lower-body-hiit', name:'Lower Body HIIT', type:'hiit', targetDurationMinutes:30, intensity:'hard', goal:'Leg endurance for your 10K without destroying recovery.',
    blocks:[
      { id:'warmup', name:'Warm-up', type:'checklist', items:[
        {exerciseId:'jumping-jacks', durationSeconds:60}, {exerciseId:'bodyweight-squat', durationSeconds:60}, {exerciseId:'hip-openers', durationSeconds:60}, {exerciseId:'easy-jump-rope', durationSeconds:120}
      ]},
      { id:'main', name:'Main Circuit', type:'interval', rounds:3, workSeconds:40, restSeconds:20, items:[
        {exerciseId:'goblet-squat', equipment:'18kg kettlebell'}, {exerciseId:'reverse-lunge', equipment:'bodyweight or 5kg dumbbells'}, {exerciseId:'kettlebell-deadlift', equipment:'18kg kettlebell'}, {exerciseId:'fast-feet', equipment:'bodyweight'}, {exerciseId:'kettlebell-around-the-world', equipment:'18kg kettlebell'}
      ]},
      { id:'finisher', name:'Finisher', type:'timer', items:[{exerciseId:'jump-rope', durationSeconds:180}]},
      { id:'cooldown', name:'Cooldown', type:'checklist', items:[{exerciseId:'calf-stretch', durationSeconds:60},{exerciseId:'quad-stretch', durationSeconds:60}]}
    ]
  },
  {
    id:'upper-body-hiit', name:'Upper Body HIIT', type:'hiit', targetDurationMinutes:30, intensity:'medium', goal:'Upper body conditioning while legs recover.',
    blocks:[
      { id:'warmup', name:'Warm-up', type:'checklist', items:[{exerciseId:'jumping-jacks', durationSeconds:60},{exerciseId:'easy-jump-rope', durationSeconds:60}]},
      { id:'main', name:'Main Circuit', type:'interval', rounds:3, workSeconds:45, restSeconds:15, items:[
        {exerciseId:'dumbbell-press', equipment:'5kg or 7kg dumbbells'}, {exerciseId:'push-up', equipment:'bodyweight'}, {exerciseId:'one-arm-row', equipment:'7kg dumbbell'}, {exerciseId:'kettlebell-around-the-world', equipment:'18kg kettlebell'}, {exerciseId:'floor-press', equipment:'5kg or 7kg dumbbells'}, {exerciseId:'farmer-carry-march', equipment:'18kg kettlebell or 7kg dumbbells'}
      ]},
      { id:'cooldown', name:'Cooldown', type:'checklist', items:[{exerciseId:'calf-stretch', durationSeconds:45}]}
    ]
  },
  {
    id:'core-hiit', name:'Core + Calisthenics HIIT', type:'hiit', targetDurationMinutes:30, intensity:'medium', goal:'Core strength for posture, breathing, and late-run control.',
    blocks:[
      { id:'warmup', name:'Easy rope warm-up', type:'timer', items:[{exerciseId:'easy-jump-rope', durationSeconds:300}]},
      { id:'main', name:'Core Circuit', type:'interval', rounds:3, workSeconds:30, restSeconds:15, items:[
        {exerciseId:'abs-wheel', equipment:'abs wheel', targetReps:'6-10 good reps'}, {exerciseId:'mountain-climbers'}, {exerciseId:'plank'}, {exerciseId:'dead-bug'}, {exerciseId:'hollow-hold'}, {exerciseId:'russian-twist', equipment:'2.5kg or 5kg dumbbell'}
      ]},
      { id:'cooldown', name:'Cooldown', type:'checklist', items:[{exerciseId:'calf-stretch', durationSeconds:60},{exerciseId:'quad-stretch', durationSeconds:60}]}
    ]
  },
  { id:'easy-run-5k', name:'4–5 km Easy Run', type:'run', targetDurationMinutes:40, intensity:'medium', goal:'Slow controlled breathing. No sprint finish.', blocks:[{id:'run', name:'Run', type:'run', items:[{exerciseId:'easy-run', note:'Log distance, time, breathing, effort.'}]}] },
  { id:'long-run-w1', name:'5–6 km Long Slow Run', type:'run', targetDurationMinutes:50, intensity:'medium', goal:'Build distance. Finish relaxed.', blocks:[{id:'run', name:'Run', type:'run', items:[{exerciseId:'long-run'}]}] },
  { id:'long-run-w2', name:'6–7 km Long Slow Run', type:'run', targetDurationMinutes:60, intensity:'medium', goal:'Most important stamina builder.', blocks:[{id:'run', name:'Run', type:'run', items:[{exerciseId:'long-run'}]}] },
  { id:'long-run-w3', name:'7–8 km Confidence Run', type:'run', targetDurationMinutes:70, intensity:'medium', goal:'Confidence run. Do not race it.', blocks:[{id:'run', name:'Run', type:'run', items:[{exerciseId:'long-run'}]}] },
  { id:'mobility-kb', name:'Light Kettlebell + Mobility', type:'mobility', targetDurationMinutes:30, intensity:'easy', goal:'Durability without fatigue.', blocks:[{id:'main', name:'Controlled practice', type:'checklist', items:[{exerciseId:'kettlebell-around-the-world', targetReps:'3 x 10 each way'}, {exerciseId:'kettlebell-deadlift', targetReps:'3 x 10'}, {exerciseId:'farmer-carry-march', durationSeconds:180}, {exerciseId:'calf-stretch', durationSeconds:120}, {exerciseId:'quad-stretch', durationSeconds:120}]}] },
  { id:'race-10k', name:'10K Race Day', type:'run', targetDurationMinutes:90, intensity:'medium', goal:'Start slow, settle in, finish strong. No sprint early.', blocks:[{id:'run', name:'Race', type:'run', items:[{exerciseId:'long-run', note:'Log final 10K time, breathing, effort, and notes.'}]}] },
  { id:'rest', name:'Rest Day', type:'rest', targetDurationMinutes:0, intensity:'rest', goal:'Recover. Walking is fine. No hard training.', blocks:[] }
];

export const plan: Plan = {
  id:'ten-k-forge-2026-06-19', name:'10K Forge - 19 June Plan', version:2, raceDate:'2026-06-19', targetLabel:'Finish first 10K strong',
  days: [
    day('2026-05-27','Wednesday','upper-body-hiit'), day('2026-05-28','Thursday','core-hiit'), day('2026-05-29','Friday','long-run-w1'), day('2026-05-30','Saturday','mobility-kb'), day('2026-05-31','Sunday','rest'),
    day('2026-06-01','Monday','lower-body-hiit'), day('2026-06-02','Tuesday','easy-run-5k'), day('2026-06-03','Wednesday','upper-body-hiit'), day('2026-06-04','Thursday','core-hiit'), day('2026-06-05','Friday','long-run-w2'), day('2026-06-06','Saturday','mobility-kb'), day('2026-06-07','Sunday','rest'),
    day('2026-06-08','Monday','lower-body-hiit'), day('2026-06-09','Tuesday','easy-run-5k'), day('2026-06-10','Wednesday','upper-body-hiit'), day('2026-06-11','Thursday','core-hiit'), day('2026-06-12','Friday','long-run-w3'), day('2026-06-13','Saturday','mobility-kb'), day('2026-06-14','Sunday','rest'),
    day('2026-06-15','Monday','core-hiit'), day('2026-06-16','Tuesday','easy-run-5k'), day('2026-06-17','Wednesday','rest'), day('2026-06-18','Thursday','rest'), day('2026-06-19','Friday','race-10k')
  ]
};
function day(date:string, dayName:string, sessionId:string){ return { date, dayName, sessionId }; }

export const defaultAppData: AppData = {
  schemaVersion: 2,
  storageStatus: { persistentRequested: false, persistentGranted: false },
  profile: {
    id:'me', raceDate:'2026-06-19', goal:'Finish 10K strong', preferredSessionMinutes:30, reminderTime:'07:00', units:'km',
    bodyWeightKg: 78, lifestyle: 'desk_it', dietQuality: 'partial_healthy', staminaLevel: 'low', targetLevel: 'improver'
  },
  equipment: equipment as any,
  exercises,
  sessions,
  plan,
  sessionLogs: {},
  exerciseLogs: {},
  runLogs: {},
  weightLogs: {}
};
