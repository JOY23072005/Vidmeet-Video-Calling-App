import React, { createContext, useContext, useState, useCallback } from "react";

interface MediaContextType {
  myStream: MediaStream | null;
  remoteStream: MediaStream | null;
  setMyStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
  // setRemoteStream: (stream: MediaStream | null) => void;
  setRemoteStream: React.Dispatch<React.SetStateAction<MediaStream | null>>;
  cleanup: () => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    console.log("Cleaning up media...");

    myStream?.getTracks().forEach((track) => {
      console.log("Cleaning Client stream!");
      track.stop()
    });
    remoteStream?.getTracks().forEach((track) => {
      console.log("Cleaning remote stream!");
      track.stop()
    });

    setMyStream(null);
    setRemoteStream(null);
  }, [myStream, remoteStream]);

  return (
    <MediaContext.Provider value={{ myStream, remoteStream, setMyStream, setRemoteStream, cleanup }}>
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) throw new Error("useMedia must be used within MediaProvider");
  return context;
};

export default MediaProvider;