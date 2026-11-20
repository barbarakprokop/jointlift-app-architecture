/**
 * Transforms a two-sided record into the viewer's own and partner's tasks.
 * Pure UI mapping only: the database remains responsible for permissions.
 */
export function participantView(lift, currentUserId, names = {}) {
  if (currentUserId !== lift.user1Id && currentUserId !== lift.user2Id) {
    throw new Error('Not a participant.');
  }
  const isFirst = currentUserId === lift.user1Id;
  const partnerId = isFirst ? lift.user2Id : lift.user1Id;
  return {
    id: lift.id,
    myTask: isFirst ? lift.user1Task : lift.user2Task,
    partnerTask: isFirst ? lift.user2Task : lift.user1Task,
    myDone: Boolean(isFirst ? lift.user1Done : lift.user2Done),
    partnerDone: Boolean(isFirst ? lift.user2Done : lift.user1Done),
    partnerName: names[partnerId] ?? 'Partner',
  };
}
