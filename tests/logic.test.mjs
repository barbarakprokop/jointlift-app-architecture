import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptInvite, markMyTaskDone, completionState } from '../src/lift-state.mjs';
import { cancelPendingInvitation, cancellationScope } from '../src/invitation-cancellation.mjs';
import { participantView } from '../src/participant-view.mjs';

const pending = { id: 'example-1', user1Id: 'alice', user2Id: 'bob', user1Task: 'Draft the proposal', user2Task: '', user1Done: false, user2Done: false, status: 'pending' };

test('only the invited second person can accept a pending invitation', () => {
  assert.throws(() => acceptInvite(pending, 'third', 'Review proposal'));
  assert.throws(() => acceptInvite(pending, 'alice', 'Review proposal'));
  assert.equal(acceptInvite(pending, 'bob', ' Review proposal ').user2Task, 'Review proposal');
});

test('an accepted invitation cannot be accepted twice', () => {
  const active = acceptInvite(pending, 'bob', 'Review proposal');
  assert.throws(() => acceptInvite(active, 'bob', 'Review proposal'));
});

test('each person completes only their own task', () => {
  const active = acceptInvite(pending, 'bob', 'Review proposal');
  const afterAlice = markMyTaskDone(active, 'alice');
  assert.equal(afterAlice.user1Done, true);
  assert.equal(afterAlice.user2Done, false);
  assert.equal(completionState(afterAlice).awaiting, 'second participant');
  assert.throws(() => markMyTaskDone(active, 'third'));
});

test('completion requires both participants', () => {
  let active = acceptInvite(pending, 'bob', 'Review proposal');
  active = markMyTaskDone(active, 'alice');
  assert.equal(completionState(active).canClose, false);
  active = markMyTaskDone(active, 'bob');
  assert.equal(completionState(active).canClose, true);
});

test('participant-facing task labels reverse with the viewer', () => {
  const active = acceptInvite(pending, 'bob', 'Review proposal');
  assert.equal(participantView(active, 'bob', {alice:'Alex'}).myTask, 'Review proposal');
  assert.equal(participantView(active, 'bob', {alice:'Alex'}).partnerName, 'Alex');
  assert.equal(participantView(active, 'alice').myTask, 'Draft the proposal');
  assert.throws(() => participantView(active, 'third'));
});

test('invitation cancellation requires the correct owner and pending status', () => {
  assert.deepEqual(cancellationScope({id:'invite-1',source:'email_invitation'},'alice'), {
    table:'email_invitations',id:'invite-1',ownerColumn:'inviter_id',ownerId:'alice',status:'pending'
  });
  assert.throws(() => cancellationScope({id:'invite-1',source:'unexpected'},'alice'));
});

test('a pending invite remains visible until deletion is confirmed', async () => {
  const invite = {id:'invite-1',source:'joint_lift'};
  const list = [invite,{id:'invite-1',source:'email_invitation'}];
  await assert.rejects(() => cancelPendingInvitation(list,invite,'alice',async () => null));
  assert.equal(list.length,2);
  const after = await cancelPendingInvitation(list,invite,'alice',async () => ({id:'invite-1'}));
  assert.deepEqual(after,[{id:'invite-1',source:'email_invitation'}]);
});
