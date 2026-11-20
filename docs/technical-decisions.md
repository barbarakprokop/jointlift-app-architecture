# Technical decisions and limitations

This public companion was prepared from a read only inspection of the private `barbarakprokop/jointlift` GitHub repository on 20 November 2026. It is not the production application's source code.

## Two person product model

A JointLift has an inviter, an invitee, two tasks, and separate completion flags. In `JointLiftContext.tsx`, the app determines whether the authenticated user is participant one or participant two, then maps the same stored row into consistent `myTask`, `partnerTask`, `myDone`, and `partnerDone` UI fields. A useful design detail: the interaction model stays the same regardless of who initiated the commitment.

## Invitation state and permissions

`IncomingInviteScreen.tsx` validates that the invitation exists, is pending, belongs to the signed in invitee, and was not sent by the invitee themselves. Its update filters the invitation ID, invited user ID and pending status. These are useful client safeguards and narrow query conditions, **not a replacement for database row level security**.

`JointLiftContext.tsx` keeps two invitation types distinct: an in product `joint_lifts` invitation or an email invitation. Cancellation builds a scoped delete query using the appropriate owner field and requires a confirmed deleted row before hiding the invitation. The private test suite includes a test for the intermediate pending state before deletion confirmation.

## Shared progress and completion

Each participant updates their own completion status. The UI can derive whether a lift is still waiting on one participant, or both tasks are done. The public example isolates this state transformation with invented users and tasks. It is *not* deployed business logic; ownership enforcement needs server rules and careful concurrency handling.

## Auth and storage

The app uses Supabase auth with React Native AsyncStorage as session storage, and a React context fetches profile details and active, pending, sent and completed lifts. This separates shared product state from navigation screens, but the centralized context has accumulated several responsibilities and may merit decomposition as the app grows.

## Security caveat

The inspected GitHub repository contains the Expo frontend and tests but no Supabase migration or row level security policy files. Consequently, this review cannot verify whether deployed policies prevent one user from accessing or modifying another user's records. Such a verification requires inspecting the live Supabase project and its policies separately. No deployment changes or project access were undertaken.

## Implementation tradeoffs

Some screens are large, notably `ActiveRoomScreen.tsx` and `DashboardScreen.tsx`. This was practical for a focused MVP, but breaking visual components, data mutations and state logic apart would improve testability. The original repository has meaningful tests for invitation cancellation and UI behavior, but those tests were not executed as part of this companion review.

## This public example does not include

Production database credentials, tokens, project URLs, email addresses of real users, images, production application source, private invitation records, migrations or a complete runnable iOS project. The standalone examples can be exercised with `npm test` and should be understood as communication artifacts, not deployable authorization checks.
