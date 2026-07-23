export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  const userAgent =
    navigator.userAgent || navigator.vendor || (window as any).opera || "";
  const isMobileUA =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent,
    );
  const isSmallScreen = window.innerWidth < 768;
  return isMobileUA || (isSmallScreen && "ontouchstart" in window);
};

export const isDisplayMediaSupported = (): boolean => {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) {
    return false;
  }
  const hasApi = typeof navigator.mediaDevices.getDisplayMedia === "function";
  return hasApi && !isMobileDevice();
};
