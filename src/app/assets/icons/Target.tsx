import { FunctionComponent } from "react";


interface IconProps {
  height: number;
  width: number;
  stroke: string;
}


const Target: FunctionComponent<IconProps> = ({ height, width, stroke }) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 8.5V5.5L19 2.5L20 4.5L22 5.5L19 8.5H16ZM16 8.5L12 12.4999M22 12.5C22 18.0228 17.5228 22.5 12 22.5C6.47715 22.5 2 18.0228 2 12.5C2 6.97715 6.47715 2.5 12 2.5M17 12.5C17 15.2614 14.7614 17.5 12 17.5C9.23858 17.5 7 15.2614 7 12.5C7 9.73858 9.23858 7.5 12 7.5"
        stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default Target;