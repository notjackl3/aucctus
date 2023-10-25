import { FunctionComponent } from "react";

interface IconProps {
  height: number;
  width: number;
  stroke: string;
}

const FilterLines: FunctionComponent<IconProps> = ({ height, width, stroke }) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 10H15M2.5 5H17.5M7.5 15H12.5" stroke={stroke} stroke-width="1.66667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default FilterLines;