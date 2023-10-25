import { FunctionComponent } from "react";

interface IconProps {
  height: number;
  width: number;
  stroke: string;
}

const Search: FunctionComponent<IconProps> = ({ height, width, stroke }) => {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.5 18L14.5834 15.0833M16.6667 10.0833C16.6667 13.9954 13.4954 17.1667 9.58333 17.1667C5.67132 17.1667 2.5 13.9954 2.5 10.0833C2.5 6.17132 5.67132 3 9.58333 3C13.4954 3 16.6667 6.17132 16.6667 10.0833Z"
        stroke={stroke} strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default Search;