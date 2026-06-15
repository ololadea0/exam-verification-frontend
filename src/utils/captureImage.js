const MAX_CAPTURE_WIDTH = 960;
const JPEG_QUALITY = 0.9;
const MAX_QUALITY_SAMPLE_WIDTH = 180;
const MIN_BRIGHTNESS = 55;
const MAX_BRIGHTNESS = 215;
const MIN_CONTRAST = 24;
const MIN_SHARPNESS = 85;

const getScaledSize = (width, height) => {
  if (width <= MAX_CAPTURE_WIDTH) {
    return { width, height };
  }

  const ratio = MAX_CAPTURE_WIDTH / width;

  return {
    width: MAX_CAPTURE_WIDTH,
    height: Math.round(height * ratio),
  };
};

const captureCompressedImage = (video, canvas) => {
  if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
    return null;
  }

  const size = getScaledSize(video.videoWidth, video.videoHeight);

  canvas.width = size.width;
  canvas.height = size.height;

  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, size.width, size.height);

  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
};

const getQualitySample = (sourceCanvas) => {
  const ratio = Math.min(1, MAX_QUALITY_SAMPLE_WIDTH / sourceCanvas.width);
  const width = Math.max(1, Math.round(sourceCanvas.width * ratio));
  const height = Math.max(1, Math.round(sourceCanvas.height * ratio));
  const sampleCanvas = document.createElement("canvas");
  const sampleContext = sampleCanvas.getContext("2d", {
    willReadFrequently: true,
  });

  sampleCanvas.width = width;
  sampleCanvas.height = height;
  sampleContext.drawImage(sourceCanvas, 0, 0, width, height);

  return {
    data: sampleContext.getImageData(0, 0, width, height).data,
    width,
    height,
  };
};

const analyzeImageQuality = (canvas) => {
  const { data, width, height } = getQualitySample(canvas);
  const luminance = new Float32Array(width * height);
  let brightnessTotal = 0;

  for (let index = 0; index < width * height; index += 1) {
    const dataIndex = index * 4;
    const value =
      data[dataIndex] * 0.299 +
      data[dataIndex + 1] * 0.587 +
      data[dataIndex + 2] * 0.114;

    luminance[index] = value;
    brightnessTotal += value;
  }

  const brightness = brightnessTotal / luminance.length;
  let contrastTotal = 0;

  for (let index = 0; index < luminance.length; index += 1) {
    contrastTotal += (luminance[index] - brightness) ** 2;
  }

  const contrast = Math.sqrt(contrastTotal / luminance.length);
  let sharpnessTotal = 0;
  let sharpnessCount = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const laplacian =
        luminance[index - width] +
        luminance[index - 1] -
        luminance[index] * 4 +
        luminance[index + 1] +
        luminance[index + width];

      sharpnessTotal += laplacian ** 2;
      sharpnessCount += 1;
    }
  }

  const sharpness = sharpnessCount ? sharpnessTotal / sharpnessCount : 0;
  const issues = [];

  if (sharpness < MIN_SHARPNESS) {
    issues.push("Image is too blurred. Keep the face steady and refocus.");
  }

  if (brightness < MIN_BRIGHTNESS) {
    issues.push("Lighting is too dim. Move closer to a brighter light.");
  }

  if (brightness > MAX_BRIGHTNESS) {
    issues.push("Lighting is too bright. Reduce glare on the face.");
  }

  if (contrast < MIN_CONTRAST) {
    issues.push("Face detail is too low. Use even lighting and avoid shadows.");
  }

  return {
    brightness,
    contrast,
    sharpness,
    issues,
    isAcceptable: issues.length === 0,
  };
};

export const captureQualityCheckedImage = (video, canvas) => {
  if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
    return null;
  }

  const size = getScaledSize(video.videoWidth, video.videoHeight);

  canvas.width = size.width;
  canvas.height = size.height;

  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, size.width, size.height);

  return {
    image: canvas.toDataURL("image/jpeg", JPEG_QUALITY),
    quality: analyzeImageQuality(canvas),
  };
};

export default captureCompressedImage;
