import { useState, useEffect, useRef } from 'react';
import '../styles/ClientPage.css';

const ClientPageStatic = () => {
    // Hardcoded Configuration for Midia & Osmar
    // Hardcoded Configuration for Midia & Osmar
    const toName = 'Midia Aguilar Mi Princecita 💖';
    const fromName = 'Osmar Liera El Rey de tu corazon 👑';
    const fullMessage = `Mi Amor, Mi Princesa,\n\nTe Amo de aqui hasta donde alcancen mis fuerzas, pero mi Fuerza es Cristo, entonces si al fundar el universo Dios ya nos tenia predestinados, entonces Te Amo desde el inicio del Universo hasta toda la Eternidad.\n\nFeliz Día Mi Amor <3`;
    const bgImages = [
        'https://jwlogvvbliduzvvwjcrc.supabase.co/storage/v1/object/public/14defebrero/osmarymidia/484098746_9748305251875764_5000993175647091382_n.jpg',
        'https://jwlogvvbliduzvvwjcrc.supabase.co/storage/v1/object/public/14defebrero/osmarymidia/494173190_10026955284010758_1437686439558175261_n.jpg',
        'https://jwlogvvbliduzvvwjcrc.supabase.co/storage/v1/object/public/14defebrero/osmarymidia/517533924_24394176303528750_7146413412163495347_n.jpg',
        'https://jwlogvvbliduzvvwjcrc.supabase.co/storage/v1/object/public/14defebrero/osmarymidia/518319728_24394175963528784_6584235306857663850_n.jpg',
        'https://jwlogvvbliduzvvwjcrc.supabase.co/storage/v1/object/public/14defebrero/osmarymidia/597478312_25708921688720865_6719785787082989387_n.jpg',
        'https://jwlogvvbliduzvvwjcrc.supabase.co/storage/v1/object/public/14defebrero/osmarymidia/79456355_2874094645963560_6692485617642635264_n.jpg'
    ];
    const song = '/songs/midiayosmar/song.mp3';
    const showWhatsApp = false; // Manually set to false
    const colors = ['#ff80ab', '#ff4081', '#f50057', '#c51162', '#aa00ff', '#d500f9']; // Custom colors

    // Gift Configuration (Set to null to disable, or a string to enable)
    const gift = "¡Sorpresa! 🎁\n\nEste cupón es válido para:\n\n✨ Toda una vida Juntos ✨\n🎬 Una Cita en el Cine 🍿\n\n(Yo invito las palomitas 😉)";

    const [isOpen, setIsOpen] = useState(false);
    const [treeGrown, setTreeGrown] = useState(false);
    const [currentBgIndex, setCurrentBgIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showGiftButton, setShowGiftButton] = useState(false);
    const [showGiftModal, setShowGiftModal] = useState(false);

    // Refs for DOM manipulation
    const audioRef = useRef(null);
    const seedRef = useRef(null);
    const treeWrapperRef = useRef(null);
    const treeSvgRef = useRef(null);
    const foliageRef = useRef(null);
    const letterRef = useRef(null);
    const letterBodyRef = useRef(null);
    const sceneRef = useRef(null); // Container for rain

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

    // Cleanup rain on unmount
    useEffect(() => {
        return () => {
            // Optional: aggressive cleanup if needed, but react unmount handles node removal
        };
    }, []);

    const handleOpen = () => {
        if (treeGrown) return;
        setTreeGrown(true);
        setIsOpen(true); // Triggers React state updates if used in render, but we mostly use refs here for legacy port

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
            // Envelope fade is handled largely by CSS based on state or manual class add
            // We can use a ref to the wrapper to add the class manually to match original timing exactly
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

        // 7. Rain
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

            {/* Music Control */}
            <button className="music-control" onClick={toggleMusic}>
                {isPlaying ? (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                ) : (
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                )}
            </button>

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

            {/* WhatsApp Button removed for this static pages or hardcoded if requested. 
                User said "solo debe aparecer en el ejemplo del 14", so removed here. */}

            {/* Footer */}
            <div className="footer">
                Powered by <a href="https://labs.elroi.cloud" target="_blank" rel="noopener noreferrer">ELROI</a>
            </div>
        </div>
    );
};

export default ClientPageStatic;
