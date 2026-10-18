import os
import time
import math
import asyncio
import urllib.request
import subprocess
from playwright.sync_api import sync_playwright
import edge_tts

# Audio Script Timed for ~65 seconds
AUDIO_SCRIPT = """Meet BlastGuard: an autonomous cloud security platform powered by FalkorDB. In complex cloud estates, isolated alerts hide transitive multi-hop threats between staging and production environments.

When we select this critical alert, BlastGuard executes parameterized Cypher traversals in FalkorDB. In sub-millisecond time, it traces the exact multi-hop escalation from a compromised staging pod, across IAM trust boundaries, directly into Tier-Zero customer PII backups.

BlastGuard inspects graph neighbors to check collateral impact. A legitimate production backup service also uses this role. Instead of deleting the role and causing an outage, our agent recommends surgically severing the cross-account trust.

We click Simulate Remediation, review the Terraform diff, and apply the change. FalkorDB instantly updates and recomputes reachability, mathematically proving zero remaining attack paths. BlastGuard: Trace the attack, cut the path, prove it is gone."""

AUDIO_FILE = "demo_audio.mp3"
TEMP_VIDEO_DIR = "temp_video_rec"
OUTPUT_VIDEO = "blastguard_demo_video.mp4"

async def generate_voiceover():
    print(f"[1/4] Generating studio AI voiceover with edge-tts...")
    communicate = edge_tts.Communicate(AUDIO_SCRIPT, "en-US-ChristopherNeural", rate="+2%")
    await communicate.save(AUDIO_FILE)
    print(f"       Voiceover saved to {AUDIO_FILE}")

def smooth_move(page, start_pos, end_pos, duration=0.8, steps=25):
    """Interpolates cursor smoothly between two points with ease-in-out."""
    x0, y0 = start_pos
    x1, y1 = end_pos
    dt = duration / steps
    for i in range(1, steps + 1):
        t = i / steps
        # Smooth ease-in-out curve
        ease = 0.5 - 0.5 * math.cos(math.pi * t)
        cx = x0 + (x1 - x0) * ease
        cy = y0 + (y1 - y0) * ease
        page.evaluate(f"window.updateCursor({cx}, {cy});")
        time.sleep(dt)
    return (x1, y1)

def record_video():
    print("[2/4] Recording browser interactions with Playwright...")
    os.makedirs(TEMP_VIDEO_DIR, exist_ok=True)
    
    # 1. Reset demo state
    try:
        req = urllib.request.Request("http://localhost:3000/api/demo/reset", data=b"{}", headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req)
        print("       Graph database reset to clean baseline.")
    except Exception as e:
        print("       Reset note:", e)

    p = sync_playwright().start()
    browser = p.chromium.launch(
        channel="msedge",
        headless=True,
        args=["--window-size=1920,1080", "--disable-gpu"]
    )
    
    context = browser.new_context(
        viewport={"width": 1920, "height": 1080},
        record_video_dir=TEMP_VIDEO_DIR,
        record_video_size={"width": 1920, "height": 1080}
    )
    
    page = context.new_page()
    page.goto("http://localhost:3000", wait_until="networkidle")
    
    # Inject glowing cyber cursor
    page.evaluate("""
        const c = document.createElement('div');
        c.id = 'demo-cursor';
        c.style.position = 'fixed';
        c.style.width = '24px';
        c.style.height = '24px';
        c.style.borderRadius = '50%';
        c.style.border = '2px solid #4f46e5';
        c.style.background = 'rgba(79, 70, 229, 0.4)';
        c.style.boxShadow = '0 0 16px #6366f1, inset 0 0 8px #818cf8';
        c.style.pointerEvents = 'none';
        c.style.zIndex = '999999';
        c.style.transform = 'translate(960px, 540px)';
        c.style.transition = 'width 0.15s, height 0.15s, background 0.15s';
        document.body.appendChild(c);

        window.updateCursor = (x, y) => {
            c.style.transform = `translate(${x - 12}px, ${y - 12}px)`;
        };
        window.pulseCursor = () => {
            c.style.width = '34px';
            c.style.height = '34px';
            c.style.background = 'rgba(168, 85, 247, 0.7)';
            c.style.border = '2px solid #a855f7';
            setTimeout(() => {
                c.style.width = '24px';
                c.style.height = '24px';
                c.style.background = 'rgba(79, 70, 229, 0.4)';
                c.style.border = '2px solid #4f46e5';
            }, 200);
        };
    """)
    
    cur_pos = (960, 540)
    
    # SECTION 1: Intro (0:00 - 0:13) [13s]
    print("       -> Recording Segment 1: Intro & Overview...")
    time.sleep(1.0)
    cur_pos = smooth_move(page, cur_pos, (340, 32), duration=1.2) # Hover over BlastGuard brand
    time.sleep(1.8)
    cur_pos = smooth_move(page, cur_pos, (1680, 32), duration=1.4) # Hover over FalkorDB Connected badge
    time.sleep(2.0)
    cur_pos = smooth_move(page, cur_pos, (160, 80), duration=1.2) # Move to Threat Stream
    time.sleep(2.5)
    cur_pos = smooth_move(page, cur_pos, (160, 220), duration=1.2) # Hover over ALERT-9041
    time.sleep(1.5)
    
    # SECTION 2: Graph Discovery (0:13 - 0:31) [18s]
    print("       -> Recording Segment 2: Threat Selection & Cypher Traversal...")
    page.evaluate("window.pulseCursor();")
    alert_heading = page.locator("h3:has-text('Reverse Shell')").first
    alert_heading.click()
    time.sleep(1.5)
    
    # Trace the attack path across canvas
    cur_pos = smooth_move(page, cur_pos, (520, 480), duration=1.5) # Node 1: staging-payment-worker
    time.sleep(1.5)
    cur_pos = smooth_move(page, cur_pos, (720, 480), duration=1.5) # Node 2: sa-payment-worker-stage
    time.sleep(1.5)
    cur_pos = smooth_move(page, cur_pos, (950, 480), duration=1.8) # Node 3: role-cross-env-deployer
    time.sleep(1.5)
    cur_pos = smooth_move(page, cur_pos, (1180, 480), duration=1.5) # Node 4: Policy
    time.sleep(1.5)
    cur_pos = smooth_move(page, cur_pos, (1380, 480), duration=1.5) # Node 5: prod-customer-pii-backups (Tier 0)
    time.sleep(2.0)
    
    # SECTION 3: Evidence & Collateral Impact (0:31 - 0:48) [17s]
    print("       -> Recording Segment 3: Collateral Impact & Cypher Evidence...")
    cur_pos = smooth_move(page, cur_pos, (1650, 360), duration=1.5) # Evidence Panel - Cypher block
    time.sleep(2.0)
    cur_pos = smooth_move(page, cur_pos, (1650, 560), duration=1.5) # Collateral Impact badge
    time.sleep(2.5)
    cur_pos = smooth_move(page, cur_pos, (950, 320), duration=1.5) # Glance at legitimate backup service on graph
    time.sleep(2.5)
    cur_pos = smooth_move(page, cur_pos, (1650, 780), duration=1.5) # Move down to candidate remediation card
    time.sleep(2.0)
    
    # SECTION 4: Remediation Simulation & Verification (0:48 - 1:06) [18s]
    print("       -> Recording Segment 4: Simulating & Verifying in FalkorDB...")
    sim_btn = page.locator("button:has-text('Simulate Remediation')").first
    sim_box = sim_btn.bounding_box()
    if sim_box:
        cur_pos = smooth_move(page, cur_pos, (sim_box["x"] + sim_box["width"]/2, sim_box["y"] + sim_box["height"]/2), duration=1.0)
    
    page.evaluate("window.pulseCursor();")
    sim_btn.click()
    time.sleep(1.5)
    
    # Review Terraform HCL Diff inside modal
    cur_pos = smooth_move(page, cur_pos, (960, 520), duration=1.2) # Diff content
    time.sleep(2.0)
    
    # Click Apply Simulation & Verify in FalkorDB
    apply_btn = page.locator("button:has-text('Apply Simulation & Verify')").first
    apply_box = apply_btn.bounding_box()
    if apply_box:
        cur_pos = smooth_move(page, cur_pos, (apply_box["x"] + apply_box["width"]/2, apply_box["y"] + apply_box["height"]/2), duration=1.0)
    
    page.evaluate("window.pulseCursor();")
    apply_btn.click()
    time.sleep(2.0)
    
    # Inspect Mathematical Proof Modal
    cur_pos = smooth_move(page, cur_pos, (960, 440), duration=1.2) # Zero paths proof
    time.sleep(2.5)
    
    # Click View Updated Severed Subgraph
    close_btn = page.locator("button:has-text('View Updated Severed Subgraph')").first
    close_box = close_btn.bounding_box()
    if close_box:
        cur_pos = smooth_move(page, cur_pos, (close_box["x"] + close_box["width"]/2, close_box["y"] + close_box["height"]/2), duration=0.8)
    
    page.evaluate("window.pulseCursor();")
    close_btn.click()
    time.sleep(1.5)
    
    # Final glance at severed path and RESOLVED badge
    cur_pos = smooth_move(page, cur_pos, (160, 220), duration=1.2) # Resolved green badge
    time.sleep(2.0)
    cur_pos = smooth_move(page, cur_pos, (960, 540), duration=1.2) # Center graph
    time.sleep(2.0)
    
    context.close()
    browser.close()
    p.stop()
    print("       Browser recording completed.")

def process_video():
    print("[3/4] Locating raw WebM video file...")
    raw_files = [f for f in os.listdir(TEMP_VIDEO_DIR) if f.endswith(".webm")]
    if not raw_files:
        raise RuntimeError("No recorded WebM video found in " + TEMP_VIDEO_DIR)
    raw_video = os.path.join(TEMP_VIDEO_DIR, raw_files[0])
    print(f"       Found raw video: {raw_video}")
    
    print(f"[4/4] Muxing high-definition video and voiceover with FFmpeg -> {OUTPUT_VIDEO}...")
    
    cmd = [
        "ffmpeg",
        "-y",
        "-i", raw_video,
        "-i", AUDIO_FILE,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-preset", "medium",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        OUTPUT_VIDEO
    ]
    
    result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if result.returncode != 0:
        print("FFmpeg error:", result.stderr.decode("utf-8", errors="ignore")[-800:])
        raise RuntimeError("FFmpeg processing failed")
    
    # Get final video duration
    dur_cmd = ["ffprobe", "-i", OUTPUT_VIDEO, "-show_entries", "format=duration", "-v", "quiet", "-of", "csv=p=0"]
    dur = subprocess.check_output(dur_cmd).decode("utf-8").strip()
    size_mb = os.path.getsize(OUTPUT_VIDEO) / (1024 * 1024)
    
    print("\n" + "="*60)
    print(f"SUCCESS! Demo Video created: {OUTPUT_VIDEO}")
    print(f"Duration: {float(dur):.2f} seconds (~1 minute 5 seconds)")
    print(f"Resolution: 1920x1080 (Full HD, 60fps compatible)")
    print(f"File Size: {size_mb:.2f} MB")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(generate_voiceover())
    record_video()
    process_video()
