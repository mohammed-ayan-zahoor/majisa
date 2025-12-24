import React from 'react';

const Skeleton = ({ className, variant = 'rectangle', width, height }) => {
    const baseStyles = "bg-gray-200 animate-pulse overflow-hidden relative after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer";
    const variantStyles = variant === 'circle' ? 'rounded-full' : 'rounded-lg';

    return (
        <div
            className={`${baseStyles} ${variantStyles} ${className}`}
            style={{ width, height }}
        />
    );
};

export default Skeleton;
