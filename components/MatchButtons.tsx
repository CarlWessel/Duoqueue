interface MatchButtonsProps {
  onLike: () => void;
  onPass: () => void;
  onRedo: () => void;
  onSuperLike: () => void;
}

export default function MatchButtons({
  onLike,
  onPass,
  onRedo,
  onSuperLike,
}: MatchButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-6">
    {/* Redo - Yellow */}
    <button
    onClick={onRedo}
    className="
        w-13 h-13
        rounded-full
        bg-yellow-400
        text-white
        border-4 border-yellow-600
        shadow-[inset_0_-5px_0_rgba(0,0,0,0.25),0_5px_10px_rgba(0,0,0,0.3)]
        hover:bg-yellow-300
        hover:scale-105
        active:scale-95
        active:shadow-[inset_0_3px_0_rgba(0,0,0,0.25)]
        transition-all duration-150
        flex items-center justify-center
    "
    aria-label="Redo"
    >
    <span className="text-2xl font-bold">↻</span>
    </button>

    {/* Pass - Red */}
    <button
    onClick={onPass}
    className="
        w-16 h-16
        rounded-full
        bg-red-600
        text-white
        border-4 border-red-800
        shadow-[inset_0_-5px_0_rgba(0,0,0,0.25),0_5px_10px_rgba(0,0,0,0.3)]
        hover:bg-red-500
        hover:scale-105
        active:scale-95
        active:shadow-[inset_0_3px_0_rgba(0,0,0,0.25)]
        transition-all duration-150
        flex items-center justify-center
    "
    aria-label="Pass"
    >
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
        />
    </svg>
    </button>

    {/* Like - Green */}
    <button
    onClick={onLike}
    className="
        w-16 h-16
        rounded-full
        bg-green-500
        text-white
        border-4 border-green-700
        shadow-[inset_0_-5px_0_rgba(0,0,0,0.25),0_5px_10px_rgba(0,0,0,0.3)]
        hover:bg-green-400
        hover:scale-105
        active:scale-95
        active:shadow-[inset_0_3px_0_rgba(0,0,0,0.25)]
        transition-all duration-150
        flex items-center justify-center
    "
    aria-label="Like"
    >
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path
        fillRule="evenodd"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
        clipRule="evenodd"
        />
    </svg>
    </button>

    {/* Super Like - Blue */}
    <button
    onClick={onSuperLike}
    className="
        w-13 h-13
        rounded-full
        bg-blue-500
        text-white
        border-4 border-blue-700
        shadow-[inset_0_-5px_0_rgba(0,0,0,0.25),0_5px_10px_rgba(0,0,0,0.3)]
        hover:bg-blue-400
        hover:scale-105
        active:scale-95
        active:shadow-[inset_0_3px_0_rgba(0,0,0,0.25)]
        transition-all duration-150
        flex items-center justify-center
    "
    aria-label="Super Like"
    >
    <span className="text-2xl">★</span>
    </button>
    </div>
  );
}

