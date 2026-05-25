import "./loading.css";

function Loading() {
  return (
    <div className="page-loader-container">
      <div className="loader-card">
        <div className="spinner-ring">
          <img
            src="https://res.cloudinary.com/djw640wo2/image/upload/v1778417037/LAUTECH_logo_rd63if.png"
            alt="LAUTECH Logo"
            className="loader-logo"
          />
        </div>
        <div className="loading-text">Loading...</div>
      </div>
    </div>
  );
}

export default Loading;
