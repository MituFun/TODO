"use client"

import { useEffect } from "react"

interface ParticleEffectsProps {
  trigger: boolean
  x: number
  y: number
  particleCount: number
  onComplete: () => void
}

export function ParticleEffects({ trigger, x, y, particleCount, onComplete }: ParticleEffectsProps) {
  useEffect(() => {
    if (trigger) {
      // 3秒后清理效果
      const timer = setTimeout(() => {
        onComplete()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  if (!trigger) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <ExplodeEffect x={x} y={y} particleCount={particleCount} />
    </div>
  )
}

function ExplodeEffect({ x, y, particleCount }: { x: number; y: number; particleCount: number }) {
  const particles = Array.from({ length: Math.min(particleCount, 100) }, (_, i) => {
    // 确保粒子均匀分布在360度
    const baseAngle = (i * 360) / Math.min(particleCount, 100)
    const randomOffset = (Math.random() - 0.5) * 60 // ±30度随机偏移
    const angle = baseAngle + randomOffset

    // 转换为弧度用于计算x,y坐标
    const radian = (angle * Math.PI) / 180

    const distance = 80 + Math.random() * 120 // 更大的距离 80-200px
    const size = 3 + Math.random() * 12 // 更大的粒子 3-15px
    const hue = Math.random() * 360
    const saturation = 70 + Math.random() * 30 // 更鲜艳的颜色
    const lightness = 50 + Math.random() * 40

    // 计算最终位置
    const endX = Math.cos(radian) * distance
    const endY = Math.sin(radian) * distance + Math.random() * 100 // 添加重力效果

    return {
      id: i,
      color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      size,
      endX,
      endY,
      duration: 1.2 + Math.random() * 0.8, // 1.2-2秒
      delay: Math.random() * 0.2, // 0-0.2秒延迟
      rotation: Math.random() * 720, // 随机旋转角度
    }
  })

  return (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: x - particle.size / 2,
            top: y - particle.size / 2,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`, // 增强发光效果
            animation: `explode-particle-${particle.id} ${particle.duration}s ${particle.delay}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
            willChange: "transform, opacity", // 优化性能
          }}
        />
      ))}
      <style jsx>{`
        ${particles
          .map(
            (particle) => `
          @keyframes explode-particle-${particle.id} {
            0% {
              opacity: 1;
              transform: translate(0px, 0px) scale(1) rotate(0deg);
            }
            70% {
              opacity: 0.8;
              transform: translate(${particle.endX * 0.8}px, ${particle.endY * 0.8}px) scale(1.2) rotate(${particle.rotation * 0.7}deg);
            }
            100% {
              opacity: 0;
              transform: translate(${particle.endX}px, ${particle.endY}px) scale(0.3) rotate(${particle.rotation}deg);
            }
          }
        `,
          )
          .join("\n")}
      `}</style>
    </>
  )
}
