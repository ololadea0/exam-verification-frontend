import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  getStudents,
  reset,
  reregisterStudentFace,
} from "../slices/studentSlice";
import captureCompressedImage from "../utils/captureImage";

const CAPTURE_LIMIT = 5;
const CAPTURE_INTERVAL_MS = 2000;

const getStudentId = (student) => student?._id || student?.id;

function ReregisterFace() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { students, isLoading, isError, message } = useSelector(
    (state) => state.students,
  );

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const captureTimerRef = useRef(null);

  const [capturedImages, setCapturedImages] = useState([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const student = useMemo(() => {
    const stateStudent = location.state?.student;

    if (getStudentId(stateStudent) === id) {
      return stateStudent;
    }

    return students.find((item) => getStudentId(item) === id);
  }, [id, location.state, students]);

  const clearCaptureTimer = useCallback(() => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
      captureTimerRef.current = null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsCameraReady(false);
    setIsCapturing(false);
  }, []);

  const resetCapture = useCallback(() => {
    clearCaptureTimer();
    setCapturedImages([]);
    setIsCapturing(false);
  }, [clearCaptureTimer]);

  useEffect(() => {
    if (!student && students.length === 0) {
      dispatch(getStudents());
    }
  }, [dispatch, student, students.length]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
  }, [isError, message]);

  useEffect(() => {
    return () => {
      stopCamera();
      clearCaptureTimer();
      dispatch(reset());
    };
  }, [clearCaptureTimer, dispatch, stopCamera]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraReady(true);
    } catch {
      toast.error("Unable to access camera. Please allow camera permission.");
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      return null;
    }

    return captureCompressedImage(video, canvas);
  };

  const startAutoCapture = async () => {
    if (!isCameraReady) {
      await startCamera();
    }

    clearCaptureTimer();
    setCapturedImages([]);
    setIsCapturing(true);

    let count = 0;
    captureTimerRef.current = setInterval(() => {
      const image = captureImage();

      if (image) {
        count += 1;
        setCapturedImages((prevImages) =>
          [...prevImages, image].slice(0, CAPTURE_LIMIT),
        );
      }

      if (count >= CAPTURE_LIMIT) {
        clearCaptureTimer();
        stopCamera();
        toast.success("Face capture complete");
      }
    }, CAPTURE_INTERVAL_MS);
  };

  const handleSubmit = async () => {
    if (!student) {
      toast.error("Student not found.");
      return;
    }

    if (capturedImages.length === 0) {
      toast.error("Please capture the student's face first.");
      return;
    }

    const action = await dispatch(
      reregisterStudentFace({
        id,
        faceData: {
          image: capturedImages[capturedImages.length - 1],
          images: capturedImages,
        },
      }),
    );

    if (reregisterStudentFace.fulfilled.match(action)) {
      toast.success("Face re-registered successfully");
      navigate("/dashboard/students");
    }
  };

  if (!student && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Student not found</p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/students")}
          className="mt-4 text-primary hover:underline"
        >
          Return to Students List
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate("/dashboard/students")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students List
      </button>

      <h2 className="text-foreground mb-6">Re-register Face</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-foreground mb-4">Student Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-muted-foreground text-sm">
                Full Name
              </label>
              <p className="text-foreground">{student?.name || "Loading..."}</p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm">
                Matric Number
              </label>
              <p className="text-foreground">
                {student?.matric_number || "Loading..."}
              </p>
            </div>
            <div>
              <label className="text-muted-foreground text-sm">
                Department
              </label>
              <p className="text-foreground">
                {student?.department || "Loading..."}
              </p>
            </div>
            <div className="bg-accent border border-border rounded-md p-4">
              <p className="text-muted-foreground text-sm">
                Saving will replace this student's existing biometric face data.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || capturedImages.length === 0}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save New Face"}
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <h3 className="text-foreground mb-4">Face Capture</h3>
          <div className="space-y-4">
            <div className="relative bg-muted rounded-lg overflow-hidden aspect-video border border-border">
              <video
                ref={videoRef}
                className={`h-full w-full object-cover ${
                  isCameraReady ? "opacity-100" : "opacity-0"
                }`}
                playsInline
                muted
              />
              {!isCameraReady ? (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <Camera className="w-16 h-16" />
                </div>
              ) : null}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={startAutoCapture}
                disabled={isCapturing || isLoading}
                className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCapturing ? "Capturing..." : "Start Auto Capture"}
              </button>
              <button
                type="button"
                onClick={resetCapture}
                disabled={isLoading}
                className="px-4 py-2.5 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
                aria-label="Reset captured images"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-muted-foreground text-sm mb-2">
                Captured Images: {capturedImages.length}/{CAPTURE_LIMIT}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: CAPTURE_LIMIT }).map((_, index) => (
                  <button
                    type="button"
                    className="aspect-square bg-muted rounded-lg overflow-hidden border border-border"
                    key={index}
                    disabled
                    aria-label={`Captured image ${index + 1}`}
                  >
                    {capturedImages[index] ? (
                      <div className="relative h-full">
                        <img
                          src={capturedImages[index]}
                          alt={`Captured student face ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <CheckCircle className="absolute right-2 top-2 w-5 h-5 text-primary bg-card rounded-full" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReregisterFace;
