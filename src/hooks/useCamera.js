import { useCallback, useRef, useState} from 'react'

export function useCamera() {
    const [stream, setStream] = useState(null)
    const [error, setError] = useState(null)
    const facingRef = useRef('user')

    const start = useCallback(async (facingMode) => {
        const mode = facingMode || facingRef.current
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode},
                audio: false,
            })
            setStream((prev) => {
                if (prev) prev.getTracks().forEach((t) => t.stop())
                return newStream
            })
            facingRef.current = mode
            setError(null)
            return newStream
        } catch (err) {
            setError("Couldn't reach the camera - check permissions 🙈")
            return null
        }
    }, [])

    const flip = useCallback(() => {const next = facingRef.current === 'user' ? 'environment' : 'user'
        return start(next)
    }, [start])

    const stop = useCallback(() => {
        setStream((prev) => {
            if (prev) prev.getTracks().forEach((t) => t.stop())
            return null
        })
    }, [])

    return {stream, error, start, flip, stop}
}