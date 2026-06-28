import type { CSSProperties } from 'react'

interface IconProps {
  name: string
  round?: boolean
  size?: number
  color?: string
  style?: CSSProperties
}

export function Icon({ name, round, size = 20, color, style }: IconProps) {
  return (
    <span className={round ? 'mir' : 'mi'} style={{ fontSize: size, color, ...style }}>
      {name}
    </span>
  )
}
