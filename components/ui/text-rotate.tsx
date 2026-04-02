"use client"

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react"
import { AnimatePresence, motion } from "framer-motion"

export interface TextRotateRef {
  next: () => void
  previous: () => void
  jumpTo: (index: number) => void
  reset: () => void
}

interface TextRotateProps {
  texts: string[]
  rotationInterval?: number
  staggerDuration?: number
  staggerFrom?: "first" | "last" | "center" | number
  loop?: boolean
  auto?: boolean
  style?: React.CSSProperties
}

const TextRotate = forwardRef<TextRotateRef, TextRotateProps>(
  (
    {
      texts,
      rotationInterval = 2800,
      staggerDuration = 0.04,
      staggerFrom = "first",
      loop = true,
      auto = true,
      style,
    },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(0)

    const next = useCallback(() => {
      setCurrentIndex((prev) => {
        if (prev === texts.length - 1) return loop ? 0 : prev
        return prev + 1
      })
    }, [texts.length, loop])

    const previous = useCallback(() => {
      setCurrentIndex((prev) => {
        if (prev === 0) return loop ? texts.length - 1 : prev
        return prev - 1
      })
    }, [texts.length, loop])

    const jumpTo = useCallback(
      (index: number) => {
        setCurrentIndex(Math.max(0, Math.min(index, texts.length - 1)))
      },
      [texts.length]
    )

    const reset = useCallback(() => setCurrentIndex(0), [])

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }))

    useEffect(() => {
      if (!auto) return
      const interval = setInterval(next, rotationInterval)
      return () => clearInterval(interval)
    }, [auto, next, rotationInterval])

    const characters = useMemo(
      () => texts[currentIndex].split(""),
      [texts, currentIndex]
    )

    const getDelay = (index: number, total: number) => {
      if (staggerFrom === "first") return index * staggerDuration
      if (staggerFrom === "last") return (total - 1 - index) * staggerDuration
      if (staggerFrom === "center") {
        const center = (total - 1) / 2
        return Math.abs(center - index) * staggerDuration
      }
      if (typeof staggerFrom === "number") {
        return Math.abs(staggerFrom - index) * staggerDuration
      }
      return index * staggerDuration
    }

    return (
      <span
        style={{
          display: "inline-flex",
          overflow: "hidden",
          verticalAlign: "bottom",
          ...style,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            style={{ display: "inline-flex" }}
            aria-label={texts[currentIndex]}
          >
            {characters.map((char, i) => (
              <motion.span
                key={i}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "-110%", opacity: 0 }}
                transition={{
                  type: "spring",
                  damping: 28,
                  stiffness: 350,
                  delay: getDelay(i, characters.length),
                }}
                style={{
                  display: "inline-block",
                  whiteSpace: char === " " ? "pre" : "normal",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
    )
  }
)

TextRotate.displayName = "TextRotate"
export default TextRotate
