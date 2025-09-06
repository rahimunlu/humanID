"use client"

import React, { useEffect, useRef } from 'react';

const Confetti: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const particles: Particle[] = [];
        const colors = ["#CDBAFE", "#A7D8FF", "#AEE9D1", "#FFD8B5"];

        class Particle {
            x: number;
            y: number;
            color: string;
            size: number;
            speedX: number;
            speedY: number;
            angle: number;
            spin: number;

            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height - height;
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.size = Math.random() * 10 + 5;
                this.speedX = Math.random() * 3 - 1.5;
                this.speedY = Math.random() * 5 + 2;
                this.angle = Math.random() * 360;
                this.spin = Math.random() < 0.5 ? -1 : 1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.angle += this.spin * 5;
                if (this.y > height) {
                    this.y = -20;
                    this.x = Math.random() * width;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle * Math.PI / 180);
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                ctx.restore();
            }
        }

        const createParticles = () => {
            for (let i = 0; i < 150; i++) {
                particles.push(new Particle());
            }
        };

        let animationFrameId: number;

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        createParticles();
        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        window.addEventListener('resize', handleResize);

        const stopConfetti = setTimeout(() => {
             cancelAnimationFrame(animationFrameId);
        }, 5000);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            clearTimeout(stopConfetti);
        };

    }, []);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" />;
};

export default Confetti;
