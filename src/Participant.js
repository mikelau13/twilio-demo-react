import React, { useState, useEffect, useRef } from 'react';

const Participant = ({ participant }) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  
  const videoRef = useRef(); // ref to video DOM
  const audioRef = useRef(); // ref to audio DOM

  // A RemoteTrackPublication represents a RemoteTrack that has been published to a Room.
  // https://media.twiliocdn.com/sdk/js/video/releases/2.2.0/docs/RemoteTrackPublication.html
  const trackpubsToTracks = trackMap => Array.from(trackMap.values())
    .map(publication => publication.track) // Participant's have videoTracks and audioTracks properties that return a Map of TrackPublication objects.
    .filter(track => track !== null);

  // the first useEffect hook
  useEffect(() => {
    // when a track is added from the participant, then add it from the state using the relevant state function
    const trackSubscribed = track => {
      if (track.kind === 'video') {
        setVideoTracks(videoTracks => [...videoTracks, track]);
      } else {
        setAudioTracks(audioTracks => [...audioTracks, track]);
      }
    };

    // when a track is removed from the participant, then remove it from the state using the relevant state function
    const trackUnsubscribed = track => {
      if (track.kind === 'video') {
        setVideoTracks(videoTracks => videoTracks.filter(v => v !== track));
      } else {
        setAudioTracks(audioTracks => audioTracks.filter(a => a !== track));
      }
    };

    // set up listeners to the trackSubscribed and trackUnsubscribed events 
    setVideoTracks(trackpubsToTracks(participant.videoTracks));
    setAudioTracks(trackpubsToTracks(participant.audioTracks));

    participant.on('trackSubscribed', trackSubscribed);
    participant.on('trackUnsubscribed', trackUnsubscribed);

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      participant.removeAllListeners();
    };
  }, [participant]);

  // hook to attach the video tracks to the DOM
  useEffect(() => {
    const videoTrack = videoTracks[0]; // get the first video track from the state
    if (videoTrack) { // if it exists, attach it to the DOM node we captured 
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach(); //  detach it during cleanup
      };
    }
  }, [videoTracks]);

  // hook to attach the audio tracks to the DOM
  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);
  
  return (
    <div className="participant">
      <h3>{participant.identity}</h3>
      <video ref={videoRef} autoPlay={true} />
      <audio ref={audioRef} autoPlay={true} muted={true} />
    </div>
  );
};

export default Participant;
