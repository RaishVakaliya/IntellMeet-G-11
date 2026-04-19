import { useEffect, useRef, useState } from "react";
import { useMeetingStore } from "@/stores/meetingStore";

export const useAudioDetection = (
  userId: string | undefined,
  stream: MediaStream | undefined,
): { audioLevel: number; isSpeaking: boolean } => {
  const { setSpeaking } = useMeetingStore();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!stream) {
      setAudioLevel(0);
      setIsSpeaking(false);
      if (userId) setSpeaking(userId, false);
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      setAudioLevel(0);
      setIsSpeaking(false);
      if (userId) setSpeaking(userId, false);
      return;
    }

    let lastSpeakingState = false;
    const THRESHOLD = 35;
    const SMOOTHING = 0.8;
    let currentVolume = 0;

    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkAudio = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        currentVolume = average * (1 - SMOOTHING) + currentVolume * SMOOTHING;
        const normalizedLevel = currentVolume / 255; // 0-1 range
        const speaking = currentVolume > THRESHOLD;

        setAudioLevel(normalizedLevel);
        setIsSpeaking(speaking);

        if (userId && speaking !== lastSpeakingState) {
          lastSpeakingState = speaking;
          setSpeaking(userId, speaking);
        }

        animationFrameRef.current = requestAnimationFrame(checkAudio);
      };

      checkAudio();
    } catch (err) {
      console.error("Audio detection error", userId || "local", err);
      setAudioLevel(0);
      setIsSpeaking(false);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
      if (userId) setSpeaking(userId, false);
      setAudioLevel(0);
      setIsSpeaking(false);
    };
  }, [stream, userId, setSpeaking]);

  return { audioLevel, isSpeaking };
};
