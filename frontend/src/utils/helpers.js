export function getJourneyLevel(state) {
  if (!state) return 0;
  if (state === 'NEW_USER') return 0;
  if (state === 'ELIGIBILITY_CHECKED') return 1;
  if (state === 'VERIFICATION_CHECKED') return 2;
  if (state === 'REGISTERED' || state === 'REGISTRATION_IN_PROGRESS') return 3;
  if (state === 'READY_TO_VOTE' || state === 'ACTIVATED' || state === 'READY') return 4;
  return 0;
}

export function getJourneySteps(state) {
  const level = getJourneyLevel(state);
  return [
    { label: 'Eligibility', status: level >= 1 ? 'Completed' : 'Pending', active: level >= 1 },
    { label: 'Verification', status: level >= 2 ? 'Completed' : 'Pending', active: level >= 2 },
    { label: 'Registration', status: level >= 3 ? 'Completed' : 'Pending', active: level >= 3 },
    { label: 'Vote Ready', status: level >= 4 ? 'Ready' : 'Locked', active: level >= 4 },
  ];
}

export function formatStateLabel(state) {
  return state ? state.replaceAll('_', ' ') : 'NEW USER';
}
