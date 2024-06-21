import { useLocation } from 'react-router-dom';
import { matchPath } from 'react-router-dom';
import { AppPath, UNAUTH_ROUTES } from '../../routes/routes'; // import your route definitions

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

export function useIsUnauthRoute() {
  const location = useLocation();
  console.log(location.pathname);

  for (const path of UNAUTH_ROUTES) {
    // The matchPath function tries to match the current location against the route pattern
    const match = matchPath({ path: path }, location.pathname);
    if (match) {
      return match; // Return the pattern that matches the current location
    }
  }
  return undefined;
}
