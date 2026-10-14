import React from "react";
import logo from "../assets/thoughtworks-logo.svg";

/** Thoughtworks wordmark, flattened to the current monochrome tone. */
export const Logo: React.FC<{ height: number; style?: React.CSSProperties }> = ({ height, style }) => (
  <img
    src={logo}
    alt="Thoughtworks"
    style={{ height, display: "block", filter: "brightness(0) invert(1)", ...style }}
  />
);
