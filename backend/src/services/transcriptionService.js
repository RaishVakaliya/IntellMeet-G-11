import { spawn } from "child_process";
import path from "path";
import { EventEmitter } from "events";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class TranscriptionService extends EventEmitter {
  constructor() {
    super();
    this.process = null;
    this.ready = false;
    this.queue = [];
    this.isProcessing = false;
    this.initProcess();
  }

  initProcess() {
    const pythonScript = path.resolve(__dirname, "../../python/transcribe.py");
    
    let pythonExecutable = "python3";
    const env = { ...process.env };

    if (process.platform === "win32") {
      pythonExecutable = path.resolve(__dirname, "../../python/venv/Scripts/python.exe");

      if (process.env.USERPROFILE) {
        const wingetFfmpegBin = path.join(
          process.env.USERPROFILE,
          "AppData",
          "Local",
          "Microsoft",
          "WinGet",
          "Packages",
          "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
          "ffmpeg-8.1.1-full_build",
          "bin"
        );
        const pathKey = Object.keys(env).find(k => k.toLowerCase() === "path") || "PATH";
        if (env[pathKey]) {
          env[pathKey] = `${env[pathKey]};${wingetFfmpegBin}`;
        } else {
          env[pathKey] = wingetFfmpegBin;
        }
      }
    }

    this.process = spawn(pythonExecutable, [pythonScript], { env });

    this.process.stdout.on("data", (data) => {
      const output = data.toString().trim();
      const lines = output.split('\n');
      for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        
        if (line === "READY") {
          console.log("Whisper transcription model loaded and ready.");
          this.ready = true;
          this.processQueue();
        } else {
          try {
            const result = JSON.parse(line);
            this.emit("result", result);
            this.isProcessing = false;
            this.processQueue();
          } catch (err) {
            console.error("Failed to parse python output:", line);
          }
        }
      }
    });

    this.process.on("error", (err) => {
      console.error("Error spawning Whisper python process:", err);
    });

    this.process.stderr.on("data", (data) => {
      console.log("Whisper process logs:", data.toString().trim());
    });

    this.process.on("close", (code) => {
      console.log(`Whisper process exited with code ${code}`);
      this.ready = false;
      setTimeout(() => this.initProcess(), 5000);
    });
  }

  transcribe(audioPath) {
    return new Promise((resolve, reject) => {
      const task = { audioPath, resolve, reject };
      this.queue.push(task);
      this.processQueue();
    });
  }

  processQueue() {
    if (!this.ready || this.isProcessing || this.queue.length === 0) return;
    
    this.isProcessing = true;
    const task = this.queue.shift();
    
    const onceListener = (result) => {
      if (result.file === task.audioPath) {
        if (result.error) {
          task.reject(new Error(result.error));
        } else {
          task.resolve(result.text);
        }
      } else {
        this.once("result", onceListener);
      }
    };
    
    this.once("result", onceListener);
    this.process.stdin.write(`${task.audioPath}\n`);
  }
}

export const transcriptionService = new TranscriptionService();
