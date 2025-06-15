import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketProvider';
import peer from '../service/peer.ts';
import VideoPlayer from '../components/VideoPlayer.tsx';
import JoinRoomNotification from '../components/JoinRoomNotification.tsx';
import Alert from '../components/Alerts.tsx'
import { useParams, useNavigate } from 'react-router-dom';
import SquareButton from '../components/SquareButton.tsx';
import { useLocation } from 'react-router-dom';
import Chatbox from '../components/Chatbox.tsx';
import { useMedia } from '../context/MediaContext.tsx';

interface MediaState {
  audio: boolean;
  video: boolean;
}

interface UserData {
  name: string;
  id: string;
}

interface CallData {
  name: string;
  from: string;
  offer: RTCSessionDescriptionInit;
}

interface AcceptedCallData {
  from: string;
  ans: RTCSessionDescriptionInit;
}

interface NegoData {
  from: string;
  offer?: RTCSessionDescriptionInit;
  ans?: RTCSessionDescriptionInit;
}

interface MediaStateData {
  to: string;
  type: 'audio' | 'video';
  state: boolean;
}

export default function Room() {
  const [alertMessage, setAlertMessage] = useState<string>('');
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const userName = location.state?.name;
  const [advCtrl, setAdvCtrl] = useState<boolean>(false);
  const [openChat, setOpenChat] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);

  const [showNotification, setShowNotification] = useState<boolean>(false);
  const socket = useSocket();
  const [remoteName, setRemoteName] = useState<string>("");
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const { myStream, setMyStream, remoteStream, setRemoteStream } = useMedia();
  const [connectionState, setConnectionState] = useState<string>('new');
  const [iceConnectionState, setIceConnectionState] = useState<string>('new');

  const [localMediaState, setLocalMediaState] = useState<MediaState>({
    audio: true,
    video: true
  });

  const [remoteMediaState, setRemoteMediaState] = useState<MediaState>({
    audio: true,
    video: true
  });

  const toggleLocalAudio = () => {
    if (myStream) {
      const newAudioState = !localMediaState.audio;
      myStream.getAudioTracks().forEach(track => {
        track.enabled = newAudioState;
      });
      
      setLocalMediaState(prev => ({ ...prev, audio: newAudioState }));
      
      if (remoteSocketId) {
        socket?.emit('media:state', {
          to: remoteSocketId,
          type: 'audio',
          state: newAudioState
        } as MediaStateData);
      }
    }
  };

  const toggleLocalVideo = () => {
    if (myStream) {
      const newVideoState = !localMediaState.video;
      myStream.getVideoTracks().forEach(track => {
        track.enabled = newVideoState;
      });
      
      setLocalMediaState(prev => ({ ...prev, video: newVideoState }));
      
      if (remoteSocketId) {
        socket?.emit('media:state', {
          to: remoteSocketId,
          type: 'video',
          state: newVideoState
        } as MediaStateData);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peer?.peer?.getSenders().find(s => s.track?.kind === 'video');

        if (sender) {
          await sender.replaceTrack(screenTrack);
          console.log('Screen track replaced');
        }

        setMyStream(screenStream);
        setIsScreenSharing(true);

        screenTrack.onended = async () => {
          console.log('Screen share ended');
          const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          const camTrack = camStream.getVideoTracks()[0];
          const sender = peer?.peer?.getSenders().find(s => s.track?.kind === 'video');
          if (sender) await sender.replaceTrack(camTrack);

          setMyStream(camStream);
          setIsScreenSharing(false);
        };
      } catch (err) {
        console.error('Error sharing screen:', err);
      }
    } else {
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const camTrack = camStream.getVideoTracks()[0];
        const sender = peer?.peer?.getSenders().find(s => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(camTrack);

        setMyStream(camStream);
        setIsScreenSharing(false);
      } catch (err) {
        console.error('Error reverting to camera:', err);
      }
    }
  };

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("visited");
  
    if (hasVisited) {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/", { replace: true });
      }
    } else {
      sessionStorage.setItem("visited", "true");
    }
    setAlertMessage(`Room Code : ${roomId}`);
    return () => sessionStorage.removeItem("visited");
  }, []);

  const handleUserJoined = useCallback(({ name, id }: UserData) => {
    console.log(`Email ${name} joined!`);
    setRemoteSocketId(id);
    setRemoteName(name);
    setAlertMessage("");
    setShowNotification(true);
  }, []);

  const handleRemoteMediaState = useCallback(({ type, state }: { type: keyof MediaState, state: boolean }) => {
    setRemoteMediaState(prev => ({
      ...prev,
      [type]: state
    }));
  }, []);

  useEffect(() => {
    socket?.on('media:state', handleRemoteMediaState);
    return () => {
      socket?.off('media:state', handleRemoteMediaState);
    };
  }, [socket, handleRemoteMediaState]);

  const sendStream = useCallback((stream: MediaStream) => {
    const pc:RTCPeerConnection | null = peer?.peer;
    
    const senders = pc?.getSenders();
    senders?.forEach(sender => {
      if (sender.track) {
        console.log('Removing existing track:', sender.track.kind);
        pc?.removeTrack(sender);
      }
    });
    
    stream.getTracks().forEach(track => {
      console.log('Adding track:', track.kind, track.id, 'enabled:', track.enabled, 'readyState:', track.readyState);
      pc?.addTrack(track, stream);
    });

    console.log('Stream sent, total senders:', pc?.getSenders().length);
  }, []);

  const handleCallUser = useCallback(async () => {
    try {
      const constraints = {
        audio: true,
        video: true
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMyStream(stream);
      setLocalMediaState({ audio: true, video: true });
      sendStream(stream);
      
      const offer = await peer.getOffer();
      socket?.emit('user:call', { to: remoteSocketId, offer: offer });
    } catch (err) {
      console.error('Error accessing media devices: ', err);
    }
  }, [remoteSocketId, socket, sendStream]);

  const handleJoinResponse = useCallback((response: boolean) => {
    setShowNotification(false);
    if (response) {
      handleCallUser();
    }
  }, [remoteName, handleCallUser]);

  useEffect(() => {
    const peerConnection = peer.peer;

    const handleIceCandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate && remoteSocketId) {
        console.log('Sending ICE candidate:', {
          type: event.candidate.type,
          protocol: event.candidate.protocol,
          address: event.candidate.address || 'hidden',
          port: event.candidate.port
        });
        socket?.emit('ice-candidate', { 
          to: remoteSocketId, 
          candidate: event.candidate 
        });
      } else if (!event.candidate) {
        console.log('ICE gathering complete');
        socket?.emit('ice-candidate', { 
          to: remoteSocketId, 
          candidate: null 
        });
      }
    };

    peerConnection?.addEventListener('icecandidate', handleIceCandidate);
    return () => peerConnection?.removeEventListener('icecandidate', handleIceCandidate);
  }, [socket, remoteSocketId]);

  useEffect(() => {
    const handleNewIceCandidate = async ({ candidate }: { candidate: RTCIceCandidate }) => {
      if (candidate) {
        try {
          console.log('Receiving ICE candidate:', candidate);
          await peer.addIceCandidate(candidate);
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    };

    socket?.on('ice-candidate', handleNewIceCandidate);
    return () => {socket?.off('ice-candidate', handleNewIceCandidate);}
  }, [socket]);

  const handleIncommingCall = useCallback(async (data: CallData) => {
    const { name, from, offer } = data;
    console.log(`Incoming call from ${name}`);
    setRemoteName(name);
    setRemoteSocketId(from);
    setAlertMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      setMyStream(stream);
      setLocalMediaState({ audio: true, video: true });
      sendStream(stream);

      const ans = await peer.getAnswer(offer);
      socket?.emit('call:accepted', { to: from, ans: ans });
    } catch (err) {
      console.error('Error accessing media devices: ', err);
    }
  }, [socket, sendStream]);

  const handleCallAccepted = useCallback(
    async (data: AcceptedCallData) => {
      const { from, ans } = data;
      console.log('Setting remote answer...'+' '+ from);
      console.log('Current signaling state before set:', peer?.peer?.signalingState);
      console.log('Current ICE state:', peer?.peer?.iceConnectionState);
      
      try {
        await peer.setRemoteDescription(ans);
        console.log('Remote description set successfully');
        console.log('New signaling state:', peer?.peer?.signalingState);
      } catch (err) {
        console.error('Failed to set remote description:', err);
        peer.recreate();
        if (myStream) {
          sendStream(myStream);
          const newOffer = await peer.getOffer();
          socket?.emit('user:call', { to: remoteSocketId, offer: newOffer });
        }
      }
    },
    [myStream, remoteSocketId, socket, sendStream]
  );

  useEffect(() => {
    const peerConnection = peer.peer;

    const handleTrack = (ev: RTCTrackEvent) => {
      console.log('Track event received:', ev);
      console.log('Event streams:', ev.streams?.length || 0);
      console.log('Event track:', ev.track?.kind, ev.track?.id);
      
      if (ev.streams && ev.streams.length > 0) {
        const stream = ev.streams[0];
        console.log("Received remote stream:", stream.id);
        console.log("Stream tracks:", stream.getTracks().map(t => `${t.kind}: ${t.id} (${t.readyState})`));
        
        const liveTracks = stream.getTracks().filter(track => track.readyState === 'live');
        console.log("Live tracks:", liveTracks.length);
        
        if (liveTracks.length > 0) {
          setRemoteStream((prevStream: MediaStream | null) => {
            if (!prevStream || prevStream.id !== stream.id) {
              console.log('Setting new remote stream with', liveTracks.length, 'live tracks');
              return stream;
            }
            return prevStream;
          });
        } else {
          console.warn('No live tracks in received stream');
        }
      } else {
        console.warn('No streams in track event');
      }
    };

    peerConnection?.addEventListener('track', handleTrack);
    return () => peerConnection?.removeEventListener('track', handleTrack);
  }, []);

  const handleNegoNeedIn = useCallback(
    async ({ from, offer }: NegoData) => {
      console.log('Negotiation needed incoming');
      const ans = await peer.getAnswer(offer!);
      socket?.emit('peer:nego:done', { to: from, ans: ans });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async ({ from, ans }: NegoData) => {
    console.log('Final negotiation step'+' '+from);
    await peer.setRemoteDescription(ans!);
  }, []);

  const handleNegoNeeded = useCallback(async () => {
    if (!myStream || !remoteSocketId) return;

    try {
      console.log("Negotiation needed - creating new offer");
      const offer = await peer.getOffer();
      socket?.emit('peer:nego:needed', { 
        to: remoteSocketId, 
        offer: offer 
      });
    } catch (err) {
      console.error("Negotiation error:", err);
    }
  }, [remoteSocketId, socket, myStream]);

  useEffect(() => {
    const pc = peer.peer;
    pc?.addEventListener('negotiationneeded', handleNegoNeeded);
    return () => pc?.removeEventListener('negotiationneeded', handleNegoNeeded);
  }, [handleNegoNeeded]);

  useEffect(() => {
    socket?.on('user:joined', handleUserJoined);
    socket?.on('incomming:call', handleIncommingCall);
    socket?.on('call:accepted', handleCallAccepted);
    socket?.on('peer:nego:needed', handleNegoNeedIn);
    socket?.on('peer:nego:final', handleNegoFinal);
    
    return () => {
      socket?.off('user:joined', handleUserJoined);
      socket?.off('incomming:call', handleIncommingCall);
      socket?.off('call:accepted', handleCallAccepted);
      socket?.off('peer:nego:needed', handleNegoNeedIn);
      socket?.off('peer:nego:final', handleNegoFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIn,
    handleNegoFinal,
  ]);

  const handleCallEnd = useCallback(() => {
    console.log("call Ended!");
    if (myStream) {
      myStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    setMyStream(null);
    setRemoteStream(null);
    setRemoteSocketId(null);
    navigate('/Vidmeet');
  }, [myStream, remoteStream]);

  useEffect(() => {
    socket?.on('call:ended', handleCallEnd);
    return () => {socket?.off('call:ended', handleCallEnd);}
  }, [socket, handleCallEnd]);


  useEffect(() => {
    const pc = peer.peer;
    
    const handleIceConnectionChange = () => {
      const state = pc?.iceConnectionState;
      console.log('ICE connection state:', state);
      setIceConnectionState(state?state:'');
      
      if (state === 'failed') {
        console.log('ICE connection failed, attempting restart...');
        pc?.restartIce();
      }
    };
    
    const handleConnectionStateChange = () => {
      const state = pc?.connectionState;
      console.log('Connection state:', state);
      if(state==="failed"){
        // console.log("yes it got failed buddy");
        handleCallEnd();
      }
      setConnectionState(state?state:'');
    };

    const handleIceGatheringStateChange = () => {
      console.log('ICE gathering state:', pc?.iceGatheringState);
    };

    pc?.addEventListener('iceconnectionstatechange', handleIceConnectionChange);
    pc?.addEventListener('connectionstatechange', handleConnectionStateChange);
    pc?.addEventListener('icegatheringstatechange', handleIceGatheringStateChange);
    
    return () => {
      pc?.removeEventListener('iceconnectionstatechange', handleIceConnectionChange);
      pc?.removeEventListener('connectionstatechange', handleConnectionStateChange);
      pc?.removeEventListener('icegatheringstatechange', handleIceGatheringStateChange);
    };
  }, [handleCallEnd]);

  const handleAlertClick = () => {
    const match = alertMessage.match(/Room Code\s*:\s*([A-Z0-9]{10})/i);
    if (match && match[1]) {
      const roomCode = match[1];
      navigator.clipboard.writeText(roomCode)
        .then(() => {
          console.log("Room code copied:", roomCode);
        })
        .catch(err => {
          console.error("Failed to copy room code:", err);
        });
    }
  };

  const handleAlertClick2 = () =>{
    setOpenChat(true);
  }

  return (
    <main>
      <section className='p-5 w-full h-full'>
        <div className='flex justify-center align-center'>
          {showNotification && (
            <JoinRoomNotification 
              message={`${remoteName} is trying to join the meeting!`}
              roomName="Awesome VidMeet Room"
              onResponse={handleJoinResponse}
              autoClose={8000}
            />
          )}

          {!openChat && (
            <Alert 
              message={alertMessage} 
              onClick={openChat?handleAlertClick2:handleAlertClick}
              onClose={() => setAlertMessage('')}
              type="info"
              autoClose={false}
            />
          )}

          <div className={`w-full flex grid ${openChat?'lg:grid-cols-2':''}`}>
            <div className={`relative mx-auto px-5 w-5/6  ${openChat?"max-lg:hidden":""}`}>
              <div className='absolute max-md:bottom-[150px] z-20 bottom-[90px] right-0'>
                {myStream ? (
                  <div className="relative">
                    <h4>{userName}</h4>
                    <VideoPlayer 
                      stream={myStream}
                      isLocal={true}
                      title="You"
                      className="h-[150px] max-w-xs"
                      handleCallEnd={handleCallEnd}
                      onError={(error) => console.error('Local video failed:', error)}
                    />
                    {!localMediaState.video && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                        <div className="text-white text-sm">Your video is off</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-[200px] h-[150px] border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-100">
                    No local stream
                  </div>
                )}
              </div>

              <div>
                {remoteStream ? (
                  <div className="relative">
                    <h4>{remoteName}</h4>
                    <VideoPlayer 
                      stream={remoteStream} 
                      isLocal={false} 
                      title={`${remoteName || 'Remote'} ${!remoteMediaState.audio ? '(Muted)' : ''}`}
                      className='w-full h-[80vh]'
                      handleCallEnd={handleCallEnd}
                      onError={(error) => console.error('Remote video failed:', error)}
                    />
                    {!remoteMediaState.video && (
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                        <div className="text-white text-lg">
                          {remoteName || 'Remote'} video is off
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-[80vh] border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-100">
                    No remote stream
                  </div>
                )}
              </div>
              <div className='w-5/6 flex max-md:grid max-md:grid-cols-3 mx-auto rounded-lg p-1 my-5 container card justify-center max-md:ps-5 gap-4'>
                <SquareButton 
                  icon={localMediaState.audio ? "Mic" : "MicOff"} 
                  bgColor={localMediaState.audio ? "#11CEAD" : "#ef4444"} 
                  title={"Turn "+(localMediaState.audio ? "Mic off" : "Mic on")}
                  onClick={toggleLocalAudio}
                />
                
                <SquareButton 
                  icon={localMediaState.video ? "Video" : "VideoOff"} 
                  bgColor={localMediaState.video ? "#11CEAD" : "#ef4444"} 
                  title={"Turn "+(localMediaState.video ? "Video off" : "Video on")}
                  onClick={toggleLocalVideo}
                />
                
                <SquareButton 
                  icon="Phone" 
                  bgColor="#ef4444" 
                  title='Hang Up'
                  onClick={() => {
                    if (myStream) {
                      myStream.getTracks().forEach(track => track.stop());
                    }
                    if (remoteStream) {
                      remoteStream.getTracks().forEach(track => track.stop());
                    }
                    if (remoteSocketId) {
                      socket?.emit('call:end', { to: remoteSocketId });
                    }
                    setMyStream(null);
                    setRemoteStream(null);
                    setRemoteSocketId(null);
                    navigate('/Vidmeet');
                  }}
                />

                <SquareButton
                  icon="MessageCircle" 
                  bgColor={!openChat? "#11CEAD" : "#ef4444"} 
                  title='Chat'
                  onClick={() => {
                    setOpenChat(!openChat);
                  }}
                />
                
                <SquareButton
                  icon="MonitorUp" 
                  bgColor={!isScreenSharing? "#11CEAD" : "#ef4444"} 
                  title='Share Screen'
                  onClick={toggleScreenShare}
                />

                <SquareButton 
                  icon="Settings2" 
                  bgColor="#82C2D9" 
                  title='Advanced Controls'
                  onClick={() => {
                    setAdvCtrl(!advCtrl);
                  }}
                />
              </div>
            </div>

            <div className={`w-full h-[80vh] flex justify-center align-center ${openChat?'':'hidden'}`}>
              <Chatbox 
                setOpenChat={setOpenChat} 
                remoteSocketId={remoteSocketId} 
                remoteName={remoteName} 
                setAlertMessage={setAlertMessage}
              />
            </div>
          </div>
        </div>
        
        <div className={advCtrl?"":"hidden"}>
          <div className='text-subheading' style={{ marginTop: '10px', padding: '10px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '5px' }}>
            <strong>Connection Status:</strong>
            <br />
            ICE State: <span style={{ color: iceConnectionState === 'connected' ? 'green' : 'orange' }}>
              {iceConnectionState}
            </span>
            <br />
            Connection State: <span style={{ color: connectionState === 'connected' ? 'green' : 'orange' }}>
              {connectionState}
            </span>
          </div>
          
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h4>Debug Controls</h4>
            <div style={{ marginBottom: '10px' }}>
              <button 
                onClick={() => {
                  document.querySelectorAll('video').forEach(video => {
                    if (video.srcObject) {
                      console.log('Forcing video play for:', video.srcObject);
                      video.play().catch(e => console.error('Force play failed:', e));
                    }
                  });
                }}
                style={{ marginRight: '10px' }}
              >
                Force Play All Videos
              </button>

              <button 
                onClick={async () => {
                  if (peer.peer) {
                    const stats = await peer?.peer?.getStats();
                    console.log('=== CONNECTION STATS ===');
                    
                    let videoReceived = false;
                    let videoSent = false;
                    
                    stats.forEach((report: any) => {
                      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                        console.log('Inbound video stats:', {
                          bytesReceived: report.bytesReceived,
                          framesReceived: report.framesReceived,
                          framesDecoded: report.framesDecoded,
                          framesDropped: report.framesDropped,
                          timestamp: report.timestamp
                        });
                        videoReceived = report.bytesReceived > 0;
                      }
                      if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
                        console.log('Outbound video stats:', {
                          bytesSent: report.bytesSent,
                          framesSent: report.framesSent,
                          timestamp: report.timestamp
                        });
                        videoSent = report.bytesSent > 0;
                      }
                      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                        console.log('Active candidate pair:', {
                          state: report.state,
                          bytesReceived: report.bytesReceived,
                          bytesSent: report.bytesSent
                        });
                      }
                    });
                    
                    console.log('Summary:', {
                      videoReceived,
                      videoSent,
                      iceState: peer?.peer?.iceConnectionState,
                      connectionState: peer?.peer?.connectionState
                    });
                  }
                }}
              >
                Check Connection Stats
              </button>

              <button 
                onClick={() => {
                  if (peer.peer) {
                    console.log('=== PEER CONNECTION DEBUG ===');
                    console.log('Signalig State:', peer?.peer?.signalingState);
                    console.log('ICE Connection State:', peer?.peer?.iceConnectionState);
                    console.log('ICE Gathering State:', peer?.peer?.iceGatheringState);
                    console.log('Connection State:', peer?.peer?.connectionState);
                    
                    const senders = peer?.peer?.getSenders();
                    console.log('Senders:', senders.length);
                    senders.forEach((sender, i) => {
                      console.log(`Sender ${i}:`, {
                        track: sender.track ? `${sender.track.kind} (${sender.track.readyState})` : 'null'
                      });
                    });
                    
                    const receivers = peer?.peer?.getReceivers();
                    console.log('Receivers:', receivers.length);
                    receivers.forEach((receiver, i) => {
                      console.log(`Receiver ${i}:`, {
                        track: receiver.track ? `${receiver.track.kind} (${receiver.track.readyState})` : 'null'
                      });
                    });
                  }
                }}
                style={{ marginLeft: '10px' }}
              >
                Debug Peer Connection
              </button>
            </div>
            
            <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
              <p><strong>Connection Info:</strong></p>
              <p>Remote Socket ID: {remoteSocketId || 'None'}</p>
              <p>My Stream: {myStream ? `Active (${myStream.getTracks().length} tracks)` : 'None'}</p>
              <p>Remote Stream: {remoteStream ? `Active (${remoteStream.getTracks().length} tracks)` : 'None'}</p>
              {remoteStream && (
                <div>
                  <p><strong>Remote Stream Details:</strong></p>
                  <p>Stream ID: {remoteStream.id}</p>
                  {remoteStream.getTracks().map((track, index) => (
                    <p key={index}>
                      Track {index + 1}: {track.kind} - {track.readyState} - 
                      {track.enabled ? ' enabled' : ' disabled'} - 
                      {track.muted ? ' muted' : ' unmuted'}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
