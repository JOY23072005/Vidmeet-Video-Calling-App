import chat_noti from "/assets/chat-noti.svg"
import {useState,useEffect,useCallback} from 'react'
import type { FormEvent } from "react";
import type { MouseEvent } from "react";
import { useSocket } from '../context/SocketProvider.js';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import { useMedia } from "../context/MediaContext.js";

type RoomCreateResponse = {
    code?:string;
    error?:string;
}

export default function Join(){
    const {cleanup} = useMedia();

    useEffect(()=>{
    return ()=>{
        cleanup();
    }
    },[cleanup])

    const [name,setName] = useState("");
    const [room,setRoom] = useState("");
    const socket = useSocket();
    const navigate = useNavigate();

    const handleSubmitForm = useCallback((e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        socket?.emit("room:join",{name:name,room:room});
    },[name,room,socket])

    const handleJoinRoom = useCallback((data : {name: string,room:string})=>{
        const {name,room} = data;
        navigate(`/Vidmeet/${room}`, { state: { name }})
    },[navigate])

    const handleGenSub = useCallback((e:MouseEvent<HTMLButtonElement>)=>{
        e.preventDefault();
        console.log(name);
        if(name===""){
            alert("Please Enter a name first!");
            return;
        }
        socket?.emit("room:create",{ name:name },(response:RoomCreateResponse) => {
            if (response.error) {
                console.error("Failed to create room:", response.error);
            } else {
                console.log("New room:", response.code);
                navigate(`/Vidmeet/${response.code}`, { state: { name }});
            }
        });
    },[name,socket,navigate])

    useEffect(()=>{
        socket?.on('room:join',handleJoinRoom);
        socket?.on('room:not_found', (data) => {
            console.error(data.error);
            alert(data.error); // Or show in UI
        });
        return ()=>{
        socket?.off('room:join',handleJoinRoom);
        socket?.off('room:not_found', (data) => {
            console.error(data.error);
            alert(data.error); // Or show in UI
        });
        }
    },[socket])

    return (
    <main>
        <Navbar/>
        <section id="hero" className="section ">
            <form onSubmit={handleSubmitForm} className='container grid md:grid-cols-2 md:space-x-12'>
                {/* Text hero */}
                <div className="mx-auto flex flex-col justify-center max-md:my-20 animate-[slide-down_1s_ease-in-out]"> 
                    <p className="text-subheading">
                        Create or Join Meeting
                    </p>
                    <div className="flex grid max-xl:space-y-5 xl:grid-cols-2 xl:space-x-5 mt-5">
                        <input value={name} onChange={(e)=>{setName(e.target.value)}} className="input w-60" type="text" maxLength={30} placeholder="Enter Name" required/>
                        <input value={room} onChange={(e)=>{setRoom(e.target.value)}} className="input w-60" type="text" maxLength={10} placeholder="Enter-code" required/>
                    </div>
                    <div className="flex max-md:w-5/6 md:grid md:grid-cols-2  space-x-5 mt-5">
                        <button type="submit" className="btn btn-outline"> Join Meeting </button>
                        <button onClick={handleGenSub} className="btn btn-primary"> Create Meeting </button>
                    </div>
                </div>
                {/* Image hero */}
                <div className="Image">
                <img className="mx-auto max-md:w-4/6 w-full opacity-0 translate-x-5 transition-all duration-700 ease-in-out" src={chat_noti}
                onLoad={(e) => {
                    e.currentTarget.classList.remove("opacity-0", "translate-x-5");
                }}
                />
                </div>
            </form>
        </section>
    </main>
    )
}
