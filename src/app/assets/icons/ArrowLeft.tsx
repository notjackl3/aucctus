


import { FunctionComponent } from "react";


interface IconProps {
  height: number;
  width: number;
  stroke: string;
}


const ArrowLeft: FunctionComponent<IconProps> = ({ height, width, stroke }) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.8333 10H4.16666M4.16666 10L9.99999 15.8334M4.16666 10L9.99999 4.16669" stroke={stroke}
        strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />

    </svg>
  )
}

export default ArrowLeft;