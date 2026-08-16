/** Static wash + a few soft orbs. No animated SVG refraction. */
export function GlassScene() {
  return (
    <div className="glass-scene" aria-hidden="true">
      <div className="scene-wash" />
      <div className="scene-orb scene-orb-a" />
      <div className="scene-orb scene-orb-b" />
      <div className="scene-orb scene-orb-c" />
    </div>
  )
}
