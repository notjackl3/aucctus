import React from 'react';
import { ITokenResponse } from '../../libs/api/types';
import { AucctusStorage } from '../../libs/localStorage';

interface ITokenRefreshProps {
  children: React.ReactNode;
  refreshToken: () => Promise<ITokenResponse | undefined>;
  refreshActionReady: boolean;
  initialized: boolean;
  setInitialized: (value: boolean) => void;
}

class TokenRefreshWrapper extends React.Component<ITokenRefreshProps> {
  componentDidUpdate(): void {
    const initialized = AucctusStorage.get('initialized', { defaultValue: false, type: 'session' });
    if (this.props.refreshActionReady && !initialized && this.props.setInitialized) {
      this.props.refreshToken().finally(() => {
        this.props.setInitialized(true);
      });
    }
  }

  render() {
    return <>{this.props.children}</>;
  }
}

export default TokenRefreshWrapper;
