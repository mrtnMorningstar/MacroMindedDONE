export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
};

export const slideInRight = {
  hidden: { opacity: 0, x: "100%" },
  show: { opacity: 1, x: 0 },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: "-100%" },
  show: { opacity: 1, x: 0 },
};

export const transition = {
  duration: 0.35,
  ease: "easeInOut" as const,
};

export const transitionFast = {
  duration: 0.2,
  ease: "easeInOut" as const,
};

export const transitionSlow = {
  duration: 0.5,
  ease: "easeInOut" as const,
};

