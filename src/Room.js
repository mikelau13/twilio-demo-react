import React, { useState, useEffect } from 'react';
import Video from 'twilio-video';
import Participant from './Participant';

const Room = ({ roomName, token, handleLogout }) => {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  
  const remoteParticipants = participants.map(participant => (
    <p key={participant.sid}>{participant.identity}</p>
  ));

  useEffect(() => {
    const participantConnected = participant => {
      setParticipants(prevParticipants => [...prevParticipants, participant]);
    };
    // const participantDisconnected = participant => {
    //   setParticipants(prevParticipants =>
    //     prevParticipants.filter(p => p !== participant)
    //   );
    // };
    Video.connect(token, {
      name: roomName
    }).then(room => { // When the connection is complete
      setRoom(room); // set the room state
      // set up a listener for other participants connecting 
      room.on('participantConnected', participantConnected);
      // loop through any existing participants adding them to the participants array state using the participantConnected function
      room.participants.forEach(participantConnected);
    }, error => {
      console.log(error);
      alert('Could not connect to Twilio: ' + error.message); // TODO: usually when error message is DOM requested not found, then it's because microphones/camera not connected 
    });

    return () => {
      setRoom(currentRoom => {
        // if the local participant is connected
        if (currentRoom && currentRoom.localParticipant.state === 'connected') {
          // return a function that stops all the local partipant's tracks 
          currentRoom.localParticipant.tracks.forEach(function(trackPublication) {
            trackPublication.track.stop();
          });
          // and then disconnects from the room
          currentRoom.disconnect();
          return null;
        } else {
          return currentRoom;
        }
      });
    };
  }, [roomName, token]);

  return (
    <div className="room">
      <h2>Room: {roomName}</h2>
      <button onClick={handleLogout}>Log out</button>
      <div className="local-participant">
        {room ? (
          <Participant
            key={room.localParticipant.sid}
            participant={room.localParticipant}
          />
        ) : (
          ''
        )}
      </div>
      <h3>Remote Participants</h3>
      <div className="remote-participants">{remoteParticipants}</div>
    </div>
  );
};

export default Room;
