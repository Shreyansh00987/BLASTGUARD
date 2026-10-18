# FalkorDB Graph Hacks — Hackathon Submission Checklist

Target Track: **Track 01 — Agents That Act on Connected Data**  
Project Name: **BlastGuard**  
Tagline: **Trace the attack. Cut the path. Prove it's gone.**

---

## Technical & Functional Verification

- [x] **Main Product Journey Functional**: The full *Discover → Trace → Explain → Simulate → Verify → Audit* workflow operates seamlessly.
- [x] **FalkorDB is Primary Database**: FalkorDB serves as the operational source of truth for graph relationships, multi-hop traversals, and reachability calculations.
- [x] **Core Cypher Queries Documented**: 10 parameterized Cypher queries documented in `docs/CYPHER_QUERIES.md`.
- [x] **Synthetic Data Identified**: All workloads, identities, ARNs, and IP addresses clearly declared as synthetic in `docs/GRAPH_DATA_MODEL.md` and UI badges.
- [x] **Dual Deployment Options**:
  - Full Docker Compose (`docker compose up --build`) orchestrating FalkorDB, FastAPI, and Next.js.
  - Native local startup scripts for development without Docker.
- [x] **Automated Tests Executed**: All 8 backend tests in `backend/tests/` passed (`pytest` verified).
- [x] **AI-Assisted Development Disclosed**: Honest disclosure of AI development tools in `README.md` and walkthrough.
- [x] **Technical Walkthrough Complete**: Complete architectural defense written in `docs/TECHNICAL_WALKTHROUGH.md`.
- [x] **Demo Presentation Script Ready**: Timed 2.5-minute script ready for video recording in `docs/DEMO_SCRIPT.md`.
- [x] **License & Repository Config**: Apache 2.0 license, clean `.gitignore`, and `.env.example` in place.

---

## Action Items for Participant Before Final Submission

- [x] **Push to Public GitHub Repository**: Successfully created and pushed to [https://github.com/Shreyansh00987/BLASTGUARD](https://github.com/Shreyansh00987/BLASTGUARD).
- [x] **Deploy Live to Vercel**: Production deployment live at [https://blastguard-cloud.vercel.app](https://blastguard-cloud.vercel.app) (Alias: [https://blastguard-falkordb.vercel.app](https://blastguard-falkordb.vercel.app)).
- [ ] **Capture Screenshots**: Take 2-3 high-resolution screenshots of the BlastGuard UI (Active Multi-Hop Graph, Evidence Panel with Cypher, and Verification Proof Modal).
- [ ] **Record Demo Video**: Follow `docs/DEMO_SCRIPT.md` to record a 2–3 minute screen walkthrough showing the application in action.
- [ ] **Submit on WeMakeDevs Portal**:
  - Hackathon URL: `https://www.wemakedevs.org/hackathons/falkordb`
  - Track: `Track 01 — Agents That Act on Connected Data`
  - Attach Public GitHub URL (`https://github.com/Shreyansh00987/BLASTGUARD`), Live Vercel URL (`https://blastguard-cloud.vercel.app`), and Demo Video Link.
