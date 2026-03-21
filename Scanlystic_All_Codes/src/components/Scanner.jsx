import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function Scanner({ onScan }) {
  const scannerRef = useRef(null);
  const runningRef = useRef(false);
  const lockRef = useRef(false);

  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");

  const stopCamera = async () => {
    try {
      if (scannerRef.current && runningRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      }
    } catch {}

    runningRef.current = false;
    lockRef.current = false;
    setStatus("Stopped");
  };

  const startCamera = async () => {
    if (runningRef.current) return;

    try {
      setError("");
      setStatus("Checking camera...");

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras?.length) throw new Error("No camera found");

      const preferred =
        cameras.find(cam =>
          /back|rear|environment/i.test(cam.label)
        ) || cameras[0];

      scannerRef.current =
        scannerRef.current || new Html5Qrcode("reader");

      await scannerRef.current.start(
        { deviceId: { exact: preferred.id } },
        {
          fps: 12,
          qrbox: { width: 260, height: 160 }
        },
        async decodedText => {
          if (lockRef.current) return;

          lockRef.current = true;
          setStatus("Code detected");

          onScan(decodedText.trim());
          await stopCamera();

          setTimeout(() => {
            lockRef.current = false;
          }, 1000);
        }
      );

      runningRef.current = true;
      setStatus("Camera on");
    } catch (err) {
      console.error(err);
      setError("Camera failed. Allow permission + use HTTPS.");
      setStatus("Failed");
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="scannerCard">
      <div className="sectionHead">
        <div>
          <div className="eyebrow">Scanner</div>
          <h2>Scan barcode or QR</h2>
        </div>
        <div className="statusPill">{status}</div>
      </div>

      <div className="cameraFrame">
        <div id="reader" />
      </div>

      {error && <p className="errorText">{error}</p>}

      <div className="scannerActions">
        <button className="btnPrimary" onClick={startCamera}>
          Start Camera
        </button>
        <button className="btnGhost" onClick={stopCamera}>
          Stop Camera
        </button>
      </div>
    </div>
  );
}