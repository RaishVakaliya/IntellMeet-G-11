import { useMutation } from "@tanstack/react-query";
import { apiFetch, handleJsonResponse } from "@/lib/apiFetch";
import { useAuthStore } from "@/stores/authStore";
import { useOtpStore } from "@/stores/otpStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface VerifyOtpPayload {
  email: string;
  otp: string;
}

interface VerifyOtpResponse {
  _id: string;
  name: string;
  email: string;
  accessToken: string;
  message?: string;
}

interface ResendOtpPayload {
  email: string;
}

interface ResendOtpResponse {
  message: string;
  email: string;
}

export const useVerifyOtpMutation = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (
      payload: VerifyOtpPayload,
    ): Promise<VerifyOtpResponse> => {
      const res = await apiFetch("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return handleJsonResponse<VerifyOtpResponse>(res);
    },
    onSuccess: (data) => {
      setTimeout(() => {
        setAuth(
          {
            _id: data._id,
            username: data.name,
            email: data.email,
            isVerified: true,
          },
          data.accessToken,
        );
        useOtpStore.getState().reset();
        toast.success(data.message || "Account verified successfully!", {
          id: "verify-otp-success",
        });

        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 200);
      }, 3500);
    },
  });
};

export const useResendOtpMutation = () => {
  const startCooldown = useOtpStore((s) => s.startCooldown);

  return useMutation({
    mutationFn: async (
      payload: ResendOtpPayload,
    ): Promise<ResendOtpResponse> => {
      const res = await apiFetch("/api/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return handleJsonResponse<ResendOtpResponse>(res);
    },
    onSuccess: (data) => {
      startCooldown(60);
      toast.success(data.message || "A new 4-digit code has been sent!", {
        id: "resend-otp-success",
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to resend verification code", {
        id: "resend-otp-error",
      });
    },
  });
};
