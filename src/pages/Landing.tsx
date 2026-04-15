import { Navigate } from 'react-router-dom';

// Landing is now consolidated into MainHub (the root route).
// /about redirects to / to avoid duplicate content.
export default function Landing() {
  return <Navigate to="/" replace />;
}
