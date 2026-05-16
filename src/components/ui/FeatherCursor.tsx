import { useEffect, useRef } from 'react'

export default function FeatherCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const featherRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mx = 0, my = 0
    let rx = 0, ry = 0
    let rot = -25
    let pvx = 0, pvy = 0
    const dot = dotRef.current
    const feather = featherRef.current
    if (!dot || !feather) return

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      dot.style.transform = `translate(${mx - 2.5}px,${my - 2.5}px)`
    }
    document.addEventListener('mousemove', onMove)

    let raf: number
    const loop = () => {
      const vx = mx - rx
      const vy = my - ry
      rx += vx * 0.16
      ry += vy * 0.16
      pvx += (vx - pvx) * 0.16
      pvy += (vy - pvy) * 0.16
      const tilt = -25 + Math.atan2(pvy, pvx) * 8
      rot += (tilt - rot) * 0.08
      feather.style.transform = `translate(${rx - 6}px,${ry - 44}px) rotate(${rot}deg)`
      raf = requestAnimationFrame(loop)
    }
    loop()

    const addHover = (el: Element) => {
      el.addEventListener('mouseenter', () => feather.classList.add('hover'))
      el.addEventListener('mouseleave', () => feather.classList.remove('hover'))
    }
    document.querySelectorAll('a,button,input,textarea,select,[role="button"]').forEach(addHover)

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cur-dot" />
      <div ref={featherRef} className="cur-feather" />
    </>
  )
}
