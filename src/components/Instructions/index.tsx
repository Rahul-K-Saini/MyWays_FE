"use client";

import { useEffect, useRef, useState } from "react";
import { Building, Clock } from "lucide-react";
import { Instructions } from "@/components/Instructions/instructions";
import { Badge } from "@/components/ui/badge";

export default function InterviewPage() {
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        // stream.getTracks().forEach((track) => track.stop());
        // setStream(null);
        setCameraActive(false);
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        setStream(newStream);
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <main className="mx-auto px-24 py-14">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">
            Trainee Interview
          </h2>
          <div className="flex items-center gap-6 ">
            <Badge
              variant="outline"
              className="flex text-gray-50 text-sm items-center gap-2 px-4 py-2"
            >
              <Building className="h-4 w-4" color="orange" />
              Zeko
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center text-sm text-gray-50 gap-2 px-4 py-2"
            >
              <Clock className="h-4 w-4" color="orangered" />
              26 Minutes
            </Badge>
          </div>
        </div>
        <div className="sm:flex sm:justify-between">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-black/20 w-[47%]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`h-full w-full object-cover ${
                !cameraActive ? "hidden" : ""
              }`}
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Loading camera...
              </div>
            )}
          </div>
          <Instructions cameraStream={stream} />
        </div>
      </main>
    </div>
  );
}
