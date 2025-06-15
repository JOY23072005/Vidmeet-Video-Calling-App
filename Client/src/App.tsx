import Home from './pages/Home.tsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import NotFound from './pages/NotFound.tsx'
import Join from './pages/Join.tsx'
import SocketProvider from './context/SocketProvider.tsx'
import MediaProvider from './context/MediaContext.tsx'
import ScrollToHashElement from './components/ScrollToHashElement.tsx'
import Room from './pages/Room.tsx'
function App() {

  return (
    <>
    <SocketProvider>
      <MediaProvider>
        <BrowserRouter>
          <ScrollToHashElement/>
          <Routes>
            <Route index element={<Home/>}/>
            <Route path="/Vidmeet" element={<Join/>}/>
            <Route path="/Vidmeet/:roomId" element={<Room/>}/>
            <Route path="*" element={<NotFound/>}/>
          </Routes>
        </BrowserRouter>
      </MediaProvider>
    </SocketProvider> 
    </>
  )
}

export default App
