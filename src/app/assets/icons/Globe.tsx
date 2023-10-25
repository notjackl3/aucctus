import { FunctionComponent } from "react";

interface IconProps {
  height: number;
  width: number;
  stroke: string;
}

const Globe: FunctionComponent<IconProps> = ({ height, width, stroke }) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_29_1180)">
        <path
          d="M2.23904 13.0376L3.8292 12.1196C3.91533 12.0699 4.01641 12.0526 4.11417 12.0709L7.24292 12.6564C7.50004 12.7046 7.7374 12.5066 7.73623 12.245L7.72405 9.50367C7.72372 9.42919 7.74336 9.35598 7.78092 9.29166L9.35986 6.58847C9.44204 6.44779 9.43467 6.27211 9.34101 6.13879L6.68252 2.3547M15.8336 4.04917C11.2503 6.24999 13.7501 9.16666 14.5836 9.58333C16.1478 10.3653 18.3231 10.4166 18.3231 10.4166C18.3299 10.2786 18.3334 10.1397 18.3334 9.99996C18.3334 5.39759 14.6025 1.66663 10.0001 1.66663C5.39771 1.66663 1.66675 5.39759 1.66675 9.99996C1.66675 14.6023 5.39771 18.3333 10.0001 18.3333C10.1398 18.3333 10.2787 18.3299 10.4167 18.3231M13.9649 18.2831L11.3259 11.3258L18.2832 13.9648L15.1981 15.198L13.9649 18.2831Z"
          stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" stroke-linejoin="round" />
      </g>
      <defs>
        <clipPath id="clip0_29_1180">
          <rect width={width} height={height} fill="white" />
        </clipPath>
      </defs>

    </svg>
  )
}

export default Globe;