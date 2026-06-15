import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Camera, CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { registerStudent, reset } from "../slices/studentSlice";
import FACULTIES from "../constants/faculties";
import { captureQualityCheckedImage } from "../utils/captureImage";

const emptyForm = {
  first_name: "",
  last_name: "",
  matric_number: "",
  faculty: "",
  department: "",
};

const CAPTURE_LIMIT = 5;
const CAPTURE_INTERVAL_MS = 2000;
const MAX_CAPTURE_ATTEMPTS = 12;

const capitalizeNamePart = (value) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const formatDurationMs = (durationMs) => {
  const value = Number(durationMs);

  if (!Number.isFinite(value)) {
    return "Unavailable";
  }

  return `${Math.round(value * 100) / 100} ms`;
};

function RegisterStudent() {
  const dispatch = useDispatch();
  const { isLoading, isError, message } = useSelector(
    (state) => state.students,
  );

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const captureTimerRef = useRef(null);

  const [formData, setFormData] = useState(emptyForm);
  const [capturedImages, setCapturedImages] = useState([]);
  const [captureFeedback, setCaptureFeedback] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const selectedFaculty = FACULTIES.find(
    (faculty) => faculty.name === formData.faculty,
  );

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
    setCaptureFeedback("");
    setIsCapturing(false);
  }, [clearCaptureTimer]);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
  }, [isError, message]);

  useEffect(() => {
    return () => {
      stopCamera();
      clearCaptureTimer();
    };
  }, [clearCaptureTimer, stopCamera]);

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
      return true;
    } catch {
      toast.error("Unable to access camera. Please allow camera permission.");
      return false;
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      return null;
    }

    return captureQualityCheckedImage(video, canvas);
  };

  const startAutoCapture = async () => {
    if (!isCameraReady) {
      const started = await startCamera();

      if (!started) {
        return;
      }
    }

    clearCaptureTimer();
    setCapturedImages([]);
    setCaptureFeedback("Hold steady while the camera checks image quality.");
    setIsCapturing(true);

    let count = 0;
    let attempts = 0;
    captureTimerRef.current = setInterval(() => {
      const capture = captureImage();
      attempts += 1;

      if (capture?.quality?.isAcceptable) {
        count += 1;
        setCaptureFeedback(
          `Accepted frame ${count}/${CAPTURE_LIMIT}. Keep the face steady.`,
        );
        setCapturedImages((prevImages) =>
          [...prevImages, capture.image].slice(0, CAPTURE_LIMIT),
        );
      } else if (capture?.quality?.issues?.length) {
        const feedback = capture.quality.issues[0];
        setCaptureFeedback(feedback);
        toast.error(feedback);
      }

      if (count >= CAPTURE_LIMIT) {
        clearCaptureTimer();
        stopCamera();
        setCaptureFeedback("");
        toast.success("Face capture complete");
      } else if (attempts >= MAX_CAPTURE_ATTEMPTS) {
        clearCaptureTimer();
        stopCamera();
        setCaptureFeedback(
          "Capture stopped because the image quality was not good enough. Please try again.",
        );
        toast.error(
          "Capture stopped. Please retake with a steady face and clear lighting.",
        );
      }
    }, CAPTURE_INTERVAL_MS);
  };

  const onChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
      ...(name === "faculty" && { department: "" }),
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (capturedImages.length === 0) {
      toast.error("Please capture the student's face before registering.");
      return;
    }

    const payload = {
      name: [
        capitalizeNamePart(formData.first_name),
        capitalizeNamePart(formData.last_name),
      ]
        .filter(Boolean)
        .join(" "),
      matric_number: formData.matric_number.trim(),
      department: formData.department.trim(),
      image: capturedImages[capturedImages.length - 1],
      images: capturedImages,
    };

    const action = await dispatch(registerStudent(payload));

    if (registerStudent.fulfilled.match(action)) {
      toast.success(
        `Student registered successfully. Time used: ${formatDurationMs(
          action.payload?.durationMs,
        )}.`,
      );
      setFormData(emptyForm);
      resetCapture();
      dispatch(reset());
    }
  };

  return (
    <div>
      <h2 className="text-foreground mb-6">Register Student</h2>
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="text-foreground mb-4">Student Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-foreground mb-2"
                    htmlFor="first_name"
                  >
                    First Name
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    value={formData.first_name}
                    onChange={onChange}
                    onBlur={(event) =>
                      setFormData((prevState) => ({
                        ...prevState,
                        first_name: capitalizeNamePart(event.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <label
                    className="block text-foreground mb-2"
                    htmlFor="last_name"
                  >
                    Last Name
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    value={formData.last_name}
                    onChange={onChange}
                    onBlur={(event) =>
                      setFormData((prevState) => ({
                        ...prevState,
                        last_name: capitalizeNamePart(event.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-foreground mb-2"
                  htmlFor="matric_number"
                >
                  Matric Number
                </label>
                <input
                  id="matric_number"
                  name="matric_number"
                  type="text"
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  value={formData.matric_number}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-foreground mb-2" htmlFor="faculty">
                  Faculty
                </label>
                <select
                  id="faculty"
                  name="faculty"
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  value={formData.faculty}
                  onChange={onChange}
                >
                  <option value="">Select faculty</option>
                  {FACULTIES.map((faculty) => (
                    <option value={faculty.name} key={faculty.name}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-foreground mb-2"
                  htmlFor="department"
                >
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                  disabled={!selectedFaculty}
                  value={formData.department}
                  onChange={onChange}
                >
                  <option value="">
                    {selectedFaculty
                      ? "Select department"
                      : "Select faculty first"}
                  </option>
                  {selectedFaculty?.departments.map((department) => (
                    <option value={department} key={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
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
                {captureFeedback ? (
                  <p className="text-muted-foreground text-sm mb-2">
                    {captureFeedback}
                  </p>
                ) : null}
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
        <button
          type="submit"
          disabled={isLoading || capturedImages.length === 0}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Registering..." : "Register Student"}
        </button>
      </form>
    </div>
  );
}

export default RegisterStudent;
