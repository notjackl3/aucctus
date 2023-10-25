import { FunctionComponent } from "react";


interface IconProps {
  height: number;
  width: number;
  stroke: string;
}


const ArrowUp: FunctionComponent<IconProps> = ({ height, width, stroke }) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 10V3M6 3L2.5 6.5M6 3L9.5 6.5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default ArrowUp;