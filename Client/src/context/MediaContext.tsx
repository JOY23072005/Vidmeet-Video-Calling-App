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
  
    // Clone tracks array before iteration to avoid concurrent modification issues
    const myTracks = myStream ? [...myStream.getTracks()] : [];
    const remoteTracks = remoteStream ? [...remoteStream.getTracks()] : [];
  
    myTracks.forEach((track) => {
      console.log(`Stopping my ${track.kind} track`);
      track.stop();
      myStream?.removeTrack(track); // Explicitly remove track from stream
    });
  
    remoteTracks.forEach((track) => {
      console.log(`Stopping remote ${track.kind} track`);
      track.stop();
      remoteStream?.removeTrack(track); // Explicitly remove track from stream
    });
  
    // Additional cleanup for video elements
    if (myStream) {
      myStream.getVideoTracks().forEach(track => {
        track.enabled = false; // Explicitly disable before stopping
      });
    }
  
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
