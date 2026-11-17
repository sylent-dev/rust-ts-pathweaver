// Maps each pattern of css/textures.css to the layer that shows it, from the lists of the page
// (data-pattern1, data-pattern2): one rule per pattern and layer, written here rather than by hand.
const textureRules = document.createElement("style");
textureRules.textContent = Object.keys(PATTERNS).flatMap(key => [1, 2].map(n =>
  `:root[data-pattern${n}="${key}"] { --texture-${n}: var(--pattern-${key}); --ratio-${n}: var(--ratio-${key}, 1); --scale-${n}: var(--scale-${key}, 1); }`)).join("\n");
document.head.append(textureRules);
