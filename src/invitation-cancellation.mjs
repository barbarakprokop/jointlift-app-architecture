/**
 * Adaptation of the invitation-cancellation reliability decision.
 * DB authorization and row-level security must be enforced separately.
 */
export function cancellationScope(invitation, currentUserId) {
  if (!currentUserId) throw new Error('Authentication required.');
  if (!['joint_lift', 'email_invitation'].includes(invitation.source)) throw new Error('Unknown invitation type.');
  return {
    table: invitation.source === 'joint_lift' ? 'joint_lifts' : 'email_invitations',
    id: invitation.id,
    ownerColumn: invitation.source === 'joint_lift' ? 'user_1_id' : 'inviter_id',
    ownerId: currentUserId,
    status: 'pending',
  };
}

export async function cancelPendingInvitation(sentInvites, invitation, currentUserId, deleteConfirmed) {
  const scope = cancellationScope(invitation, currentUserId);
  const deleted = await deleteConfirmed(scope);
  if (!deleted || deleted.id !== invitation.id) {
    throw new Error('The pending invitation could not be found.');
  }
  return sentInvites.filter(item => !(item.id === invitation.id && item.source === invitation.source));
}
