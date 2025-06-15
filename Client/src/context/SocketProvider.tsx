import React, { createContext, useMemo, useContext } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the context type
type SocketContextType = Socket | null;

// Create context with proper typing
const SocketContext = createContext<SocketContextType>(null);

// Custom hook with return type
export const useSocket = (): Socket | null => {
    const socket = useContext(SocketContext);
    return socket;
};

// Define props type for SocketProvider
interface SocketProviderProps {
    children: ReactNode;
}

const SocketProvider: React.FC<SocketProviderProps> = (props) => {
    const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_SERVER_URL || '', {
        secure: true,
        rejectUnauthorized: false // Only use for self-signed certs in dev
    }), []);

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );
};
export default SocketProvider;