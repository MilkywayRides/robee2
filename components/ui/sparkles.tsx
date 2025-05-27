"use client";

import React, { useEffect, useRef } from "react";

interface SparklesCoreProps {
  particleColor?: string;
  particleDensity?: number;
  className?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  background?: string;
}

export const SparklesCore = (props: SparklesCoreProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    particleColor = "#FFF",
    particleDensity = 100,
    className = "",
    minSize = 0.1,
    maxSize = 1,
    speed = 1,
    background = "#000",
  } = props;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles: Particle[] = [];
    let animationFrameId: number;
    let lastTime = 0;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * (maxSize - minSize) + minSize;
        this.speedX = (Math.random() - 0.5) * speed;
        this.speedY = (Math.random() - 0.5) * speed;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = particleColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      for (let i = 0; i < particleDensity; i++) {
        particles.push(new Particle());
      }
    };

    const animate = (timestamp: number) => {
      if (!ctx) return;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      if (!canvas || !ctx) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    init();
    animate(0);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [particleColor, particleDensity, minSize, maxSize, speed, background]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
    />
  );
};