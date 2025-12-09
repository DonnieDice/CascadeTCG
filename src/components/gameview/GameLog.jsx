import React, { useEffect, useRef } from 'react';

// Helper function to add emojis based on keywords
const getLogMessageWithEmoji = (message) => {
  if (message.includes('plays')) return `⚔️ ${message}`;
  if (message.includes('draws')) return `🃏 ${message}`;
  if (message.includes('takes')) return `💔 ${message}`;
  if (message.includes('heals')) return `❤️ ${message}`;
  if (message.includes('wins')) return `🏆 ${message}`;
  if (message.includes('loses')) return `💀 ${message}`;
  if (message.includes('starts turn')) return `✨ ${message}`;
  if (message.includes('ends turn')) return `😴 ${message}`;
  if (message.includes('uses seal')) return `🔮 ${message}`;
  if (message.includes('stops cascading')) return `🛑 ${message}`;
  if (message.includes('force capture')) return `💎 ${message}`;
  if (message.includes('continues cascade')) return `➡️ ${message}`;
  return message;
};

export default function GameLog({ log }) {
  const logContainerRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [log]); // Dependency on log ensures scroll on new messages

  return (
    <div
      ref={logContainerRef}
      className="flex-1 p-3 bg-dark-300/20 rounded-lg md:rounded-xl shadow-inner border-2 border-primary-600 h-32 md:h-40 overflow-y-auto font-mono text-light text-xs md:text-sm leading-relaxed"
    >
      {log.map((m, i) => (
        <div key={i} className="py-1 animate-fadeIn"> {/* Added animate-fadeIn class */}
          {getLogMessageWithEmoji(m)}
        </div>
      ))}
    </div>
  );
}