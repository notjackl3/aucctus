import { FunctionComponent } from "react";

interface IconProps {
  width?: number;
  height?: number;
  fill?: string;
}

const StarIcon: FunctionComponent<IconProps> = ({ width = 20, height = 20, fill = "#2B3674" }) => {
  return (
    <svg width={width} height={height} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#prefix__clip1_469_26199)">
        <path d="M9.538 1.61a.5.5 0 01.924 0l2.066 4.967a.5.5 0 00.421.307l5.363.43a.5.5 0 01.286.878l-4.086 3.5a.5.5 0 00-.161.496l1.248 5.233a.5.5 0 01-.747.543l-4.591-2.805a.5.5 0 00-.522 0l-4.59 2.804a.5.5 0 01-.748-.542l1.248-5.233a.5.5 0 00-.16-.496l-4.087-3.5a.5.5 0 01.286-.878l5.363-.43a.5.5 0 00.421-.307L9.538 1.61z" fill={fill} />
      </g>
    </svg>
  )
}

export default StarIcon