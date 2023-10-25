import { FunctionComponent } from "react";


interface IconProps {
  height: number;
  width: number;
  stroke: string;
}


const ChevronDown: FunctionComponent<IconProps> = ({ height, width, stroke }) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 7.5L10 12.5L15 7.5" stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default ChevronDown;