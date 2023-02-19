import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useWebRTC } from "../hooks/userWebRTC";

const Room = () => {
  const { id: roomId } = useParams();
  const user = {
    id: 1,
    name: "deepak pal bhai",
  };
  const { clients, provideRef } = useWebRTC(roomId, user);
  return (
    <div>
      <h1>all connected clients</h1>
      {clients.map((client) => {
        return (
          <div key={client.id}>
            <audio
              controls
              autoPlay
              ref={(instance) => provideRef(instance, client.id)}
            ></audio>
            <h4>{client.name}</h4>
          </div>
        );
      })}
    </div>
  );
};

export default Room;
