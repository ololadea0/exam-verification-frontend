const MAX_CAPTURE_WIDTH = 960;
const JPEG_QUALITY = 0.9;

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

export default captureCompressedImage;
