import { FunctionComponent } from "react";


interface IconProps {
  height: number;
  width: number;
  stroke: string;
}


const ChevronUp: FunctionComponent<IconProps> = ({ height, width, stroke }) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 12.5L10 7.5L5 12.5" stroke={stroke} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export default ChevronUp;