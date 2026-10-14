# Demo video storyboard (30–90 s)

Portfolio clip showing the MVP end-to-end. Record in English UI.

| Time | Visual | Narration (suggested) |
|------|--------|------------------------|
| 0–10 s | Home, **Process** tab, drag-drop sample image | "This lab runs classical CV algorithms through a registry-backed API." |
| 10–25 s | Select **Gaussian blur**, adjust kernel, **Apply**; show timing row | "Parameters come from the server registry; processing time is measured separately from network latency." |
| 25–40 s | Open histogram drawer (optional color op) or switch to **Compare** | "You can compare two filters on the same upload." |
| 40–55 s | Run comparison; metrics table vs original | "PSNR, SSIM, and MSE quantify differences against the reference image." |
| 55–70 s | **Export experiment bundle**; flash JSON/CSV downloads | "Experiments export as JSON, CSV, and PNG for reproducibility." |
| 70–90 s | Terminal: `python experiments/noise-reduction/run.py` snippet | "CLI studies reuse the same processing code as the API." |

**B-roll:** FFT spectrum view, edge detector binary output, morphology connected-component count.

**Outro:** Repository URL + live demo links from README.
