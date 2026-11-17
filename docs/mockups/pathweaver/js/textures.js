// Maps each pattern of css/textures.css to the layer, from the list of the page (data-pattern): one
// rule per pattern, written here rather than by hand.
const textureRules = document.createElement("style");
textureRules.textContent = Object.keys(PATTERNS).map(key =>
  `:root[data-pattern="${key}"] { --texture: var(--pattern-${key}); --texture-ratio: var(--ratio-${key}, 1); --texture-scale: var(--scale-${key}, 1); }`).join("\n");
document.head.append(textureRules);
