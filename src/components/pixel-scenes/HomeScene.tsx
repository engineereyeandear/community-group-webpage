// A decorative, code-drawn pixel-art dusk landscape for the homepage — an
// original scene (not copied from any existing game or site), built entirely
// from SVG shapes so it's lightweight and has no licensing concerns. It's
// purely decorative (aria-hidden) and sits behind the real content, which
// keeps its own solid background so text contrast is unaffected.
export function HomeScene() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <svg
        viewBox="0 0 400 225"
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="home-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c2d12" />
            <stop offset="45%" stopColor="#c2410c" />
            <stop offset="75%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>

        {/* sky */}
        <rect x="0" y="0" width="400" height="225" fill="url(#home-sky)" />

        {/* sun, pixel-stepped circle */}
        <g fill="#fef3c7">
          <rect x="268" y="70" width="24" height="6" />
          <rect x="262" y="76" width="36" height="6" />
          <rect x="256" y="82" width="48" height="6" />
          <rect x="256" y="88" width="48" height="6" />
          <rect x="256" y="94" width="48" height="6" />
          <rect x="256" y="100" width="48" height="6" />
          <rect x="256" y="106" width="48" height="6" />
          <rect x="256" y="112" width="48" height="6" />
          <rect x="262" y="118" width="36" height="6" />
          <rect x="268" y="124" width="24" height="6" />
        </g>

        {/* a couple of distant birds */}
        <g fill="#2a1608" opacity="0.6">
          <rect x="60" y="40" width="8" height="3" />
          <rect x="72" y="40" width="8" height="3" />
          <rect x="100" y="55" width="6" height="3" />
          <rect x="110" y="55" width="6" height="3" />
        </g>

        {/* far mountain ridge */}
        <polygon
          fill="#9a3412"
          opacity="0.85"
          points="0,225 0,140 25,140 25,134 50,134 50,140 75,140 75,146 100,146 100,140 125,140 125,134 150,134 150,140 175,140 175,140 200,140 200,146 225,146 225,152 250,152 250,140 275,140 275,146 300,146 300,134 325,134 325,146 350,146 350,146 375,146 375,140 400,140 400,146 400,225"
        />

        {/* mid mountain ridge */}
        <polygon
          fill="#78350f"
          points="0,225 0,160 20,160 20,152 40,152 40,145 60,145 60,145 80,145 80,153 100,153 100,145 120,145 120,145 140,145 140,161 160,161 160,169 180,169 180,153 200,153 200,145 220,145 220,153 240,153 240,145 260,145 260,153 280,153 280,145 300,145 300,145 320,145 320,145 340,145 340,145 360,145 360,145 380,145 380,145 400,145 400,145 400,225"
        />

        {/* foreground hill (with a plateau for the church) */}
        <polygon
          fill="#2a1608"
          points="0,225 0,205 40,205 40,200 80,200 80,190 110,190 110,175 140,175 140,165 170,165 170,158 200,158 200,152 230,152 230,158 260,158 260,165 290,165 290,175 320,175 320,190 350,190 350,200 400,200 400,225"
        />

        {/* winding lit path up to the church */}
        <g fill="#fbbf24" opacity="0.85">
          <rect x="188" y="210" width="20" height="8" />
          <rect x="192" y="196" width="18" height="8" />
          <rect x="198" y="182" width="16" height="8" />
          <rect x="202" y="168" width="14" height="8" />
          <rect x="204" y="154" width="12" height="8" />
        </g>

        {/* small church on the hilltop, with a lit window and a cross */}
        <g fill="#2a1608">
          <rect x="195" y="118" width="40" height="34" />
          <polygon points="195,118 203,118 203,110 211,110 211,102 219,102 219,110 227,110 227,118 235,118" />
          <rect x="211" y="90" width="8" height="12" />
        </g>
        <rect x="209" y="140" width="10" height="12" fill="#fde68a" />
        <g fill="#fde68a">
          <rect x="214" y="76" width="2" height="12" />
          <rect x="210" y="80" width="10" height="2" />
        </g>
      </svg>
    </div>
  );
}
