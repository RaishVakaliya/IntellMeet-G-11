import type React from "react";

interface BracketsProps {
  color: string;
}

export function OtpBrackets({ color }: BracketsProps) {
  const s: React.CSSProperties = {
    position: "absolute",
    width: 9,
    height: 9,
    borderStyle: "solid",
    borderColor: color,
    borderWidth: 0,
  };

  return (
    <>
      <span
        style={{
          ...s,
          top: 2,
          left: 2,
          borderTopWidth: 1.5,
          borderLeftWidth: 1.5,
          borderRadius: "3px 0 0 0",
        }}
      />
      <span
        style={{
          ...s,
          top: 2,
          right: 2,
          borderTopWidth: 1.5,
          borderRightWidth: 1.5,
          borderRadius: "0 3px 0 0",
        }}
      />
      <span
        style={{
          ...s,
          bottom: 2,
          left: 2,
          borderBottomWidth: 1.5,
          borderLeftWidth: 1.5,
          borderRadius: "0 0 0 3px",
        }}
      />
      <span
        style={{
          ...s,
          bottom: 2,
          right: 2,
          borderBottomWidth: 1.5,
          borderRightWidth: 1.5,
          borderRadius: "0 0 3px 0",
        }}
      />
    </>
  );
}
