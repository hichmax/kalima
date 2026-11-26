import { ViewTransition } from "react";

/**
 * Transition entre les pages (View Transitions API via React 19.3).
 * Un template est remonté à chaque navigation : l'ancienne page sort en fondu flou,
 * la nouvelle entre en glissant légèrement. Sans support navigateur, rien ne change.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
