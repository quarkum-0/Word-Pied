import React, { useState, useEffect, useRef } from 'react';
import styles from './PhysicsFun.module.css';

export default function PhysicsFun({ onClose }) {
    const canvasRef = useRef(null);
    const ballsRef = useRef([]);
    const particlesRef = useRef([]);
    const platformsRef = useRef([]);
    const animationRef = useRef(null);

    const [score, setScore] = useState(0);
    const [mode, setMode] = useState('throw');
    const [isDragging, setIsDragging] = useState(false);
    const [gravity, setGravity] = useState(0.5);
    const [selectedShape, setSelectedShape] = useState('circle');
    const [selectedSize, setSelectedSize] = useState('medium');
    const [showTrails, setShowTrails] = useState(true);
    const [hasBoundaries, setHasBoundaries] = useState(false);
    const [explosionMode, setExplosionMode] = useState(false);

    const dragStart = useRef({ x: 0, y: 0 });
    const dragEnd = useRef({ x: 0, y: 0 });
    const drawingPlatform = useRef(null);

    const BOUNCE = 0.8;
    const FRICTION = 0.995;
    const CANVAS_WIDTH = 550;
    const CANVAS_HEIGHT = 420;

    const sizes = { small: 8, medium: 15, large: 30 };
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let trailCanvas = document.createElement('canvas');
        trailCanvas.width = CANVAS_WIDTH;
        trailCanvas.height = CANVAS_HEIGHT;
        let trailCtx = trailCanvas.getContext('2d');

        const gameLoop = () => {
            const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
            gradient.addColorStop(0, '#0f172a');
            gradient.addColorStop(1, '#1e293b');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            if (showTrails) {
                trailCtx.fillStyle = 'rgba(15, 23, 42, 0.05)';
                trailCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                ctx.drawImage(trailCanvas, 0, 0);
            }

            platformsRef.current.forEach(platform => {
                const platformGradient = ctx.createLinearGradient(platform.x, platform.y, platform.x + platform.width, platform.y + platform.height);
                platformGradient.addColorStop(0, '#3b82f6');
                platformGradient.addColorStop(1, '#1d4ed8');
                ctx.fillStyle = platformGradient;
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                ctx.strokeStyle = '#60a5fa';
                ctx.lineWidth = 3;
                ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);

                ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
                ctx.beginPath();
                ctx.arc(platform.x + platform.width - 15, platform.y + 15, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('×', platform.x + platform.width - 15, platform.y + 20);
            });

            particlesRef.current = particlesRef.current.filter(particle => {
                particle.life -= 0.015;
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += gravity * 0.3;
                particle.size *= 0.98;

                if (particle.life > 0 && particle.size > 0.1) {
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${particle.color}, ${particle.life})`;
                    ctx.fill();
                    return true;
                }
                return false;
            });

            ballsRef.current.forEach((ball, index) => {
                ball.vy += gravity;
                ball.vx *= FRICTION;
                ball.vy *= FRICTION;
                ball.x += ball.vx;
                ball.y += ball.vy;

                if (ball.shape !== 'circle') {
                    ball.rotation += ball.vx * 0.03;
                }

                if (hasBoundaries) {
                    if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx *= -BOUNCE; createParticles(ball.x, ball.y, ball.color, 3); }
                    if (ball.x + ball.radius > CANVAS_WIDTH) { ball.x = CANVAS_WIDTH - ball.radius; ball.vx *= -BOUNCE; createParticles(ball.x, ball.y, ball.color, 3); }
                    if (ball.y + ball.radius > CANVAS_HEIGHT) { ball.y = CANVAS_HEIGHT - ball.radius; ball.vy *= -BOUNCE; createParticles(ball.x, ball.y, ball.color, 3); }
                    if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy *= -BOUNCE; createParticles(ball.x, ball.y, ball.color, 3); }
                } else {
                    if (ball.x < -100 || ball.x > CANVAS_WIDTH + 100 || ball.y < -100 || ball.y > CANVAS_HEIGHT + 100) {
                        ballsRef.current.splice(index, 1);
                        return;
                    }
                }

                platformsRef.current.forEach(platform => {
                    const closestX = Math.max(platform.x, Math.min(ball.x, platform.x + platform.width));
                    const closestY = Math.max(platform.y, Math.min(ball.y, platform.y + platform.height));
                    const dx = ball.x - closestX;
                    const dy = ball.y - closestY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < ball.radius) {
                        if (Math.abs(dx) > Math.abs(dy)) {
                            ball.vx *= -BOUNCE;
                            ball.x = dx > 0 ? platform.x + platform.width + ball.radius : platform.x - ball.radius;
                        } else {
                            ball.vy *= -BOUNCE;
                            ball.y = dy > 0 ? platform.y + platform.height + ball.radius : platform.y - ball.radius;
                        }
                        createParticles(closestX, closestY, ball.color, 5);
                    }
                });

                ballsRef.current.forEach((otherBall, otherIndex) => {
                    if (index !== otherIndex) {
                        const dx = otherBall.x - ball.x;
                        const dy = otherBall.y - ball.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const minDist = ball.radius + otherBall.radius;

                        if (distance < minDist && distance > 0) {
                            const angle = Math.atan2(dy, dx);
                            const targetX = ball.x + Math.cos(angle) * minDist;
                            const targetY = ball.y + Math.sin(angle) * minDist;
                            const ax = (targetX - otherBall.x) * 0.5;
                            const ay = (targetY - otherBall.y) * 0.5;

                            ball.vx -= ax;
                            ball.vy -= ay;
                            otherBall.vx += ax;
                            otherBall.vy += ay;

                            if (Math.abs(ax) + Math.abs(ay) > 1) {
                                createParticles((ball.x + otherBall.x) / 2, (ball.y + otherBall.y) / 2, ball.color, 8);
                            }
                        }
                    }
                });

                if (showTrails && (Math.abs(ball.vx) > 0.5 || Math.abs(ball.vy) > 0.5)) {
                    trailCtx.beginPath();
                    if (ball.shape === 'circle') {
                        trailCtx.arc(ball.x, ball.y, ball.radius * 0.8, 0, Math.PI * 2);
                    }
                    trailCtx.fillStyle = ball.color + '20';
                    trailCtx.fill();
                }

                ctx.save();
                ctx.translate(ball.x, ball.y);
                ctx.rotate(ball.rotation || 0);

                if (ball.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
                    const objGradient = ctx.createRadialGradient(-ball.radius / 3, -ball.radius / 3, 0, 0, 0, ball.radius);
                    objGradient.addColorStop(0, ball.color + 'ff');
                    objGradient.addColorStop(1, ball.color + '99');
                    ctx.fillStyle = objGradient;
                    ctx.fill();
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else if (ball.shape === 'square') {
                    ctx.fillStyle = ball.color;
                    ctx.fillRect(-ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(-ball.radius, -ball.radius, ball.radius * 2, ball.radius * 2);
                } else if (ball.shape === 'star') {
                    drawStar(ctx, 0, 0, 5, ball.radius, ball.radius / 2, ball.color);
                } else if (ball.shape === 'triangle') {
                    drawTriangle(ctx, 0, 0, ball.radius, ball.color);
                }

                ctx.restore();
            });

            if (mode === 'draw' && isDragging && drawingPlatform.current) {
                const p = drawingPlatform.current;
                ctx.strokeStyle = '#60a5fa';
                ctx.lineWidth = 3;
                ctx.setLineDash([10, 5]);
                ctx.strokeRect(p.x, p.y, p.width, p.height);
                ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
                ctx.fillRect(p.x, p.y, p.width, p.height);
                ctx.setLineDash([]);
            }

            if (mode === 'throw' && isDragging) {
                const dx = dragEnd.current.x - dragStart.current.x;
                const dy = dragEnd.current.y - dragStart.current.y;
                const power = Math.min(Math.sqrt(dx * dx + dy * dy) / 3, 60);

                ctx.beginPath();
                ctx.moveTo(dragStart.current.x, dragStart.current.y);
                ctx.lineTo(dragEnd.current.x, dragEnd.current.y);
                ctx.strokeStyle = `rgba(245, 158, 11, ${Math.min(power / 30, 1)})`;
                ctx.lineWidth = Math.max(3, power / 10);
                ctx.stroke();

                const angle = Math.atan2(dy, dx);
                ctx.save();
                ctx.translate(dragEnd.current.x, dragEnd.current.y);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-15, -8);
                ctx.lineTo(-15, 8);
                ctx.closePath();
                ctx.fillStyle = '#f59e0b';
                ctx.fill();
                ctx.restore();

                ctx.save();
                ctx.translate(dragStart.current.x, dragStart.current.y);
                ctx.globalAlpha = 0.6;
                const previewSize = sizes[selectedSize];

                if (selectedShape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, previewSize, 0, Math.PI * 2);
                    ctx.fillStyle = '#f59e0b';
                    ctx.fill();
                } else if (selectedShape === 'square') {
                    ctx.fillStyle = '#f59e0b';
                    ctx.fillRect(-previewSize, -previewSize, previewSize * 2, previewSize * 2);
                } else if (selectedShape === 'star') {
                    drawStar(ctx, 0, 0, 5, previewSize, previewSize / 2, '#f59e0b');
                } else if (selectedShape === 'triangle') {
                    drawTriangle(ctx, 0, 0, previewSize, '#f59e0b');
                }
                ctx.restore();
            }

            animationRef.current = requestAnimationFrame(gameLoop);
        };

        gameLoop();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isDragging, gravity, showTrails, selectedShape, selectedSize, mode, hasBoundaries]);

    const drawStar = (ctx, cx, cy, spikes, outerRadius, innerRadius, color) => {
        let rot = Math.PI / 2 * 3;
        const step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            let x = cx + Math.cos(rot) * outerRadius;
            let y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const drawTriangle = (ctx, cx, cy, radius, color) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy - radius);
        ctx.lineTo(cx + radius, cy + radius);
        ctx.lineTo(cx - radius, cy + radius);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const createParticles = (x, y, color, count = 5) => {
        const rgb = color.match(/\w\w/g)?.map(x => parseInt(x, 16)).join(',') || '255,255,255';
        for (let i = 0; i < count; i++) {
            particlesRef.current.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 4 + 2,
                color: rgb,
                life: 1
            });
        }
    };

    const handleCanvasClick = (e) => {
        if (mode !== 'draw') return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        platformsRef.current = platformsRef.current.filter(platform => {
            const deleteX = platform.x + platform.width - 15;
            const deleteY = platform.y + 15;
            const distance = Math.sqrt((x - deleteX) ** 2 + (y - deleteY) ** 2);
            return distance > 10;
        });
    };

    const handleMouseDown = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        dragStart.current = { x, y };
        dragEnd.current = { x, y };
        if (mode === 'draw') {
            drawingPlatform.current = { x, y, width: 0, height: 0 };
        }
        setIsDragging(true);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        dragEnd.current = { x, y };

        if (mode === 'draw' && drawingPlatform.current) {
            const width = x - dragStart.current.x;
            const height = y - dragStart.current.y;
            drawingPlatform.current = {
                x: width < 0 ? x : dragStart.current.x,
                y: height < 0 ? y : dragStart.current.y,
                width: Math.abs(width),
                height: Math.abs(height)
            };
        }
    };

    const handleMouseUp = () => {
        if (!isDragging) return;

        if (mode === 'throw') {
            const dx = dragEnd.current.x - dragStart.current.x;
            const dy = dragEnd.current.y - dragStart.current.y;

            if (explosionMode) {
                for (let i = 0; i < 12; i++) {
                    const angle = (Math.PI * 2 * i) / 12;
                    const speed = 10;
                    ballsRef.current.push({
                        x: dragStart.current.x,
                        y: dragStart.current.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        radius: sizes[selectedSize] * 0.6,
                        shape: selectedShape,
                        rotation: 0,
                        color: colors[i % colors.length]
                    });
                }
                createParticles(dragStart.current.x, dragStart.current.y, '#f59e0b', 30);
                setScore(prev => prev + 12);
            } else {
                ballsRef.current.push({
                    x: dragStart.current.x,
                    y: dragStart.current.y,
                    vx: dx * 0.25,
                    vy: dy * 0.25,
                    radius: sizes[selectedSize],
                    shape: selectedShape,
                    rotation: 0,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
                setScore(prev => prev + 1);
            }
        } else if (mode === 'draw' && drawingPlatform.current) {
            if (drawingPlatform.current.width > 20 && drawingPlatform.current.height > 10) {
                platformsRef.current.push({ ...drawingPlatform.current });
            }
            drawingPlatform.current = null;
        }

        setIsDragging(false);
    };

    const clearAll = () => {
        ballsRef.current = [];
        platformsRef.current = [];
        particlesRef.current = [];
        setScore(0);
    };

    return (
        <div className={styles.container}>
            <div className={styles.gameArea}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Physics Sandbox</h2>
                    <div className={styles.stats}>
                        <span className={styles.stat}>Objects: <strong>{score}</strong></span>
                        <button className={styles.clearButton} onClick={clearAll}>Clear All</button>
                    </div>
                </div>

                <div className={styles.controls}>
                    <div className={styles.controlGroup}>
                        <label>Mode:</label>
                        <div className={styles.modeButtons}>
                            <button className={`${styles.modeBtn} ${mode === 'throw' ? styles.active : ''}`} onClick={() => setMode('throw')}>🎯 Throw</button>
                            <button className={`${styles.modeBtn} ${mode === 'draw' ? styles.active : ''}`} onClick={() => setMode('draw')}>✏️ Draw Walls</button>
                        </div>
                    </div>

                    {mode === 'throw' && (
                        <>
                            <div className={styles.controlGroup}>
                                <label>Shape:</label>
                                <div className={styles.shapeButtons}>
                                    <button className={`${styles.shapeBtn} ${selectedShape === 'circle' ? styles.active : ''}`} onClick={() => setSelectedShape('circle')}>⚪</button>
                                    <button className={`${styles.shapeBtn} ${selectedShape === 'square' ? styles.active : ''}`} onClick={() => setSelectedShape('square')}>⬜</button>
                                    <button className={`${styles.shapeBtn} ${selectedShape === 'star' ? styles.active : ''}`} onClick={() => setSelectedShape('star')}>⭐</button>
                                    <button className={`${styles.shapeBtn} ${selectedShape === 'triangle' ? styles.active : ''}`} onClick={() => setSelectedShape('triangle')}>🔺</button>
                                </div>
                            </div>

                            <div className={styles.controlGroup}>
                                <label>Size:</label>
                                <div className={styles.sizeButtons}>
                                    <button className={`${styles.sizeBtn} ${selectedSize === 'small' ? styles.active : ''}`} onClick={() => setSelectedSize('small')}>S</button>
                                    <button className={`${styles.sizeBtn} ${selectedSize === 'medium' ? styles.active : ''}`} onClick={() => setSelectedSize('medium')}>M</button>
                                    <button className={`${styles.sizeBtn} ${selectedSize === 'large' ? styles.active : ''}`} onClick={() => setSelectedSize('large')}>L</button>
                                </div>
                            </div>
                        </>
                    )}

                    <div className={styles.controlGroup}>
                        <label>Gravity: {gravity.toFixed(1)}</label>
                        <input type="range" min="-1" max="3" step="0.1" value={gravity} onChange={(e) => setGravity(parseFloat(e.target.value))} className={styles.slider} />
                    </div>

                    <div className={styles.toggleGroup}>
                        <label><input type="checkbox" checked={showTrails} onChange={(e) => setShowTrails(e.target.checked)} />Trails</label>
                        <label><input type="checkbox" checked={hasBoundaries} onChange={(e) => setHasBoundaries(e.target.checked)} />Boundaries</label>
                        {mode === 'throw' && (
                            <label><input type="checkbox" checked={explosionMode} onChange={(e) => setExplosionMode(e.target.checked)} />💥 Explosion</label>
                        )}
                    </div>
                </div>

                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    className={styles.canvas}
                    onClick={handleCanvasClick}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => setIsDragging(false)}
                />

                <div className={styles.instructions}>
                    {mode === 'throw' ? (
                        <p>🎯 <strong>Click and drag</strong> to throw objects • Toggle <strong>Explosion mode</strong> for bursts!</p>
                    ) : (
                        <p>✏️ <strong>Click and drag</strong> to draw platforms • Click <strong>×</strong> on platforms to delete</p>
                    )}
                </div>
            </div>
        </div>
    );
}
