import { IUser } from '@libs/api/types';

export const isUser = (value: unknown): value is IUser => {
  return (
    !!value &&
    (value as IUser).email !== undefined &&
    (value as IUser).firstName !== undefined &&
    (value as IUser).lastName !== undefined
  );
};

export const getUsersFullName = (user: IUser) => {
  return `${user.firstName} ${user.lastName}`;
};

/**
 * Check if a user is an Aucctus internal admin.
 *
 * A user is considered an Aucctus admin if BOTH conditions are met:
 * 1. User has the Clerk admin role (role === 'Admin')
 * 2. User's email ends with @aucctus.com
 *
 * @param user - The User object to check (can be null/undefined)
 * @returns True if the user is an Aucctus admin, false otherwise
 */
export const isAucctusAdmin = (user: IUser | null | undefined): boolean => {
  if (!user) {
    return false;
  }

  // Check 1: User must have Admin role (case-insensitive to handle Django's lowercase 'admin')
  const isAdminRole = user.role?.toLowerCase() === 'admin';

  // Check 2: Email must end with @aucctus.com (case-insensitive check)
  const isAucctusEmail = user.email.toLowerCase().endsWith('@aucctus.com');

  return isAdminRole && isAucctusEmail;
};
