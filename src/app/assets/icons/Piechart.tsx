import { FunctionComponent } from "react";

interface IconProps {
  height: number;
  width: number;
  stroke: string;
}

const Piechart: FunctionComponent<IconProps> = ({ height, width, stroke }) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.66667 14.1667L2.5 10M2.5 10L6.66667 5.83333M2.5 10H12.5M10 14.1667C10 14.9416 10 15.3291 10.0852 15.647C10.3164 16.5098 10.9902 17.1836 11.853 17.4148C12.1709 17.5 12.5584 17.5 13.3333 17.5H13.75C14.9149 17.5 15.4973 17.5 15.9567 17.3097C16.5693 17.056 17.056 16.5693 17.3097 15.9567C17.5 15.4973 17.5 14.9149 17.5 13.75V6.25C17.5 5.08515 17.5 4.50272 17.3097 4.04329C17.056 3.43072 16.5693 2.94404 15.9567 2.6903C15.4973 2.5 14.9149 2.5 13.75 2.5H13.3333C12.5584 2.5 12.1709 2.5 11.853 2.58519C10.9902 2.81635 10.3164 3.49022 10.0852 4.35295C10 4.67087 10 5.05836 10 5.83333"
        stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default Piechart;