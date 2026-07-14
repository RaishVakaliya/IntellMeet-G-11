import React, { useRef, useState } from "react";
import { Zap, Loader2, ArrowRight } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

interface QuickJoinCardProps {
  onJoin: (code: string) => Promise<void> | void;
  joiningCode: string | null;
}

export const QuickJoinCard: React.FC<QuickJoinCardProps> = ({
  onJoin,
  joiningCode,
}) => {
  const [joinCode, setJoinCode] = useState("");
  const joinInputRef = useRef<HTMLInputElement>(null);

  const handleJoin = () => {
    if (!joinCode.trim()) {
      joinInputRef.current?.focus();
      return;
    }
    onJoin(joinCode.trim());
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-5 hover:border-primary/30 transition-all shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-base font-bold text-foreground">Quick Join</p>
          <p className="text-xs text-muted-foreground">
            Paste a code or link instantly
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          ref={joinInputRef}
          placeholder="Enter code or link..."
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          className="h-11 text-sm bg-background border-border rounded-xl"
        />
        <Button
          onClick={handleJoin}
          disabled={!joinCode.trim() || !!joiningCode}
          className="h-11 px-5 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-sm font-bold rounded-xl"
        >
          {joiningCode ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Join <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
