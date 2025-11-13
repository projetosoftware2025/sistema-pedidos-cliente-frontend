import React from "react";
import { ReactSVG } from "react-svg";

interface SVGComponentProps {
  src: string;
  color?: string;
  width?: string;
  height?: string;
  rotation?: number;
}

const SVGComponent: React.FC<SVGComponentProps> = ({
  src,
  color,
  width,
  height,
  rotation,
}) => {
  return (
    <ReactSVG
      src={src}
      beforeInjection={(svg) => {
        const paths = svg.querySelectorAll("path");
        paths.forEach((path) => {
          path?.setAttribute("fill", color ?? "#FFFFFF");
        });
        svg.setAttribute("width", width ?? "100");
        height && svg.setAttribute("height", height);
        svg.style.transform = `rotate(${rotation ?? 0}deg)`;
      }}
    />
  );
};

export default SVGComponent;
