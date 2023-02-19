import { useState, useRef, useEffect, useCallback } from "react";
import { useStateWithCallback } from "./useStateCallback";
import { socketInit } from "../sockets/index";
import { ACTIONS } from "../actions";
import freeice from "freeice";

const users = [
  {
    id: 1,
    name: "deepak ",
  },
  {
    id: 2,
    name: "rajan",
  },
];
export const useWebRTC = (roomId, user) => {
  const [clients, setClients] = useStateWithCallback([]);
  const audioElements = useRef({});
  const connections = useRef({});
  const localMediaStream = useRef(null);
  const socket = useRef(null);
  useEffect(() => {
    socket.current = socketInit();
  }, []);

  const provideRef = (instance, userId) => {
    audioElements.current[userId] = instance;
  };
  const addNewCLient = useCallback(
    (newCLient, cb) => {
      const lookingFor = clients.find((client) => client.id === newCLient.id);
      if (lookingFor === undefined) {
        setClients((prev) => [...prev, newCLient], cb);
      }
    },
    [clients, setClients]
  );

  //capture media
  useEffect(() => {
    const startCapture = async () => {
      localMediaStream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    };
    startCapture().then(() => {
      addNewCLient(user, () => {
        const localElement = audioElements.current[user.id];
        if (localElement) {
          localElement.volume = 0;
          localElement.srcObject = localMediaStream.current;
        }
        //sockets  emit join
        socket.current.emit(ACTIONS.JOIN, { roomId, user });
      });
    });
    return () => {
      //leaving rooms;
      localMediaStream.current.getTracks().forEach((track) => track.stop());
      socket.current.emit(ACTIONS.LEAVE, { roomId });
    };
  }, []);

  useEffect(() => {
    const handleNewPeer = async ({ peerId, createOffer, user: remoteUser }) => {
      //if already conneceted then give warning`
      if (peerId in connections.current) {
        return console.warn(
          `you are already connected with ${peerId} ${user.name}`
        );
      }
      connections.current[peerId] = new RTCPeerConnection({
        iceServers: freeice(),
      });

      //handle new ice candidate;
      connections.current[peerId].onicecandidate = (event) => {
        socket.current.emit(ACTIONS`.RELAY_ICE`, {
          peerId,
          icecandidate: event.candidate,
        });
      };
      connections.current[peerId].ontrack = ({ streams: [remoteStream] }) => {
        addNewCLient(remoteUser, () => {
          if (audioElements.current[remoteUser.id]) {
            audioElements.current[remoteUser.id].srcObject = remoteStream;
          } else {
            let settled = false;
            const interval = setInterval(() => {
              if (audioElements.current[remoteUser.id]) {
                audioElements.current[remoteUser.id].srcObject = remoteStream;
                settled = true;
              }
              if (settled) {
                clearInterval(interval);
              }
            }, 1000);
          }
        });
      };
      localMediaStream.current.getTrack().forEach((track) => {
        connections.current[peerId].addTrack(track, localMediaStream);
      });
      if (createOffer) {
        const offer = await connections.current[peerId].createOffer();
        await connections.current[peerId].setLocalDescription(offer);

        //send offer to another client
        socket.current.emit(ACTIONS.RELAY_SDP, {
          peerId,
          sessionDescription: offer,
        });
      }
    };
    socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);

    return () => {
      socket.current.off(ACTIONS.ADD_PEER);
    };
  }, []);

  useEffect(() => {
    socket.current.on(ACTIONS.ICE_CANDIDATE, ({ peerId, icecandidate }) => {
      if (icecandidate) {
        connections.current[peerId].addIceCandidate(icecandidate);
      }
    });
    return () => {
      socket.current.off(ACTIONS.ICE_CANDIDATE);
    };
  }, []);
  //hanlde sdp

  useEffect(() => {
    const handleRemoteSdp = async ({
      peerId,
      sessionDescription: remoteSessionDescription,
    }) => {
      connections.current[peerId].setRemoteDescription(
        new RTCSessionDescription(remoteSessionDescription)
      );
      //uf sessuib descurot us tyoe iof iffer tghe create offer
      if (remoteSessionDescription === "offer") {
        const connection = connections.current[peerId];
        const answer = await connection.createAnswer();
        connection.setLocalDescription(answer);

        socket.current.emit(ACTIONS.RELAY_SDP, {
          peerId,
          sessionDescription: answer,
        });
      }
    };
    socket.current.on(ACTIONS.SESSION_DESCRIPTION, handleRemoteSdp);
    return () => {
      socket.current.off(ACTIONS.SESSION_DESCRIPTION);
    };
  }, []);

  useEffect(() => {
    const handleRemovePeer = async ({ peerId, userId }) => {
      if (connections.current[peerId]) {
        connections.current[peerId].close();
      }
      delete connections.current[peerId];
      delete audioElements.current[peerId];
      setClients((list) => list.filter((client) => client.id !== userId));
    };
    socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
    return () => {
      socket.current.off(ACTIONS.REMOVE_PEER);
    };
  }, []);
  return { clients, provideRef };
};
