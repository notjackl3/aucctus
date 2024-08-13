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
