/**
 * Synthetic, dependency-free illustration of JointLift's two-person task model.
 * Not a database policy or backend implementation.
 */
const assertParticipant = (lift, userId) => {
  if (userId !== lift.user1Id && userId !== lift.user2Id) {
    throw new Error('Only participants may interact with a JointLift.');
  }
};

export function acceptInvite(lift, recipientId, recipientTask) {
  if (lift.status !== 'pending') throw new Error('Invitation is no longer pending.');
  if (recipientId !== lift.user2Id || recipientId === lift.user1Id) {
    throw new Error('Invitation belongs to another account.');
  }
  if (typeof recipientTask !== 'string' || !recipientTask.trim()) {
    throw new Error('Each participant needs a task.');
  }
  return { ...lift, status: 'active', user2Task: recipientTask.trim() };
}

export function markMyTaskDone(lift, userId) {
  assertParticipant(lift, userId);
  if (lift.status !== 'active') throw new Error('JointLift is not active.');
  return userId === lift.user1Id ? { ...lift, user1Done: true } : { ...lift, user2Done: true };
}

export function completionState(lift) {
  const bothDone = Boolean(lift.user1Done && lift.user2Done);
  return {
    bothDone,
    canClose: lift.status === 'active' && bothDone,
    awaiting: lift.status === 'active' ? (bothDone ? 'none' : lift.user1Done ? 'second participant' : lift.user2Done ? 'first participant' : 'both participants') : 'not active',
  };
}
