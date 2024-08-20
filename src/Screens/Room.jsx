import React, { useCallback, useEffect, useState } from 'react'
import socket from '../SocketProvider/io.js';
import peer from "../SocketProvider/PeerService.js"
import ReactPlayer from 'react-player';
import { useLocation } from 'react-router-dom';
import io from '../SocketProvider/io.js';



const Room = () =>{

    const location = useLocation();
    const [remoteStream , setRemoteStream] = useState()
    const [remoteSocketId, setRemoteSocketId] = useState(null)
    const [myStream, setMyStream] = useState()
    const senders = [];
    const handelUserJoined = ({email,id})=>{
        // console.log(email, id + "joined room")
        setRemoteSocketId(id)
    }   


    const handleCallUser = useCallback(async()=>{
        const stream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true
        })

        const offer = await peer.getOffer();
        socket.emit('user:call',{to:remoteSocketId,offer})

        setMyStream(stream);

    },[remoteSocketId,socket])

    const handleIncommingCall =async ({from,offer}) =>{
        setRemoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true
        })

        setMyStream(stream)
        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted',{to:from, ans})
    }

    const handleNegoNeeded = async()=>{
        const offer = await peer.getOffer();
        socket.emit('peer:negoNeeded',{offer, to:remoteSocketId})
    }

    const handleIncommingNegotiation = async({from , offer}) =>{
        const ans =await peer.getAnswer(offer);
        socket.emit('peer:negoDone', {to:from , ans})
    }

    const handleFinalNegotiation = async({ans}) =>{
        await peer.setLocalDescription(ans)
    }

    useEffect(()=>{
        peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    }
    })

    const sendStream = ()=>{
        for(const track of myStream.getTracks()){
            const sender = peer.peer.addTrack(track, myStream )
            senders.push(sender);
        }
    }

    // const endStream =() => {

    //     for(let sender of senders){
    //         peer.peer.removeTrack(senders[0])
    //     }

    //     senders.length=0;

    // }

    const handleCallAccepted= ({from , ans})=>{
        peer.setLocalDescription(ans);
        sendStream()
    }

    useEffect(()=>{
        peer.peer.addEventListener("track",async (ev) =>{
            const remoteStream = ev.streams;
            setRemoteStream(remoteStream[0])
        })
    })

    useEffect(()=>{
        socket.on("user:joined",handelUserJoined);
        socket.on('incomming:call',handleIncommingCall)
        socket.on("call:accepted",handleCallAccepted)
        socket.on('peer:negoNeeded', handleIncommingNegotiation)
        socket.on('peer:negoDone', handleFinalNegotiation)


        return ()=>{
            socket.off("user:joined", handelUserJoined)
            socket.off('incomming:call',handleIncommingCall)
            socket.off("call:accepted",handleCallAccepted)
            socket.off('peer:negoNeeded', handleIncommingNegotiation)
            socket.off('peer:negoDone', handleFinalNegotiation)
        }
    },[socket, handelUserJoined])

    return(
        <div>
            <h1>Room PAge</h1>
            <div>{location.state?.room}</div>
            <div>{socket.id}</div>
            <div>{location.state?.email}</div>
            <h4>{remoteSocketId ? "connected" : "No one in room"}</h4>
            {remoteSocketId && <button onClick={handleCallUser}>Call</button> }
            {myStream  && <button onClick={sendStream}>Receive</button> }
            <h2>My Stream</h2>
            {myStream && <ReactPlayer playing muted height="300px" width="200px" url={myStream}/>}
            {remoteStream &&
                <div>
                    <h2>Other Stream</h2>
                    <ReactPlayer playing muted height="300px" width="200px" url={remoteStream}/>
                </div>   
            }
            
        </div>
    )
}


export default Room;