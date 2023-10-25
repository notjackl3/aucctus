import React, { FunctionComponent, ReactNode } from "react";
import { NavigateOptions, useNavigate } from "react-router-dom";
import { AppPath } from "../../routes/routes";

interface ButtonProps {
  route: AppPath | 'string'
  children: ReactNode,
  options?: NavigateOptions
  variant: 'primary' | "secondary" | "light"

}

const NavigateButton: FunctionComponent<ButtonProps> = ({ variant, route, options, children }) => {
  const navigate = useNavigate();
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={() => {
        navigate(route, options)
      }}
    >
      {children}
    </button>
  );
}
export default NavigateButton;