import React, { useState, useRef, useEffect } from 'react';

interface ShareButtonProps {
  character: {
    id: string;
    name: string;
    tagline?: string;
    description?: string;
  };
  className?: string;
}

const SHARE_TARGETS = [
  {
    name: 'Twitter',
    icon: '𝕏',
    getUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Reddit',
    icon: '🔗',
    getUrl: (url: string, text: string) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
  },
  {
    name: 'Discord',
    icon: '💬',
    getUrl: (url: string) => url, // Discord auto-embeds — just copy the link
    copyOnly: true,
  },
];

export const ShareButton: React.FC<ShareButtonProps> = ({ character, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const charUrl = `${window.location.origin}/explore?character=${character.id}`;
  const shareText = character.tagline
    ? `Chat with ${character.name} on Mythic AI — ${character.tagline}`
    : `Chat with ${character.name} on Mythic AI — uncensored AI roleplay`;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(charUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (target: typeof SHARE_TARGETS[number]) => {
    if (target.copyOnly) {
      handleCopy();
    } else {
      window.open(target.getUrl(charUrl, shareText), '_blank', 'noopener,noreferrer');
    }
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
        title="Share"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 bottom-full mb-2 w-44 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {SHARE_TARGETS.map((target) => (
            <button
              key={target.name}
              onClick={() => handleShare(target)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="text-base w-5 text-center">{target.icon}</span>
              {target.name}
              {target.copyOnly && <span className="text-[10px] text-gray-500 ml-auto">copy link</span>}
            </button>
          ))}
          <div className="border-t border-white/5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <span className="text-base w-5 text-center">{copied ? '✓' : '📋'}</span>
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
