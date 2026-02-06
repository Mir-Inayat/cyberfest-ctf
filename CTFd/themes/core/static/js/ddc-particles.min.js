// DDC Particle Network Animation
// This creates an interactive network visualization with nodes, connections, and data packets

(function() {
    'use strict';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;opacity:0.7;pointer-events:none;';
    document.body.insertBefore(canvas, document.body.firstChild);
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let nodes = [];
    let packets = [];
    let ripples = [];
    const mouse = { x: undefined, y: undefined };

    const NODE_COUNT = 150;
    const PACKET_COUNT = 60;
    const GRID_SPACING = 100;
    const FLAG_COLOR = '#007cf0';
    const PACKET_COLOR = '#ff0000';
    const RIPPLE_COLOR = '#007cf0';
    let colorShift = 0;

    function setup() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;

        nodes = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 1.5,
                pulse: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                isFlag: false,
            });
        }
        // Assign initial flag
        if (nodes.length > 0) {
            nodes[Math.floor(Math.random() * nodes.length)].isFlag = true;
        }

        packets = [];
        for (let i = 0; i < PACKET_COUNT; i++) {
            packets.push(new Packet());
        }
        ripples = [];
    }

    class Packet {
        constructor() { 
            this.isRed = Math.random() > 0.5; // 50% chance to be red
            this.reset(); 
        }
        reset() {
            if (nodes.length < 2) return;
            const startNode = nodes[Math.floor(Math.random() * nodes.length)];
            let endNode = nodes[Math.floor(Math.random() * nodes.length)];
            let attempts = 0;
            while (endNode === startNode && attempts < 10) {
                endNode = nodes[Math.floor(Math.random() * nodes.length)];
                attempts++;
            }
            this.startX = startNode.x;
            this.startY = startNode.y;
            this.endX = endNode.x;
            this.endY = endNode.y;
            this.progress = 0;
            this.speed = Math.random() * 0.008 + 0.005;
        }
        update() {
            this.progress += this.speed;
            if (this.progress >= 1) this.reset();
        }
        draw() {
            const x = this.startX + (this.endX - this.startX) * this.progress;
            const y = this.startY + (this.endY - this.startY) * this.progress;
            
            const packetColor = this.isRed ? '#ff0000' : '#007cf0';
            const trailRgba = this.isRed ? 
                (opacity) => `rgba(255, 0, 0, ${opacity})` : 
                (opacity) => `rgba(0, 124, 240, ${opacity})`;
            
            // Trail effect
            for (let i = 0; i < 5; i++) {
                const tailProgress = this.progress - i * 0.03;
                if (tailProgress > 0) {
                    const tailX = this.startX + (this.endX - this.startX) * tailProgress;
                    const tailY = this.startY + (this.endY - this.startY) * tailProgress;
                    ctx.beginPath();
                    ctx.arc(tailX, tailY, 2 - i * 0.3, 0, Math.PI * 2);
                    ctx.fillStyle = trailRgba(0.5 - i * 0.1);
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = packetColor;
                    ctx.fill();
                }
            }
            
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = packetColor;
            ctx.shadowBlur = 15;
            ctx.shadowColor = packetColor;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    class Ripple {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 1;
            this.maxRadius = 100;
            this.speed = 2;
            this.life = 1;
        }
        update() {
            this.radius += this.speed;
            this.life -= 0.02;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 124, 240, ${this.life * 0.6})`;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 8;
            ctx.shadowColor = RIPPLE_COLOR;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        
        // CTF-themed gradient overlay with red accent
        colorShift += 0.001;
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
        gradient.addColorStop(0, `rgba(0, 124, 240, ${0.02 + Math.sin(colorShift) * 0.01})`);
        gradient.addColorStop(0.6, `rgba(80, 40, 120, ${0.015})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, ${0.02 + Math.cos(colorShift * 0.7) * 0.01})`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw grid with mixed blue and subtle red accents
        ctx.lineWidth = 0.5;
        for (let x = 0; x < width; x += GRID_SPACING) {
            const isRedLine = x % (GRID_SPACING * 3) === 0;
            ctx.strokeStyle = isRedLine ? 'rgba(255, 0, 0, 0.12)' : 'rgba(0, 124, 240, 0.08)';
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let y = 0; y < height; y += GRID_SPACING) {
            const isRedLine = y % (GRID_SPACING * 3) === 0;
            ctx.strokeStyle = isRedLine ? 'rgba(255, 0, 0, 0.12)' : 'rgba(0, 124, 240, 0.08)';
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Find closest node to mouse
        let closestNode = null;
        let minDist = Infinity;
        if (mouse.x !== undefined && mouse.y !== undefined) {
            nodes.forEach(node => {
                const dist = Math.hypot(node.x - mouse.x, node.y - mouse.y);
                if (dist < minDist) {
                    minDist = dist;
                    closestNode = node;
                }
            });
        }

        // Draw connections between nodes
        ctx.lineWidth = 0.5;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                let opacity = 0.25;
                if (nodes[i] === closestNode || nodes[j] === closestNode) {
                    opacity = 0.8;
                }
                if (dist < 280) {
                    ctx.strokeStyle = `rgba(0, 124, 240, ${opacity})`;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        // Update and draw nodes
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;
            if(node.x < 0 || node.x > width) node.vx *= -1;
            if(node.y < 0 || node.y > height) node.vy *= -1;

            node.pulse += 0.05;
            let pulseRadius = node.radius + Math.sin(node.pulse) * (node.isFlag ? 2.5 : 1.5);
            const distToMouse = mouse.x !== undefined && mouse.y !== undefined ? 
                Math.hypot(node.x - mouse.x, node.y - mouse.y) : Infinity;
            let shadowBlur = node.isFlag ? 20 : 8;

            if (distToMouse < 150) {
                const influence = 1 - distToMouse / 150;
                pulseRadius *= (1 + influence * 2);
                shadowBlur = 20 + influence * 10;
            }

            if (node.isFlag && distToMouse < 20) {
                ripples.push(new Ripple(node.x, node.y));
                node.isFlag = false;
                let newFlagNode = nodes[Math.floor(Math.random() * nodes.length)];
                let attempts = 0;
                while(newFlagNode === node && attempts < 10) {
                    newFlagNode = nodes[Math.floor(Math.random() * nodes.length)];
                    attempts++;
                }
                newFlagNode.isFlag = true;
            }

            pulseRadius = Math.max(0.1, pulseRadius);

            ctx.beginPath();
            ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
            ctx.fillStyle = node.isFlag ? FLAG_COLOR : 'rgba(0, 124, 240, 0.8)';
            ctx.shadowBlur = shadowBlur;
            ctx.shadowColor = node.isFlag ? FLAG_COLOR : 'rgba(0, 124, 240, 0.8)';
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Update and draw ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
            ripples[i].update();
            ripples[i].draw();
            if (ripples[i].life <= 0) {
                ripples.splice(i, 1);
            }
        }
        
        // Update and draw packets
        packets.forEach(packet => {
            packet.update();
            packet.draw();
        });
    }

    function loop() {
        draw();
        requestAnimationFrame(loop);
    }

    // Event Listeners
    window.addEventListener('resize', setup);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    // Initialize
    setup();
    loop();
    
    // Add content wrapper class to body
    if (!document.body.classList.contains('content-wrapper-added')) {
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'content-wrapper';
        while (document.body.firstChild && document.body.firstChild !== canvas) {
            contentWrapper.appendChild(document.body.firstChild);
        }
        document.body.appendChild(contentWrapper);
        document.body.classList.add('content-wrapper-added');
    }
})();
