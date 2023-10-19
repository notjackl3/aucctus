import { FunctionComponent } from "react";

interface IconProps {
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
}

const MailIcon: FunctionComponent<IconProps> = ({ width = 32, height = 28, fill = "none", stroke = "#4318FF" }) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill={fill} xmlns="http://www.w3.org/2000/svg">
      <path d="M4 8.16675L13.5257 14.8348C14.2971 15.3747 14.6828 15.6447 15.1023 15.7493C15.4729 15.8416 15.8605 15.8416 16.231 15.7493C16.6505 15.6447 17.0362 15.3747 17.8076 14.8348L27.3333 8.16675M9.6 23.3334H21.7333C23.6935 23.3334 24.6736 23.3334 25.4223 22.9519C26.0809 22.6164 26.6163 22.081 26.9519 21.4224C27.3333 20.6737 27.3333 19.6936 27.3333 17.7334V10.2667C27.3333 8.30656 27.3333 7.32647 26.9519 6.57778C26.6163 5.91921 26.0809 5.38378 25.4223 5.04823C24.6736 4.66675 23.6935 4.66675 21.7333 4.66675H9.6C7.63982 4.66675 6.65972 4.66675 5.91103 5.04823C5.25247 5.38378 4.71703 5.91921 4.38148 6.57778C4 7.32647 4 8.30656 4 10.2667V17.7334C4 19.6936 4 20.6737 4.38148 21.4224C4.71703 22.081 5.25247 22.6164 5.91103 22.9519C6.65972 23.3334 7.63982 23.3334 9.6 23.3334Z" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>

  )
}

export default MailIcon