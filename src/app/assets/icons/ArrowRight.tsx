import { FunctionComponent } from "react";


interface IconProps {
  height: number;
  width: number;
  stroke: string;
}


const ArrowRight: FunctionComponent<IconProps> = ({ height, width, stroke }) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.33331 10.5H16.6666M16.6666 10.5L11.6666 5.5M16.6666 10.5L11.6666 15.5" stroke={stroke}
        strokeWidth="1.66667" strokeLinecap="round" stroke-linejoin="round" />
    </svg>
  )
}

export default ArrowRight;