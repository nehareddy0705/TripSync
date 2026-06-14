import React from "react";

export default function Avatar({ name, imageUrl, size = "w-8 h-8", textClass = "text-sm", roundedClass = "rounded-lg" }) {
  const getInitial = (n) => {
    if (!n) return "?";
    return n.trim().charAt(0).toUpperCase();
  };

  const isUnsplash = (url) => {
    return !url || url.includes("unsplash.com") || url.includes("images.unsplash.com");
  };

  if (imageUrl && !isUnsplash(imageUrl)) {
    return (
      <img
        src={imageUrl}
        alt={name || "Profile"}
        className={`${size} ${roundedClass} object-cover`}
      />
    );
  }

  // Elegant modern gradients
  const gradients = [
    "from-rose-500 to-red-600",
    "from-orange-500 to-amber-600",
    "from-emerald-500 to-teal-600",
    "from-teal-500 to-cyan-600",
    "from-blue-500 to-indigo-600",
    "from-indigo-500 to-purple-600",
    "from-violet-500 to-fuchsia-600",
    "from-pink-500 to-rose-600"
  ];
  
  const charCode = name ? name.charCodeAt(0) : 0;
  const gradient = gradients[charCode % gradients.length];

  return (
    <div className={`${size} ${roundedClass} flex items-center justify-center bg-gradient-to-br ${gradient} text-white font-bold uppercase tracking-wider ${textClass} shrink-0 select-none`}>
      {getInitial(name)}
    </div>
  );
}
