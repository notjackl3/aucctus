export type ConceptStatusProps = {
  status: string;
  color: string;
};

export type StatusColorTypes = {
  [key: string]: 'statusBlue' | 'statusRed' | 'statusGreen' | 'statusPink' | 'statusPurple';
};

export type BulletColorTypes = {
  [key: string]: 'bulletBlue' | 'bulletRed' | 'bulletGreen' | 'bulletPink' | 'bulletPurple';
};

export type BackgroundColorTypes = {
  [key: string]: 'backgroundBlue' | 'backgroundRed' | 'backgroundGreen' | 'backgroundPink' | 'backgroundPurple';
};
