class PeerService {
    peer: RTCPeerConnection | null = null;
    pendingIceCandidates: RTCIceCandidateInit[] = [];
    isNegotiating: boolean = false;
    makingOffer: boolean = false;
    ignoreOffer: boolean = false;

    constructor() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun1.l.google.com:19302" },
                    { urls: "stun:stun2.l.google.com:19302" },
                    { urls: "stun:stun3.l.google.com:19302" }
                ],
                iceTransportPolicy: 'all',
                iceCandidatePoolSize: 5,
                bundlePolicy: 'max-bundle',
                rtcpMuxPolicy: 'require'
            });

            this.setupEventHandlers();
        }
    }

    setupEventHandlers(): void {
        this.peer!.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                console.log('ICE candidate generated:', {
                    type: event.candidate.type,
                    protocol: event.candidate.protocol,
                    address: event.candidate.address || 'hidden',
                    port: event.candidate.port
                });
            } else {
                console.log('ICE gathering complete');
            }
        };

        this.peer!.oniceconnectionstatechange = () => {
            console.log('ICE connection state changed:', this.peer!.iceConnectionState);
            if (this.peer!.iceConnectionState === 'failed') {
                console.log('ICE connection failed, attempting restart...');
                this.peer!.restartIce();
            }
        };

        this.peer!.onconnectionstatechange = () => {
            console.log('Connection state changed:', this.peer!.connectionState);
        };

        this.peer!.onsignalingstatechange = () => {
            console.log('Signaling state changed:', this.peer!.signalingState);
            if (this.peer!.signalingState === 'stable') {
                this.isNegotiating = false;
                this.makingOffer = false;
            }
        };

        this.peer!.ontrack = (event: RTCTrackEvent) => {
            console.log('Track event received in peer service:', {
                kind: event.track?.kind,
                id: event.track?.id,
                streams: event.streams?.length || 0
            });
        };

        this.peer!.ondatachannel = (event: RTCDataChannelEvent) => {
            console.log('Data channel received:', event.channel.label);
        };
    }

    async getOffer(): Promise<RTCSessionDescriptionInit | null> {
        try {
            if (this.isNegotiating) return null;
            this.makingOffer = true;

            const offer = await this.peer!.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });

            if (
                this.peer!.signalingState !== 'stable' &&
                this.peer!.signalingState !== 'have-local-offer'
            ) {
                this.makingOffer = false;
                return null;
            }

            await this.peer!.setLocalDescription(offer);
            return offer;
        } catch (err) {
            console.error("Create offer error:", err);
            this.makingOffer = false;
            throw err;
        }
    }

    async getAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> {
        try {
            const currentState = this.peer!.signalingState;

            const readyForOffer =
                currentState === 'stable' ||
                (currentState === 'have-local-offer' && !this.makingOffer);

            if (!readyForOffer) {
                if (currentState === 'have-local-offer') {
                    if (!this.makingOffer) {
                        await this.peer!.setLocalDescription({ type: 'rollback' });
                    } else {
                        return null;
                    }
                }
            }

            await this.peer!.setRemoteDescription(new RTCSessionDescription(offer));
            await this.processPendingIceCandidates();

            const answer = await this.peer!.createAnswer();
            await this.peer!.setLocalDescription(answer);

            return answer;
        } catch (err) {
            console.error("Create answer error:", err);
            throw err;
        }
    }

    async setRemoteDescription(ans: RTCSessionDescriptionInit): Promise<void> {
        try {
            if (this.peer!.signalingState !== 'have-local-offer') {
                console.warn('Not in correct state to set remote answer, current state:', this.peer!.signalingState);
                this.recreate();
                return;
            }

            await this.peer!.setRemoteDescription(new RTCSessionDescription(ans));
            await this.processPendingIceCandidates();
        } catch (err) {
            console.error("Set remote description error:", err);
            this.recreate();
            throw err;
        }
    }

    async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
        try {
            if (this.peer!.remoteDescription && this.peer!.remoteDescription.type) {
                await this.peer!.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                this.pendingIceCandidates.push(candidate);
            }
        } catch (err) {
            console.error("Error adding ICE candidate:", err);
        }
    }

    async processPendingIceCandidates(): Promise<void> {
        const candidates = [...this.pendingIceCandidates];
        this.pendingIceCandidates = [];

        for (const candidate of candidates) {
            try {
                await this.peer!.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error('Error processing pending ICE candidate:', err);
            }
        }
    }

    async createOfferSafely(): Promise<RTCSessionDescriptionInit | null> {
        if (this.peer!.signalingState !== 'stable') return null;
        if (this.isNegotiating) return null;

        this.isNegotiating = true;
        return this.getOffer();
    }

    canHandleOffer(): boolean {
        const state = this.peer!.signalingState;
        return state === 'stable' || (state === 'have-local-offer' && !this.makingOffer);
    }

    async getStats(): Promise<RTCStatsReport | null> {
        try {
            return await this.peer!.getStats();
        } catch (err) {
            console.error("Error getting stats:", err);
            return null;
        }
    }

    isConnected(): boolean {
        return (
            this.peer!.iceConnectionState === 'connected' ||
            this.peer!.iceConnectionState === 'completed'
        ) && this.peer!.connectionState === 'connected' &&
        this.peer!.signalingState === 'stable';
    }

    getConnectionInfo() {
        return {
            iceConnectionState: this.peer!.iceConnectionState,
            connectionState: this.peer!.connectionState,
            signalingState: this.peer!.signalingState,
            iceGatheringState: this.peer!.iceGatheringState,
            senders: this.peer!.getSenders().length,
            receivers: this.peer!.getReceivers().length,
            pendingCandidates: this.pendingIceCandidates.length,
            isNegotiating: this.isNegotiating,
            makingOffer: this.makingOffer
        };
    }

    restartIce(): void {
        try {
            this.peer!.restartIce();
        } catch (err) {
            console.error('Error restarting ICE:', err);
        }
    }

    close(): void {
        if (this.peer) {
            this.pendingIceCandidates = [];
            this.isNegotiating = false;
            this.makingOffer = false;
            this.ignoreOffer = false;

            this.peer.close();
            this.peer = null;
        }
    }

    recreate(): void {
        this.close();
        this.constructor(); // Not idiomatic in TS, consider wrapping in init()
    }

    debugState(): void {
        const info = this.getConnectionInfo();
        console.log('=== PEER CONNECTION DEBUG STATE ===');
        console.log('ICE Connection State:', info.iceConnectionState);
        console.log('Connection State:', info.connectionState);
        console.log('Signaling State:', info.signalingState);
        console.log('ICE Gathering State:', info.iceGatheringState);
        console.log('Senders:', info.senders);
        console.log('Receivers:', info.receivers);
        console.log('Pending ICE Candidates:', info.pendingCandidates);
        console.log('Is Negotiating:', info.isNegotiating);
        console.log('Making Offer:', info.makingOffer);
        console.log('Has Remote Description:', !!this.peer?.remoteDescription);
        console.log('Has Local Description:', !!this.peer?.localDescription);
        console.log('=====================================');
    }
}

const peerService = new PeerService();
export default peerService;
