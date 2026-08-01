import { ArrowLeft, Mail } from "lucide-react";
import AppLogoImg from "@/assets/AppLogo.png";
import { C } from "../constants";

interface OtpHeaderProps {
  activeEmail: string;
  onBack: () => void;
}

export function OtpHeader({ activeEmail, onBack }: OtpHeaderProps) {
  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs transition-colors mb-4 group"
        style={{ color: C.text3 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = C.text)}
        onMouseLeave={(e) => (e.currentTarget.style.color = C.text3)}
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Sign In</span>
      </button>

      <div className="flex flex-col items-center text-center mb-4">
        <img
          src={AppLogoImg}
          alt="IntellMeet Logo"
          className="w-auto h-15 mb-2.5 drop-shadow-md"
        />
        <h2
          className="text-lg font-bold tracking-tight"
          style={{ color: C.text }}
        >
          Let&apos;s verify your email
        </h2>
        <p className="text-xs mt-0.5" style={{ color: C.text2 }}>
          We sent a 4-digit code to your email.
        </p>
        {activeEmail && (
          <div
            className="flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
              color: C.primary2,
            }}
          >
            <Mail className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[180px]">{activeEmail}</span>
          </div>
        )}
      </div>
    </>
  );
}
