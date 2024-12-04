import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Airplay,
  Camera,
  Check,
  Chrome,
  Clock,
  ExternalLink,
  Mic,
  Minimize2,
  Speaker,
  Users,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import QuestionDisplay from "./questionDisplay";
import Timer from "./timer";

const questions = [
  "What are the key differences between REST and GraphQL APIs?",
  "Explain the concept of containerization and how Docker implements it",
  "What are the benefits of using TypeScript over JavaScript?",
  "Describe the principles of clean code and why they are important",
  "How does React's Virtual DOM work and what are its advantages?",
  "Explain the concept of microservices architecture and its benefits",
  "What are design patterns and why are they important in software development?",
  "How do you ensure security in web applications?",
  "Explain the differences between SQL and NoSQL databases",
  "What are the best practices for code review and version control?",
];

export function Instructions({
  cameraStream,
}: {
  cameraStream: MediaStream | null;
}) {
  const [currentScreen, setCurrentScreen] = useState("instructions");
  const [deviceChecks, setDeviceChecks] = useState({
    camera: { status: "pending", error: null },
    microphone: { status: "pending", error: null },
    speaker: { status: "pending", error: null, volume: 0 },
    screenShare: { status: "pending", error: null },
  });
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [stage, setStage] = useState<
    "loading" | "question" | "camera" | "saving" | "completed"
  >("loading");
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
    console.log(cameraStream);
  }, [cameraStream]);

  // useEffect(() => {
  //   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //     navigator.mediaDevices
  //       .getUserMedia({ video: true })
  //       .then((stream) => {
  //         if (videoRef.current) {
  //           videoRef.current.srcObject = stream;
  //         }
  //       })
  //       .catch((err) => {
  //         console.error("Error accessing the camera:", err);
  //         setDeviceChecks((prev) => ({
  //           ...prev,
  //           camera: {
  //             status: "error",
  //             error: err.message || "Failed to access camera",
  //           },
  //         }));
  //       });
  //   }

  //   return () => {
  //     if (videoRef.current && videoRef.current.srcObject) {
  //       const stream = videoRef.current.srcObject as MediaStream;
  //       stream.getTracks().forEach((track) => track.stop());
  //     }
  //   };
  // }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setDeviceChecks((prev) => ({
        ...prev,
        camera: { status: "success", error: null },
      }));
    } catch (error: any) {
      setDeviceChecks((prev) => ({
        ...prev,
        camera: {
          status: "error",
          error: error.message || "Camera access denied",
        },
      }));
    }
  };

  useEffect(() => {
    if (currentScreen === "interviewSection" && stage === "loading") {
      speechSynthesisRef.current = new SpeechSynthesisUtterance(
        questions[currentQuestionIndex]
      );

      window.speechSynthesis.cancel();

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        speechSynthesisRef.current.voice = voices[0];
      }

      speechSynthesisRef.current.onend = () => {
        setStage("question");
      };

      speechSynthesisRef.current.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setStage("question");
      };

      setTimeout(() => {
        window.speechSynthesis.speak(speechSynthesisRef.current!);
      }, 1000);
    }

    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentScreen, stage, currentQuestionIndex]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setStage("saving");
      setTimeout(() => {
        setCurrentQuestionIndex((prev) => prev + 1);
        setStage("loading");
      }, 2000);
    } else {
      setStage("completed");
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
        setAudioLevel(Math.round((average / 255) * 100));

        requestAnimationFrame(checkAudioLevel);
      };

      checkAudioLevel();

      setDeviceChecks((prev) => ({
        ...prev,
        microphone: { status: "success", error: null },
      }));

      return () => {
        stream.getTracks().forEach((track) => track.stop());
        audioContext.close();
      };
    } catch (error: any) {
      setDeviceChecks((prev) => ({
        ...prev,
        microphone: {
          status: "error",
          error: error.message || "Microphone access denied",
        },
      }));
    }
  };

  const checkSpeakerPermission = async () => {
    try {
      // const audio = new Audio("sound.mp3");
      // await audio.play();

      setDeviceChecks((prev) => ({
        ...prev,
        speaker: { status: "success", error: null, volume: 100 },
      }));
    } catch (error: any) {
      setDeviceChecks((prev) => ({
        ...prev,
        speaker: {
          status: "error",
          error: error.message || "Speaker test failed",
          volume: 0,
        },
      }));
    }
  };

  const checkScreenSharePermission = async () => {
    try {
      await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      setDeviceChecks((prev) => ({
        ...prev,
        screenShare: { status: "success", error: null },
      }));
      document.body.requestFullscreen();
    } catch (error: any) {
      setDeviceChecks((prev) => ({
        ...prev,
        screenShare: {
          status: "error",
          error: error.message || "Screen share access denied",
        },
      }));
    }
  };

  useEffect(() => {
    if (currentScreen === "permissions") {
      checkCameraPermission();
      checkMicrophonePermission();
      checkSpeakerPermission();
      checkScreenSharePermission();
    }
  }, [currentScreen]);

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <Check className="text-green-500" />;
      case "error":
        return <X className="text-red-500" />;
      default:
        return <span className="animate-pulse">...</span>;
    }
  };

  const renderInstructionsScreen = () => (
    <Card className="bg-bg border-0 w-[45%]">
      <CardHeader>
        <CardTitle className="text-3xl text-white">Instructions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="list-decimal list-inside space-y-3 text-lg text-gray-200">
          <li>Ensure stable internet and choose a clean, quiet location.</li>
          <li>
            Permission for access of camera, microphone, entire screen sharing
            is required.
          </li>
          <li>Be in professional attire and avoid distractions.</li>
          <li>
            Give a detailed response, providing as much information as you can.
          </li>
          <li>
            Answer the question with examples and projects you&apos;ve worked
            on.
          </li>
        </ol>
        <div className="mt-6 rounded-lg bg-gray-700/20 p-4 text-base text-gray-50">
          <p>
            <span className="text-blue-500">
              Click here <ExternalLink className="h-4 w-4 inline" />{" "}
            </span>
            {"  "} to try a mock interview with Avya, our AI interviewer, and
            build your confidence before the main interview!
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2"
          size="lg"
          onClick={() => setCurrentScreen("permissions")}
        >
          Start Now
        </Button>
      </CardFooter>
    </Card>
  );

  const renderPermissionsScreen = () => (
    <Card className="bg-bg border-0 w-[45%]">
      <CardHeader>
        <CardTitle className="text-gray-50 text-2xl">Ready to join?</CardTitle>
        <p className="text-gray-400">
          Please configure your devices for the interview.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Camera Check */}
          <div className="flex justify-between items-center rounded-md p-4 border text-gray-300">
            <span className="flex gap-4">
              <Camera /> Check Camera
            </span>
            <div className="flex items-center gap-2">
              {renderStatusIcon(deviceChecks.camera.status)}
              {deviceChecks.camera.error && (
                <span className="text-xs text-red-400">
                  {deviceChecks.camera.error}
                </span>
              )}
            </div>
          </div>

          {/* Microphone Check */}
          <div className="flex justify-between items-center rounded-md p-4 border text-gray-300">
            <span className="flex gap-4">
              <Mic /> Check Microphone
            </span>
            <div className="flex items-center gap-2">
              {renderStatusIcon(deviceChecks.microphone.status)}
              {deviceChecks.microphone.status === "success" && (
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              )}
              {deviceChecks.microphone.error && (
                <span className="text-xs text-red-400">
                  {deviceChecks.microphone.error}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center rounded-md p-4 border text-gray-300">
            <span className="flex gap-4">
              <Speaker /> Check Speaker
            </span>
            <div className="flex items-center gap-2">
              {renderStatusIcon(deviceChecks.speaker.status)}
              {deviceChecks.speaker.status === "success" && (
                <span className="text-xs text-green-400">
                  Sound test passed
                </span>
              )}
              {deviceChecks.speaker.error && (
                <span className="text-xs text-red-400">
                  {deviceChecks.speaker.error}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center rounded-md p-4 border text-gray-300">
            <span className="flex gap-4">
              <Airplay /> Enable Screen Share
            </span>
            <div className="flex items-center gap-2">
              {renderStatusIcon(deviceChecks.screenShare.status)}
              {deviceChecks.screenShare.error && (
                <span className="text-xs text-red-400">
                  {deviceChecks.screenShare.error}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2"
          size="lg"
          disabled={Object.values(deviceChecks).some(
            (check) => check.status !== "success"
          )}
          onClick={() => setCurrentScreen("interviewInstructions")}
        >
          Join Interview
        </Button>
      </CardFooter>
    </Card>
  );

  const renderInterviewInstructions = () => (
    <div className="fixed inset-0 bg-[#1a1f2e] flex flex-col items-center justify-center p-6">
      <div className="absolute top-4 right-4 text-gray-400 text-sm">
        To exit full screen, press{" "}
        <kbd className="px-2 py-1 bg-gray-700 rounded">Esc</kbd>
      </div>

      <div className="max-w-4xl w-full space-y-8">
        <h2 className="text-2xl font-semibold text-white text-center mb-2">
          Interview Instructions ‼️
        </h2>

        <p className="text-center text-gray-200 mb-8">
          You&apos;re in a proctored test environment. If caught in any
          suspicious behaviour, you will be marked{" "}
          <span className="text-red-500 font-semibold">FAIL</span>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg aspect-video flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-200">
              1. Do not look off screen & maintain eye contact with the camera.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg aspect-video flex items-center justify-center">
              <Clock className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-200">
              2. Avoid unusual extended pauses & respond to questions promptly.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg aspect-video flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-200">
              3. Ensure you are the only person visible in the camera frame
              during the interview.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg aspect-video flex items-center justify-center">
              <Chrome className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-200">
              4. Don&apos;t switch between tabs in your web browser
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg aspect-video flex items-center justify-center">
              <Minimize2 className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-200">
              5. Minimizing the screen will lead to you being kicked out.
            </p>
          </div>
        </div>

        <p className="text-center text-green-400 mt-8">
          Stay focused and do your best!
        </p>
        <div className="w-full flex items-center justify-center mt-[-10px]">
          <Button
            className="w-full max-w-md mx-auto bg-indigo-600 hover:bg-indigo-700 mt-8"
            size="lg"
            onClick={() => {
              setCurrentScreen("interviewSection");
            }}
          >
            I Understand, start the interview
          </Button>
        </div>
      </div>
    </div>
  );

  const renderInterviewSection = () => (
    <div className="flex fixed inset-0 flex-col items-center justify-center w-full min-h-screen bg-[#1a1f2e] text-gray-50 p-4">
      <AnimatePresence mode="wait">
        {stage === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center flex flex-col items-center justify-center"
          >
            <Loader2 className="w-16 h-16 animate-spin mb-4" />
            <QuestionDisplay question={questions[currentQuestionIndex]} />
          </motion.div>
        )}

        {stage === "question" && (
          <motion.div
            key="question"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <QuestionDisplay question={questions[currentQuestionIndex]} />
            <Button className="mt-4" onClick={() => setStage("camera")}>
              Start Answer
            </Button>
          </motion.div>
        )}

        {stage === "camera" && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="mb-4">
              <span className="font-bold">
                Question {currentQuestionIndex + 1}/{questions.length}
              </span>
            </div>
            <QuestionDisplay question={questions[currentQuestionIndex]} />
            <div className="mt-4 mb-4 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md h-auto border-2 border-gray-300 rounded-lg"
              />
            </div>
            <Timer duration={60} onComplete={handleNext} />
            <small className="text-xs text-gray-500">
              Can&apos;t use camera here for some reasons still figuring this
              out but might have figured out when you see this <br></br>but this
              is about initialization can&apos;t initialize it two times and
              also can&apos;t pass one stream to another component.
            </small>
            <div className="mt-4 space-x-4">
              <Button onClick={handleNext}>Save & Next</Button>
            </div>
          </motion.div>
        )}

        {stage === "saving" && (
          <motion.div
            key="saving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <Loader2 className="w-16 h-16 animate-spin mb-4 text-center ml-8" />
            <p className="text-lg font-semibold">Taking notes...</p>
          </motion.div>
        )}

        {stage === "completed" && (
          <motion.div
            key="completed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-4">
              Test submitted successfully 🎉
            </h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  const screenComponents = {
    instructions: renderInstructionsScreen,
    permissions: renderPermissionsScreen,
    interviewInstructions: renderInterviewInstructions,
    interviewSection: renderInterviewSection,
  };

  return (
    <>{screenComponents[currentScreen as keyof typeof screenComponents]()}</>
  );
}
