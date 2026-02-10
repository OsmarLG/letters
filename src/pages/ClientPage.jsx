import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { clients } from '../data/clients';
import '../styles/ClientPage.css';

const ClientPage = () => {
    const { clientName } = useParams();
    // Normalize to handle potential URL variations
    const normalizedClientName = clientName ? clientName.replace(/-/g, '') : '14defebrero';
    const data = clients[normalizedClientName] || clients['14defebrero'];

    const [isOpen, setIsOpen] = useState(false);
    const [treeGrown, setTreeGrown] = useState(false);
    const [currentBgIndex, setCurrentBgIndex] = useState(0);

    // Refs for DOM manipulation
    const audioRef = useRef(null);
    const seedRef = useRef(null);
    const treeWrapperRef = useRef(null);
    const treeSvgRef = useRef(null);
    const foliageRef = useRef(null);
    const letterRef = useRef(null);
    const letterBodyRef = useRef(null);
    const sceneRef = useRef(null); // Container for rain

    // Configuration
    const {
        to: toName,
        from: fromName,
        message: fullMessage,
        images: bgImages,
        song,
        showWhatsApp = false, // Default to false if not specified
        colors = ['#d32f2f', '#c2185b', '#e91e63', '#f50057', '#880e4f', '#b71c1c'], // Default colors
        gift // Optional gift message
    } = data;

    const [isPlaying, setIsPlaying] = useState(false);
    const [showGiftButton, setShowGiftButton] = useState(false);
    const [showGiftModal, setShowGiftModal] = useState(false);

    // Carousel Effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBgIndex((prev) => (prev + 1) % bgImages.length);
        }, 5000); // Change every 5 seconds
        return () => clearInterval(interval);
    }, [bgImages.length]);

    // Handle Music Toggle
    const toggleMusic = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.log("Play failed:", e));
        }
        setIsPlaying(!isPlaying);
    };

    const handleOpen = () => {
        if (treeGrown) return;
        setTreeGrown(true);
        setIsOpen(true);

        // Play Music
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
            audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.log("Audio play failed:", e));
        }

        // 1. Envelope Open Animation (handled by class 'open' on click in render)
        // 2. Drop Seed
        setTimeout(() => {
            if (!seedRef.current) return;
            seedRef.current.style.opacity = '1';
            seedRef.current.animate([
                { transform: 'translate(-50%, -50%) scale(1) rotate(45deg)', top: '50%' },
                { transform: 'translate(-50%, -60%) scale(1.1) rotate(90deg)', top: '45%', offset: 0.3 },
                { transform: 'translate(-50%, 0) scale(1) rotate(135deg)', top: 'calc(100% - 50px)' }
            ], {
                duration: 1000,
                easing: 'ease-in',
                fill: 'forwards'
            });
        }, 500);

        // 3. Fade Envelope
        setTimeout(() => {
            const wrapper = document.getElementById('envelopeWrapper'); // Or use ref
            if (wrapper) wrapper.classList.add('fade-out');
        }, 1200);

        // 4. Grow Tree
        setTimeout(() => {
            if (seedRef.current) seedRef.current.style.opacity = '0';
            growFractalTree();
        }, 1600);

        // 5. Move Tree & Show Letter
        setTimeout(() => {
            if (treeWrapperRef.current) treeWrapperRef.current.classList.add('move-left');
            if (letterRef.current) letterRef.current.classList.add('show');
        }, 5500);

        // 6. Type Letter
        setTimeout(() => {
            const date = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const formattedDate = date.charAt(0).toUpperCase() + date.slice(1);
            const finalMessage = `Fecha: ${formattedDate}\n\nPara: ${toName}\n\n${fullMessage}\n\nDe: ${fromName}`;
            typeWriter(finalMessage, 0);
        }, 7000);

        // 7. Rain & Gift Button
        setTimeout(() => {
            startRain();
            if (gift) setShowGiftButton(true);
        }, 7500);
    };

    // --- LOGIC PORTED FROM HTML ---

    const growFractalTree = () => {
        const trunkLen = window.innerHeight * 0.18;
        // const startX = window.innerWidth / 2;
        // const startY = window.innerHeight - 50; // Approximated relative to container

        // We need to draw relative to the SVG container. 
        // The original code used window coordinates but the SVG was 100% width/height.
        // In this component, the SVG is also 100%.

        // However, if the user resizes, coordinates might be off. 
        // Ideally we use getBoundingClientRect() but for this fast port, we stick to window/percentage logic.
        // Actually, let's use the SVG's client dimensions.
        if (!treeSvgRef.current) return;
        const svgRect = treeSvgRef.current.getBoundingClientRect();
        const drawStartX = svgRect.width / 2;
        const drawStartY = svgRect.height - 50;

        drawBranch(drawStartX, drawStartY, trunkLen, -90, 11, 0);

        setTimeout(() => {
            createHeartCanopy(drawStartX, drawStartY - trunkLen * 1.8);
        }, 5000);
    };

    const drawBranch = (x, y, len, angle, width, depth) => {
        if (depth > 6) return;
        if (!treeSvgRef.current) return;

        const endX = x + len * Math.cos(angle * Math.PI / 180);
        const endY = y + len * Math.sin(angle * Math.PI / 180);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x);
        line.setAttribute("y1", y);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);
        line.setAttribute("stroke-width", width);
        line.setAttribute("class", "branch-line");
        treeSvgRef.current.appendChild(line);

        const duration = 100 - (depth * 40);

        const anim = line.animate([
            { x2: x, y2: y },
            { x2: endX, y2: endY }
        ], {
            duration: Math.max(duration, 300),
            easing: 'ease-out',
            fill: 'forwards',
            delay: depth * 400
        });

        anim.onfinish = () => {
            line.setAttribute("x2", endX);
            line.setAttribute("y2", endY);

            if (depth < 6) {
                const subDepth = depth + 1;
                const lenDecay = 0.68;
                const widthDecay = 0.65;

                drawBranch(endX, endY, len * lenDecay, angle - 18 + (Math.random() * 6 - 3), width * widthDecay, subDepth);
                drawBranch(endX, endY, len * lenDecay, angle + 18 + (Math.random() * 6 - 3), width * widthDecay, subDepth);
            }
        };
    };

    const createHeartCanopy = (centerX, centerY) => {
        if (!foliageRef.current) return;
        const totalLeaves = 800;
        const scale = 12;

        for (let i = 0; i < totalLeaves; i++) {
            const t = Math.random() * Math.PI * 2;
            let r = Math.pow(Math.random(), 0.6) * scale;
            const hx = 16 * Math.pow(Math.sin(t), 3);
            const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

            const x = centerX + (hx * r);
            const y = centerY + (hy * r) - 70;

            const leaf = document.createElement('div');
            leaf.classList.add('leaf-heart');
            leaf.textContent = '❤';
            leaf.style.left = x + 'px';
            leaf.style.top = y + 'px';

            const size = Math.random() * 25 + 15;
            leaf.style.fontSize = size + 'px';
            leaf.style.color = colors[Math.floor(Math.random() * colors.length)];
            leaf.style.transform = `rotate(${Math.random() * 360}deg) scale(0)`;

            foliageRef.current.appendChild(leaf);

            const delay = Math.random() * 1200;
            leaf.animate([
                { transform: `scale(0) rotate(${Math.random() * 360}deg)`, opacity: 0 },
                { transform: `scale(1) rotate(${Math.random() * 360}deg)`, opacity: 1 }
            ], {
                duration: 500,
                delay: delay,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                fill: 'forwards'
            });
        }
    };

    const typeWriter = (text, i) => {
        if (!letterBodyRef.current) return;
        if (i < text.length) {
            const char = text.charAt(i);
            if (char === '\n') {
                letterBodyRef.current.innerHTML += '<br>';
            } else {
                letterBodyRef.current.innerHTML += char;
            }
            letterBodyRef.current.scrollTop = letterBodyRef.current.scrollHeight;
            setTimeout(() => typeWriter(text, i + 1), 50);
        } else {
            letterBodyRef.current.innerHTML += '<span class="cursor"></span>';
        }
    };

    const startRain = () => {
        const interval = setInterval(() => {
            if (!sceneRef.current) return;

            const p = document.createElement('div');
            p.classList.add('falling-particle');
            p.textContent = '❤';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.fontSize = (Math.random() * 20 + 10) + 'px';
            p.style.color = colors[Math.floor(Math.random() * colors.length)];

            sceneRef.current.appendChild(p);

            const duration = Math.random() * 3000 + 4000;

            p.animate([
                { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
                { transform: `translateY(110vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: duration,
                easing: 'linear'
            });

            setTimeout(() => {
                p.remove();
            }, duration);
        }, 150);
        return interval;
    };


    return (
        <div className="client-page">
            <audio ref={audioRef} src={song} loop />

            {/* Background Carousel - Adds 'blurred' class when open */}
            <div className={`carousel-background ${isOpen ? 'blurred' : ''}`}>
                {bgImages.map((src, index) => (
                    <div
                        key={index}
                        className="carousel-image"
                        style={{
                            backgroundImage: `url(${src})`,
                            opacity: index === currentBgIndex ? 1 : 0
                        }}
                    />
                ))}
            </div>

            {/* Scene Container */}
            <div className="scene" ref={sceneRef}>
                <div className={`envelope-wrapper ${treeGrown ? 'fade-out' : ''}`} id="envelopeWrapper">
                    <div className={`envelope ${isOpen ? 'open' : ''}`} onClick={handleOpen}>
                        <div className="text-top">Para: {toName}</div>
                        <div className="flap"></div>
                        <div className="pocket"></div>
                        <div className="heart-seal"></div>
                        <div className="text-bottom">Ábreme</div>
                    </div>
                </div>

                <div className="seed" ref={seedRef} id="seed"></div>

                <div className="tree-wrapper" ref={treeWrapperRef} id="treeWrapper">
                    <svg ref={treeSvgRef} className="tree-svg"></svg>
                    <div ref={foliageRef} id="foliage"></div>
                </div>

                <div className="letter-container" ref={letterRef}>
                    <div className="letter-text" ref={letterBodyRef}></div>
                </div>

                <div className="grass"></div>
            </div>

            {/* Music Control */}
            <button className="music-control" onClick={toggleMusic}>
                {isPlaying ? (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                ) : (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                )}
            </button>

            {/* Gift Button */}
            {showGiftButton && (
                <div className="gift-container" onClick={() => setShowGiftModal(true)}>
                    <div className="gift-box">🎁</div>
                </div>
            )}

            {/* Gift Modal */}
            <div className={`gift-modal ${showGiftModal ? 'show' : ''}`}>
                <div className="gift-content">
                    <span className="gift-icon-large">🎁</span>
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.2rem', color: '#880e4f' }}>{gift}</p>
                    <button className="close-gift" onClick={() => setShowGiftModal(false)}>Cerrar</button>
                </div>
            </div>


            {/* WhatsApp Float Button - Conditional */}
            {showWhatsApp && (
                <a
                    href="https://wa.me/5216151559659?text=Hola,%20quiero%20personalizar%20una%20carta"
                    className="whatsapp-float"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span className="whatsapp-label">¡Personaliza la tuya!</span>
                    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                </a>
            )}

            {/* Footer */}
            <div className="footer">
                Powered by <a href="https://labs.elroi.cloud" target="_blank" rel="noopener noreferrer">ELROI</a>
            </div>
        </div>
    );
};

export default ClientPage;
