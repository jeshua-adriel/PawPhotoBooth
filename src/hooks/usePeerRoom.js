import { useCallback, useEffect, useRef, useState } from 'react'
import Peer from 'peerjs'

/**
 * Pairs exactly two browsers for a live "couple photobooth" session.
 *
 * Uses PeerJS's free public cloud broker purely to exchange connection info
 * (signalling) — once connected, video (via a MediaConnection) and small
 * JSON messages like settings updates (via a DataConnection) flow directly
 * between the two browsers (WebRTC peer-to-peer), never through a server.
 *
 * status: 'offline' | 'ready' | 'connecting' | 'connected' | 'error'
 */
export function usePeerRoom(localStream) {
  const peerRef = useRef(null)
  const callRef = useRef(null)
  const connRef = useRef(null) // data channel, used to sync settings
  const [myId, setMyId] = useState(null)
  const [status, setStatus] = useState('offline')
  const [remoteStream, setRemoteStream] = useState(null)
  const [dataReady, setDataReady] = useState(false)
  const [lastMessage, setLastMessage] = useState(null) // { data, seq } — seq makes repeats re-fire effects

  // Create the peer once a local camera stream exists.
  useEffect(() => {
    if (!localStream || peerRef.current) return

    const peer = new Peer()
    peerRef.current = peer

    peer.on('open', (id) => {
      setMyId(id)
      setStatus('ready')
    })

    peer.on('call', (incomingCall) => {
      setStatus('connecting')
      incomingCall.answer(localStream)
      attachCall(incomingCall)
    })

    // The side that gets called also receives the incoming data connection here.
    peer.on('connection', (conn) => attachConnection(conn))

    peer.on('error', () => setStatus('error'))
    peer.on('disconnected', () => setStatus('error'))

    function attachCall(call) {
      callRef.current = call
      call.on('stream', (stream) => {
        setRemoteStream(stream)
        setStatus('connected')
      })
      call.on('close', () => {
        setRemoteStream(null)
        setStatus('ready')
      })
      call.on('error', () => setStatus('error'))
    }

    function attachConnection(conn) {
      connRef.current = conn
      conn.on('open', () => setDataReady(true))
      conn.on('data', (data) => setLastMessage({ data, seq: Date.now() + Math.random() }))
      conn.on('close', () => { connRef.current = null; setDataReady(false) })
    }

    peerRef.current._attachCall = attachCall
    peerRef.current._attachConnection = attachConnection

    return () => {
      peer.destroy()
      peerRef.current = null
    }
  }, [localStream])

  const joinRoom = useCallback((partnerId) => {
    if (!peerRef.current || !localStream || !partnerId) return
    setStatus('connecting')
    const id = partnerId.trim()
    const call = peerRef.current.call(id, localStream)
    peerRef.current._attachCall(call)
    // The side that initiates the call also opens the data connection.
    const conn = peerRef.current.connect(id)
    peerRef.current._attachConnection(conn)
  }, [localStream])

  const leaveRoom = useCallback(() => {
    if (callRef.current) callRef.current.close()
    if (connRef.current) connRef.current.close()
    callRef.current = null
    connRef.current = null
    setRemoteStream(null)
    setDataReady(false)
    setStatus(peerRef.current ? 'ready' : 'offline')
  }, [])

  /** Send a small JSON-serialisable message to the connected partner (e.g. a settings update). */
  const sendData = useCallback((data) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send(data)
    }
  }, [])

  return { myId, status, remoteStream, dataReady, lastMessage, joinRoom, leaveRoom, sendData }
}
