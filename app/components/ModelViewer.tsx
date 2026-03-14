"use client";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": any;
    }
  }
}

export default function ModelViewer({ url }: { url: string }) {
  if (!url) return null;

  return (
    <div className="relative border border-purple-200 rounded-xl overflow-hidden shadow-lg">
      <model-viewer
        src={url}
        alt="3D House Model"
        auto-rotate
        camera-controls
        shadow-intensity="2"
        shadow-softness="1"
        environment-image="neutral"
        exposure="1.2"
        auto-rotate-delay="0"
        rotation-per-second="30deg"
        style={{
          width: "100%",
          height: "380px",
          backgroundColor: "#f0f4ff",
        }}
      >
        <div slot="progress-bar" style={{ display: "none" }} />
      </model-viewer>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
        <span className="bg-black bg-opacity-40 text-white text-xs px-3 py-1 rounded-full">
          🖱️ Drag to rotate · Scroll to zoom
        </span>
      </div>
    </div>
  );
}