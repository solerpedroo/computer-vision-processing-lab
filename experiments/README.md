# Scientific experiments

Reproducible CLI studies that call the same pure processing functions as the API.
Each folder contains a protocol (`README.md`), frozen parameters (`config.json`), and
`run.py` for local execution.

```bash
cd /path/to/computer-vision-processing-lab
.venv/bin/python experiments/noise-reduction/run.py
```

Results print to stdout; commit summary tables to each folder when publishing findings.

| Folder | Scope experiment |
|--------|------------------|
| [noise-reduction](noise-reduction/) | A — filters vs Gaussian and impulse noise |
| [edge-detection](edge-detection/) | B — classical edge operators |
| [frequency-filtering](frequency-filtering/) | C — spectral LPF/HPF and ringing |
