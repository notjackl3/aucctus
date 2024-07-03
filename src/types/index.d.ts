export * from './api';

declare module '@components/*' {
  const value: any;
  export default value;
}

declare module '@pages/*' {
  const value: any;
  export default value;
}

declare module '@routes/*' {
  const value: any;
  export default value;
}

declare module '@libs/*' {
  const value: any;
  export default value;
}
