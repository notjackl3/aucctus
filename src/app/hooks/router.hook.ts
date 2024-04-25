import { useLocation } from 'react-router-dom';
import { matchPath } from 'react-router-dom';
import { AppPath } from '../../routes/routes'; // import your route definitions

export function useRoutePattern() {
  const location = useLocation();

  for (const path of Object.values(AppPath)) {
    // The matchPath function tries to match the current location against the route pattern
    const match = matchPath({ path: path }, location.pathname);
    if (match) {
      return path; // Return the pattern that matches the current location
    }
  }
  return undefined;
}
