import { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketProvider';

type Props = {
  remoteName:string,
  remoteSocketId:string|null,
  setOpenChat: React.Dispatch<React.SetStateAction<boolean>>;
  setAlertMessage: React.Dispatch<React.SetStateAction<string>>;
};

interface message {
  id: number,
  text: string,
  sender: string,
  time: string
}

const Chatbox:React.FC<Props> = ({setOpenChat ,remoteSocketId , remoteName, setAlertMessage}) => {
  const [messages, setMessages] = useState<message[]>([ ]);
  const quickReply = [
              'Hello!',
              'Hi, How are you?',
              'I\'m fine, What about you?',
              'There is a lot of noise in you background.',
              'Wanna Play a game?',
              'Your video isn\'t clear.',
              'Can I call you back later?',
              'bye!',
            ];
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sideOpen,setSideOpen]=useState<boolean>(false);
  const socket = useSocket();

  const handleSend = () => {
    if (inputValue.trim()) {
      const newMessage:message = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setInputValue('');
      socket?.emit("message:sent",{to:remoteSocketId ,message: newMessage})
    }
  };

  useEffect(() => {
    const handleReceived = ({ from, message }:{from: string, message: message}) => {
      if (from === remoteSocketId) {
        console.log("message received", from);
        setAlertMessage(`${remoteName} : \n${message.text}`);
        setMessages((prev) => [...prev, message]);

        // Clear alert after 3 to 5 seconds
        const timeout = setTimeout(() => {
          setAlertMessage('');
        }, 4000); // 4 seconds as mid-range

        // Optional: clear timeout if component unmounts or new message received
        return () => clearTimeout(timeout);
      }
    };

    socket?.on("message:received", handleReceived);
    return () => {
      socket?.off("message:received", handleReceived);
    };
  }, [socket, remoteName, remoteSocketId]);


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[rgb(var(--color-primary))] text-white">
        <div className="flex items-center space-x-2">
          <button className="w-3 h-3 rounded-full bg-red-500 hover:cursor-pointer hover:scale-125" onClick={()=>setOpenChat(false)}></button>
          <button className="w-3 h-3 rounded-full bg-yellow-500 hover:cursor-pointer hover:scale-125" title="Minimize Sidebar" onClick={()=>setSideOpen(false)}></button>
          <button className="w-3 h-3 rounded-full bg-green-500 hover:cursor-pointer hover:scale-125" title="Maximize Sidebar" onClick={()=>setSideOpen(true)}></button>
        </div>
        <div className="text-sm font-medium">{remoteName?`${remoteName}'s `:' '}Chat</div>
        <div className="w-6"></div> {/* Spacer for balance */}
      </div>

      {/* Main Chat Area */}
      <div className="flex max-md:w-[80vw] flex-1 overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 max-md:w-[50vw] flex flex-col bg-[rgb(var(--color-bg))]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:w-full rounded-2xl p-4 ${
                    message.sender === 'user'
                      ? 'bg-[rgb(var(--color-primary))] text-white rounded-br-none'
                      : 'bg-[rgb(var(--color-muted))] text-[rgb(var(--color-text))] rounded-bl-none'
                  }`}
                >
                  <div className="text-sm">{message.text}</div>
                  <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-[rgb(var(--color-text)/0.5)]'}`}>
                    {message.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[rgb(var(--color-border))]">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 max-md:w-[30vw] p-3 rounded-xl border border-[rgb(var(--color-border))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))]"
              />
              <button
                onClick={handleSend}
                className="p-3 rounded-xl bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-secondary))] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex justify-between mt-2 text-xs text-[rgb(var(--color-text)/0.5)]">
              <div>Press Enter to send</div>
              <div>Send</div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`max-md:w-[30vw] bg-[rgb(var(--color-muted))] p-4 border-l border-[rgb(var(--color-border))] ${!sideOpen?"hidden":"block"}`}>
          <h3 className="text-sm font-semibold text-[rgb(var(--color-text))] mb-4">Quick Replies</h3>
          <div className="space-y-2">
            {quickReply.map((text, i) => (
              <button
                key={i}
                className="w-full p-2 text-left bg-[rgb(var(--color-bg))] rounded-lg text-sm hover:bg-[rgb(var(--color-primary)/0.1)] transition-colors"
                onClick={() => setInputValue(text)}
              >
                {text}
              </button>
            ))}
          </div>
          {/* Will work on adding some feature like a mini game or something in future*/}
        </div>
      </div>
    </div>
  );
};

export default Chatbox;