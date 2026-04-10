"""Internal developer route — diagram viewer. Not linked from the main app."""

from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse, FileResponse

router = APIRouter(prefix="/_internal", tags=["internal"])

PUBLIC_DIR = Path(__file__).parents[4] / "public"

DIAGRAMS = [
    {"file": "flow-company-profile.png",      "title": "Company Profile Flow"},
    {"file": "flow-core-analysis.png",         "title": "Core Analysis Flow"},
    {"file": "flow-workspace-interaction.png", "title": "Workspace Interaction Flow"},
    {"file": "flow-supporting-pipelines.png",  "title": "Supporting Pipelines Flow"},
]


@router.get("/diagrams/{filename}")
async def serve_diagram(filename: str):
    path = PUBLIC_DIR / filename
    if not path.exists() or path.suffix != ".png":
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(path, media_type="image/png")


@router.get("/diagrams", response_class=HTMLResponse)
async def diagram_viewer():
    import json
    data = json.dumps(DIAGRAMS)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Diagrams</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f3f1;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }}

    nav {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      background: #fff;
      border-bottom: 1px solid #e5e1dd;
    }}
    .nav-title {{
      font-size: 13px;
      font-weight: 600;
      color: #1a1816;
    }}
    .nav-sub {{
      font-size: 11px;
      color: #9e978f;
      margin-top: 1px;
    }}
    .arrows {{
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .arrow {{
      width: 34px;
      height: 34px;
      border-radius: 8px;
      border: 1px solid #e5e1dd;
      background: #fff;
      color: #4a4540;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.12s, border-color 0.12s;
      user-select: none;
    }}
    .arrow:hover:not(:disabled) {{ background: #f0ece8; border-color: #ccc8c4; }}
    .arrow:disabled {{ opacity: 0.3; cursor: default; }}
    .counter {{
      font-size: 12px;
      color: #9e978f;
      min-width: 36px;
      text-align: center;
    }}

    .viewer {{
      flex: 1;
      overflow: hidden;
      position: relative;
      cursor: grab;
    }}
    .viewer.grabbing {{ cursor: grabbing; }}
    .img-wrap {{
      position: absolute;
      top: 0; left: 0;
      transform-origin: 0 0;
    }}
    img {{
      display: block;
      max-width: none;
      user-select: none;
      -webkit-user-drag: none;
    }}
  </style>
</head>
<body>

<nav>
  <div>
    <div class="nav-title" id="title">—</div>
    <div class="nav-sub" id="sub"></div>
  </div>
  <div class="arrows">
    <button class="arrow" id="btn-prev" onclick="nav(-1)" disabled>&#8592;</button>
    <span class="counter" id="counter"></span>
    <button class="arrow" id="btn-next" onclick="nav(1)">&#8594;</button>
  </div>
</nav>

<div class="viewer" id="viewer">
  <div class="img-wrap" id="wrap">
    <img id="img" src="" alt="" draggable="false" />
  </div>
</div>

<script>
  const DIAGRAMS = {data};
  let idx = 0, scale = 1, ox = 0, oy = 0, drag = null;

  function load(i) {{
    idx = i;
    const d = DIAGRAMS[i];
    document.getElementById('title').textContent = d.title;
    document.getElementById('sub').textContent = (i + 1) + ' of ' + DIAGRAMS.length;
    document.getElementById('counter').textContent = (i + 1) + ' / ' + DIAGRAMS.length;
    document.getElementById('btn-prev').disabled = i === 0;
    document.getElementById('btn-next').disabled = i === DIAGRAMS.length - 1;
    const img = document.getElementById('img');
    img.onload = fit;
    img.src = '/_internal/diagrams/' + d.file;
  }}

  function nav(dir) {{
    const n = idx + dir;
    if (n >= 0 && n < DIAGRAMS.length) load(n);
  }}

  function fit() {{
    const v = document.getElementById('viewer');
    const img = document.getElementById('img');
    const sw = v.clientWidth - 48, sh = v.clientHeight - 48;
    scale = Math.min(sw / img.naturalWidth, sh / img.naturalHeight, 1);
    ox = (v.clientWidth - img.naturalWidth * scale) / 2;
    oy = (v.clientHeight - img.naturalHeight * scale) / 2;
    apply();
  }}

  function apply() {{
    document.getElementById('wrap').style.transform =
      `translate(${{ox}}px,${{oy}}px) scale(${{scale}})`;
  }}

  const viewer = document.getElementById('viewer');
  viewer.addEventListener('mousedown', e => {{
    if (e.button !== 0) return;
    drag = {{ x: e.clientX - ox, y: e.clientY - oy }};
    viewer.classList.add('grabbing');
  }});
  window.addEventListener('mousemove', e => {{
    if (!drag) return;
    ox = e.clientX - drag.x;
    oy = e.clientY - drag.y;
    apply();
  }});
  window.addEventListener('mouseup', () => {{ drag = null; viewer.classList.remove('grabbing'); }});

  viewer.addEventListener('wheel', e => {{
    e.preventDefault();
    const r = viewer.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const prev = scale;
    scale = Math.max(0.1, Math.min(5, scale * (1 - e.deltaY * 0.004)));
    ox = mx - (mx - ox) * (scale / prev);
    oy = my - (my - oy) * (scale / prev);
    apply();
  }}, {{ passive: false }});

  window.addEventListener('keydown', e => {{
    if (e.key === 'ArrowRight') nav(1);
    if (e.key === 'ArrowLeft') nav(-1);
    if (e.key === 'f') fit();
  }});

  load(0);
</script>
</body>
</html>"""

    return HTMLResponse(content=html)
