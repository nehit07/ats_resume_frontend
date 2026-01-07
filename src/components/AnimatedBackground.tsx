"use client";

import { useEffect, useState, useRef } from "react";

interface MousePosition {
    x: number;
    y: number;
}

export function AnimatedBackground() {
    const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 50, y: 50 });
    const [blob1Pos, setBlob1Pos] = useState<MousePosition>({ x: 50, y: 50 });
    const [blob2Pos, setBlob2Pos] = useState<MousePosition>({ x: 50, y: 50 });
    const [blob3Pos, setBlob3Pos] = useState<MousePosition>({ x: 50, y: 50 });
    const [blob4Pos, setBlob4Pos] = useState<MousePosition>({ x: 50, y: 50 });
    const [blob5Pos, setBlob5Pos] = useState<MousePosition>({ x: 50, y: 50 });
    const [blob6Pos, setBlob6Pos] = useState<MousePosition>({ x: 50, y: 50 });
    const [blob7Pos, setBlob7Pos] = useState<MousePosition>({ x: 50, y: 50 });

    const animationRef = useRef<number | null>(null);

    // Track mouse position
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 100,
                y: (e.clientY / window.innerHeight) * 100,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    // Smooth follow animation with delay - more visible movement
    useEffect(() => {
        const updatePositions = () => {
            // Different easing for each blob - creates layered effect (faster response)
            const ease1 = 0.08; // Fastest
            const ease2 = 0.065;
            const ease3 = 0.05;
            const ease4 = 0.04;
            const ease5 = 0.03;
            const ease6 = 0.055; // Center blob - medium speed
            const ease7 = 0.045; // Center blob - slightly slower

            setBlob1Pos((prev) => ({
                x: prev.x + (mousePosition.x - prev.x) * ease1,
                y: prev.y + (mousePosition.y - prev.y) * ease1,
            }));

            setBlob2Pos((prev) => ({
                x: prev.x + (mousePosition.x - prev.x) * ease2,
                y: prev.y + (mousePosition.y - prev.y) * ease2,
            }));

            setBlob3Pos((prev) => ({
                x: prev.x + (mousePosition.x - prev.x) * ease3,
                y: prev.y + (mousePosition.y - prev.y) * ease3,
            }));

            setBlob4Pos((prev) => ({
                x: prev.x + (mousePosition.x - prev.x) * ease4,
                y: prev.y + (mousePosition.y - prev.y) * ease4,
            }));

            setBlob5Pos((prev) => ({
                x: prev.x + (mousePosition.x - prev.x) * ease5,
                y: prev.y + (mousePosition.y - prev.y) * ease5,
            }));

            setBlob6Pos((prev) => ({
                x: prev.x + (mousePosition.x - prev.x) * ease6,
                y: prev.y + (mousePosition.y - prev.y) * ease6,
            }));

            setBlob7Pos((prev) => ({
                x: prev.x + (mousePosition.x - prev.x) * ease7,
                y: prev.y + (mousePosition.y - prev.y) * ease7,
            }));

            animationRef.current = requestAnimationFrame(updatePositions);
        };

        animationRef.current = requestAnimationFrame(updatePositions);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [mousePosition]);

    // Calculate offset from center (50%) - larger multiplier = more movement
    const getOffset = (pos: number, multiplier: number) => (pos - 50) * multiplier;

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Blob 1 - Purple, top-left, follows fastest */}
            <div
                className="gradient-blob gradient-blob-1"
                style={{
                    transform: `translate(${getOffset(blob1Pos.x, 3)}px, ${getOffset(blob1Pos.y, 3)}px)`,
                }}
            />
            {/* Blob 2 - Blue, right side */}
            <div
                className="gradient-blob gradient-blob-2"
                style={{
                    transform: `translate(${getOffset(blob2Pos.x, -2.5)}px, ${getOffset(blob2Pos.y, 2)}px)`,
                }}
            />
            {/* Blob 3 - Teal, bottom */}
            <div
                className="gradient-blob gradient-blob-3"
                style={{
                    transform: `translate(${getOffset(blob3Pos.x, 2)}px, ${getOffset(blob3Pos.y, -2.5)}px)`,
                }}
            />
            {/* Blob 4 - Pink, center-left */}
            <div
                className="gradient-blob gradient-blob-4"
                style={{
                    transform: `translate(${getOffset(blob4Pos.x, -2)}px, ${getOffset(blob4Pos.y, 1.5)}px)`,
                }}
            />
            {/* Blob 5 - Cyan, top-right */}
            <div
                className="gradient-blob gradient-blob-5"
                style={{
                    transform: `translate(${getOffset(blob5Pos.x, 1.8)}px, ${getOffset(blob5Pos.y, -1.8)}px)`,
                }}
            />
            {/* Blob 6 - Center-left area, fills the middle */}
            <div
                className="gradient-blob gradient-blob-6"
                style={{
                    transform: `translate(${getOffset(blob6Pos.x, -1.5)}px, ${getOffset(blob6Pos.y, 1.2)}px)`,
                }}
            />
            {/* Blob 7 - Center-right area, fills the middle */}
            <div
                className="gradient-blob gradient-blob-7"
                style={{
                    transform: `translate(${getOffset(blob7Pos.x, 1.3)}px, ${getOffset(blob7Pos.y, -1)}px)`,
                }}
            />
        </div>
    );
}
