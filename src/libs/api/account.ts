import { ApiService } from './apiService';
import { endpoints } from './endpoints';
import {
  IAccount,
  IDashboard,
  IMessageResponse,
  IRegisterAccount,
  IUser,
  IUserDetailsResponse,
  IUserPassword,
} from './types'; // Import the missing type

/**
 * Account API
 *
 * Handles all the requests for the accounts and users that require authentication.
 */
export class AccountApi extends ApiService {
  getAccount() {
    return this.get<IAccount>(endpoints.account);
  }

  createAccount(account: IRegisterAccount) {
    return this.post<IAccount, IRegisterAccount>(endpoints.account, account);
  }

  updateAccount(account: Partial<IAccount>) {
    return this.put<IAccount, Partial<IAccount>>(endpoints.account, account);
  }

  getUser() {
    return this.get<IUserDetailsResponse>(endpoints.user);
  }

  updateUser(user: Partial<IUser>) {
    return this.patch<IUserDetailsResponse>(endpoints.user, user);
  }

  updateUserPassword(user: IUserPassword) {
    return this.post<IMessageResponse>(endpoints.updatePassword, user);
  }

  getDashboard() {
    return this.get<IDashboard>(endpoints.dashboard);
  }
}
