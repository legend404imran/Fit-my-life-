export const Charts = {
  // SVG animated ring
  ring(container, { value, max, color = 'var(--blue)', label, size = 80, stroke = 8 }) {
    const radius = (size / 2) - stroke;
    const circumference = radius * 2 * Math.PI;
    const percent = Math.min(value / (max || 1), 1);
    const offset = circumference - percent * circumference;
    
    container.innerHTML = `
      <div class="flex flex-col items-center gap-2">
        <div class="ring-container" style="width: ${size}px; height: ${size}px;">
          <svg class="ring-svg" width="${size}" height="${size}">
            <circle class="ring-track" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${stroke}" />
            <circle class="ring-fill" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${stroke}" stroke="${color}" 
              stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}" />
          </svg>
          <div class="absolute inset-0 flex items-center justify-center flex-col" style="position: absolute; top:0; left:0; right:0; bottom:0;">
            <span class="font-bold text-sm" style="color: ${color}">${Math.round(percent * 100)}%</span>
          </div>
        </div>
        ${label ? `<span class="text-xs text-muted font-semibold">${label}</span>` : ''}
      </div>
    `;
    
    // Animate after render
    setTimeout(() => {
      const fill = container.querySelector('.ring-fill');
      if (fill) fill.style.strokeDashoffset = offset;
    }, 50);
  },

  // Canvas Bar Chart
  bar(canvas, { labels, data, color = '#3b82f6', maxVal = null }) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 20, right: 10, bottom: 30, left: 30 };
    
    const max = maxVal || Math.max(...data, 1);
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;
    const barW = Math.min(chartW / data.length * 0.6, 40);
    const spacing = (chartW - (barW * data.length)) / (data.length || 1);
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw axes
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();
    
    // Y-axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(max.toString(), padding.left - 5, padding.top);
    ctx.fillText('0', padding.left - 5, height - padding.bottom);
    
    // Animate bars
    let progress = 0;
    const animate = () => {
      progress += 0.05;
      if (progress > 1) progress = 1;
      
      // Clear chart area
      ctx.clearRect(padding.left + 1, 0, width - padding.left, height);
      
      data.forEach((val, i) => {
        const barH = (val / max) * chartH * progress;
        const x = padding.left + spacing/2 + (i * (barW + spacing));
        const y = height - padding.bottom - barH;
        
        ctx.fillStyle = color;
        // Draw rounded rect
        ctx.beginPath();
        ctx.moveTo(x, height - padding.bottom);
        ctx.lineTo(x, y + 4);
        ctx.quadraticCurveTo(x, y, x + 4, y);
        ctx.lineTo(x + barW - 4, y);
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + 4);
        ctx.lineTo(x + barW, height - padding.bottom);
        ctx.fill();
        
        // X-axis label
        if (progress === 1 && labels && labels[i]) {
          ctx.fillStyle = '#94a3b8';
          ctx.textAlign = 'center';
          ctx.fillText(labels[i], x + barW/2, height - padding.bottom + 15);
        }
      });
      
      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  },

  // Heatmap using DOM nodes (easier for interactions and tooltips)
  heatmap(container, { data, colorBase = '34, 197, 94', cellCount = 30 }) {
    const today = new Date();
    const cells = [];
    
    for (let i = cellCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const val = data[dateStr] || 0;
      
      let opacity = 0.1;
      if (val > 0) opacity = Math.min(0.3 + (val * 0.2), 1);
      
      cells.push(`<div class="heatmap-cell" style="width: 12px; height: 12px; border-radius: 3px; background: rgba(${colorBase}, ${opacity})" title="${dateStr}: ${val}"></div>`);
    }
    
    container.innerHTML = `
      <div class="flex flex-wrap gap-1">
        ${cells.join('')}
      </div>
    `;
  }
};