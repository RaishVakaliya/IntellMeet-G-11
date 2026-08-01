import type React from "react";
import type { Status } from "./constants";

export type { Status };

export interface OtpDigitBoxProps {
  index: number;
  value: string;
  disabled: boolean;
  isFocused: boolean;
  isError: boolean;
  inputRef: React.RefCallback<HTMLInputElement>;
  onChange: (i: number, v: string) => void;
  onKeyDown: (i: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onFocus: (i: number) => void;
  onBlur: () => void;
}

export interface StageProps {
  digits: string[];
  status: Status;
  shakeKey: number;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  isError: boolean;
  focusedIndex: number | null;
  onChange: (i: number, v: string) => void;
  onKeyDown: (i: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  onFocus: (i: number) => void;
  onBlur: () => void;
}
