// script.js - simulate CPU/RAM usage for Aryzem Gaming X
document.addEventListener('DOMContentLoaded', () => {
  const cpuCores = 568;
  const cpuThreads = 1136;
  const ramGB = 1200;
  const ramBandwidth = '100 GB/s';
  const storageGB = 1200;

  // DOM elements
  const cpuUsageBar = document.getElementById('cpuUsageBar');
  const cpuUsageText = document.getElementById('cpuUsageText');
  const ramUsageBar = document.getElementById('ramUsageBar');
  const ramUsageText = document.getElementById('ramUsageText');
  const ioUsageBar = document.getElementById('ioUsageBar');
  const ioUsageText = document.getElementById('ioUsageText');

  const cpuCoresEl = document.getElementById('cpuCores');
  const cpuThreadsEl = document.getElementById('cpuThreads');
  const ramSizeEl = document.getElementById('ramSize');
  const ramBandwidthEl = document.getElementById('ramBandwidth');
  const storageSizeEl = document.getElementById('storageSize');
  const readThruEl = document.getElementById('readThru');

  const netCounter = document.getElementById('netCounter');
  const dataCounter = document.getElementById('dataCounter');

  const simulateBtn = document.getElementById('simulateBtn');
  const resetBtn = document.getElementById('resetBtn');

  // populate static values
  cpuCoresEl.textContent = cpuCores;
  cpuThreadsEl.textContent = cpuThreads;
  ramSizeEl.textContent = '1.2 TB (1200 GB)';
  ramBandwidthEl.textContent = ramBandwidth;
  storageSizeEl.textContent = storageGB + ' GB';
  readThruEl.textContent = '1200 GB/s';

  // helper to animate a bar
  function animateBar(barEl, textEl, start, end, durationMs = 1200) {
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / durationMs);
      const val = Math.round(start + (end - start) * t);
      barEl.style.width = val + '%';
      textEl.textContent = val + '%';
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // random-ish values generator for simulation
  function simulateLoad() {
    // CPU: between 20% and 95% but influenced by core count
    const cpuTarget = Math.min(99, 40 + Math.floor(Math.random() * 55));
    // RAM: usage percent derived from "huge RAM" but simulate some used
    const ramTarget = Math.min(99, 10 + Math.floor(Math.random() * 60));
    // IO: between 5% and 90%
    const ioTarget = Math.min(99, 5 + Math.floor(Math.random() * 85));

    animateBar(cpuUsageBar, cpuUsageText, parseInt(cpuUsageBar.style.width) || 0, cpuTarget, 1200);
    animateBar(ramUsageBar, ramUsageText, parseInt(ramUsageBar.style.width) || 0, ramTarget, 1200);
    animateBar(ioUsageBar, ioUsageText, parseInt(ioUsageBar.style.width) || 0, ioTarget, 1200);

    // update counters (simulate fast transfers)
    netCounter.textContent = (100 + Math.floor(Math.random() * 200)) + ' GB/s';
    dataCounter.textContent = (1000 + Math.floor(Math.random() * 400)) + ' GB';

    // show simulated clock bump
    const clockEl = document.getElementById('cpuClock');
    if (clockEl) {
      clockEl.textContent = (4 + Math.random() * 1.5).toFixed(2) + ' GHz';
    }
  }

  function resetUI() {
    animateBar(cpuUsageBar, cpuUsageText, parseInt(cpuUsageBar.style.width) || 0, 0, 600);
    animateBar(ramUsageBar, ramUsageText, parseInt(ramUsageBar.style.width) || 0, 0, 600);
    animateBar(ioUsageBar, ioUsageText, parseInt(ioUsageBar.style.width) || 0, 0, 600);
    netCounter.textContent = '100 GB/s';
    dataCounter.textContent = '1200 GB';
    const clockEl = document.getElementById('cpuClock');
    if (clockEl) clockEl.textContent = '4.2 GHz';
  }

  simulateBtn.addEventListener('click', () => {
    // run a short burst simulation sequence
    simulateLoad();
    // follow-up bursts
    setTimeout(simulateLoad, 1400);
    setTimeout(simulateLoad, 2800);
  });

  resetBtn.addEventListener('click', resetUI);

  // initial values
  resetUI();
});
