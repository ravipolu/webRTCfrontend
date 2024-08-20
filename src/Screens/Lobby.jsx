import React, { useCallback , useEffect, useState} from 'react'
// import { useSocket } from '../SocketProvider/SocketProvider.jsx';
import socket from '../SocketProvider/io.js'
import { useNavigate } from 'react-router-dom';
import Room from './Room.jsx';

const Lobby = () =>{

    const [email,setEmail] = useState("");
    const [room,setRoom] =useState("");
    const navigate = useNavigate()

    console.log("lobyb--",socket)

    const handleSubmitForm = (e)=>{
        e.preventDefault();
        socket.emit('room:join',{email,room})
    }

    const handleJoinRoom =useCallback( (data) =>{
        const {email,room} = data;
        navigate(`/room/${room}`, {state : data})
    })

    useEffect(()=>{
        socket.on('room:join',handleJoinRoom);
        return ()=>{
            socket.off("room:join",handleJoinRoom)
        }
    },[socket])

    return(
        <>
            <h1>LOBBY</h1>
            <form onSubmit={handleSubmitForm}>
                <label htmlFor='email'>Email-Id :</label>
                <input type='email' 
                    placeholder='Enter Email' 
                    id='email' 
                    value={email} 
                    onChange={(e)=>setEmail(e.target.value)}/>
                    <br />
                <label htmlFor='room'>Room-NO :</label>
                <input type='text' 
                    placeholder='Enter Room Number' 
                    value={room} 
                    id='room'
                    onChange={(e)=>setRoom(e.target.value)}/>
                <br />    
                <input type="submit" value="Join" />
            </form>
        </>
    )
}

export default Lobby;