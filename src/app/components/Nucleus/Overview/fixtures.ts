// Overview component fixtures for UI text and data

export interface ConnectAccountService {
  id: string;
  name: string;
  icon: {
    type: 'solid' | 'gradient';
    colors: string | string[];
    shape: 'rounded' | 'rounded-full';
  };
  isEnabled: boolean;
}

export interface OverviewUIText {
  disruptionRiskAnalysis: {
    title: string;
    riskLevels: {
      high: string;
      moderate: string;
      low: string;
    };
    descriptions: {
      high: string;
      moderate: string;
      low: string;
    };
  };
  riskConsiderations: {
    title: string;
    timelineTabs: {
      short: string;
      mid: string;
      long: string;
    };
  };
  connectAccounts: {
    title: string;
    services: ConnectAccountService[];
  };
}

export const overviewUIText: OverviewUIText = {
  disruptionRiskAnalysis: {
    title: 'DISRUPTION RISK ANALYSIS',
    riskLevels: {
      high: 'High Risk',
      moderate: 'Moderate Risk',
      low: 'Low Risk',
    },
    descriptions: {
      high: 'Strong market position challenged by innovation gaps and shifting consumer preferences',
      moderate:
        'Market position stable with some emerging competitive pressures requiring attention',
      low: 'Secure market position with minimal disruption threats in the near term',
    },
  },
  riskConsiderations: {
    title: 'RISK CONSIDERATIONS',
    timelineTabs: {
      short: 'Short Term',
      mid: 'Mid Term',
      long: 'Long Term',
    },
  },
  connectAccounts: {
    title: 'CONNECT ACCOUNTS',
    services: [
      {
        id: 'onedrive',
        name: 'OneDrive',
        icon: {
          type: 'solid',
          colors: '#0078d4',
          shape: 'rounded',
        },
        isEnabled: false,
      },
      {
        id: 'drive',
        name: 'Drive',
        icon: {
          type: 'gradient',
          colors: ['#4285f4', '#ea4335', '#fbbc05'],
          shape: 'rounded',
        },
        isEnabled: false,
      },
      {
        id: 'openai',
        name: 'OpenAI',
        icon: {
          type: 'solid',
          colors: '#000000',
          shape: 'rounded-full',
        },
        isEnabled: false,
      },
    ],
  },
};
