import { FunctionComponent } from "react";


interface IconProps {
  height: number;
  width: number;
  stroke: string;
}


const BarChart: FunctionComponent<IconProps> = ({ height, width, stroke }) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.25 20V10M12.25 20V4M6.25 20V14" stroke={stroke}
        stroke-width="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default BarChart;