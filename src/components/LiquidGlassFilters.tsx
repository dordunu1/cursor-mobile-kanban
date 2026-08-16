/** Hidden SVG filters that approximate Apple Liquid Glass refraction. */
export function LiquidGlassFilters() {
  return (
    <svg className="liquid-glass-svg" aria-hidden="true" width="0" height="0">
      <defs>
        <filter
          id="lg-refract"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012 0.028"
            numOctaves="3"
            seed="7"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="8s"
              values="0.012 0.028;0.018 0.022;0.012 0.028"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feGaussianBlur in="noise" stdDeviation="0.4" result="soft" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="soft"
            scale="42"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter
          id="lg-refract-strong"
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.04"
            numOctaves="2"
            seed="11"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="56"
            xChannelSelector="R"
            yChannelSelector="B"
          />
        </filter>
      </defs>
    </svg>
  )
}

export function GlassScene() {
  return (
    <div className="glass-scene" aria-hidden="true">
      <div className="scene-wash" />
      <div className="scene-orb scene-orb-a" />
      <div className="scene-orb scene-orb-b" />
      <div className="scene-orb scene-orb-c" />
      <div className="scene-orb scene-orb-d" />
      <div className="scene-orb scene-orb-e" />
      <div className="scene-band scene-band-a" />
      <div className="scene-band scene-band-b" />
    </div>
  )
}
