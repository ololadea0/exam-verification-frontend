import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CheckCircle, RotateCcw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { reset, verifyStudent } from "../slices/verifyStudentSlice";
import captureCompressedImage from "../utils/captureImage";

function VerifyStudent() {
  const dispatch = useDispatch();
  const { result, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.verify,
  );

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [matricNumber, setMatricNumber] = useState("");
  const [capturedImage, setCapturedImage] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    if (isError && message) {
      toast.error(message);
    }
  }, [isError, message]);

  useEffect(() => {
    if (isSuccess && result) {
      toast[result.verified ? "success" : "error"](
        result.verified ? "Student verified" : "Face did not match",
      );
    }
  }, [isSuccess, result]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsCameraReady(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      dispatch(reset());
    };
  }, [dispatch, stopCamera]);

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
      toast.error("Camera is not ready yet.");
      return;
    }

    setCapturedImage(captureCompressedImage(video, canvas));
    stopCamera();
  };

  const resetVerification = () => {
    stopCamera();
    setMatricNumber("");
    setCapturedImage("");
    dispatch(reset());
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const trimmedMatricNumber = matricNumber.trim();

    if (!trimmedMatricNumber) {
      toast.error("Please enter a matric number.");
      return;
    }

    if (!capturedImage) {
      toast.error("Please capture the student's face before verifying.");
      return;
    }

    await dispatch(
      verifyStudent({
        matric_number: trimmedMatricNumber,
        image: capturedImage,
      }),
    );
  };

  const confidencePercent =
    typeof result?.confidence === "number"
      ? Math.round(
          result.confidence <= 1
            ? result.confidence * 100
            : result.confidence,
        )
      : null;

  const resultStudent = result?.student || {};

  return (
    <main className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl">
        <h2 className="text-foreground mb-6">Verify Student</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="text-foreground mb-4">Verification Details</h3>
            <form className="space-y-4" onSubmit={onSubmit}>
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
                  placeholder="Enter Matric Number"
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  value={matricNumber}
                  onChange={(event) => setMatricNumber(event.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !capturedImage}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Verifying..." : "Verify Student"}
              </button>
            </form>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <h3 className="text-foreground mb-4">Face Capture</h3>
            <div className="space-y-4">
              <div className="relative bg-muted rounded-lg overflow-hidden aspect-video border border-border">
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured student face"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    className={`h-full w-full object-cover ${
                      isCameraReady ? "opacity-100" : "opacity-0"
                    }`}
                    playsInline
                    muted
                  />
                )}
                {!isCameraReady && !capturedImage ? (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <Camera className="w-16 h-16" />
                  </div>
                ) : null}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="flex gap-2">
                {!isCameraReady ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImage("");
                      startCamera();
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {capturedImage ? "Retake Photo" : "Start Camera"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={captureImage}
                    disabled={isLoading}
                    className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Capture Photo
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setCapturedImage("");
                  }}
                  disabled={isLoading}
                  className="px-4 py-2.5 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
                  aria-label="Reset captured image"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {result ? (
          <div
            className={`bg-card rounded-lg shadow-sm border-2 p-6 ${
              result.verified ? "border-green-500" : "border-red-500"
            }`}
          >
            <div className="flex items-start gap-4 mb-4">
              {result.verified ? (
                <CheckCircle className="w-12 h-12 text-green-500" />
              ) : (
                <XCircle className="w-12 h-12 text-red-500" />
              )}
              <div className="flex-1">
                <h3
                  className={`mb-2 ${
                    result.verified ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {result.verified ? "Face Matched" : "Face Not Matched"}
                </h3>
                <div className="space-y-2 text-foreground">
                  <p>
                    <span className="text-muted-foreground">
                      Student Name:
                    </span>{" "}
                    {resultStudent.name || "Unavailable"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      Matric Number:
                    </span>{" "}
                    {resultStudent.matric_number || matricNumber}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Department:</span>{" "}
                    {resultStudent.department || "Unavailable"}
                  </p>
                  <p>
                    <span className="text-muted-foreground">
                      Confidence Score:
                    </span>{" "}
                    {confidencePercent === null
                      ? "Unavailable"
                      : `${confidencePercent}%`}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={resetVerification}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-md hover:bg-primary/90 transition-colors"
            >
              Verify Another Student
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default VerifyStudent;
