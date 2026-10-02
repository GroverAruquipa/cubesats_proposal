# cubesats_proposal

Simulation support for the CUBICS 2026 Stream 1 tethered 6U CubeSat proposal.
See `CLAUDE.md` for the brief, parameters and reference values.

```
pip install -r requirements.txt     # or open in the devcontainer
python -m pytest -q
```

## Status of the reference table

`tests/test_reference.py` checks every value of the CLAUDE.md table at a
relative tolerance of 1e-3. Four tests currently fail. These are discrepancies
in the table, not model bugs, and need a decision before the case scripts are
written:

| Test | Model | Table | Rel. error | Cause |
|---|---|---|---|---|
| `test_H_required` | 16.029 N m s | 16.0 | 1.8e-3 | table rounded to 3 s.f. |
| `test_drag_differential` | 1.906e-7 N | 1.91e-7 | 2.1e-3 | table rounded up |
| `test_deploy_time_inplane_model` | 76 757 s (13.4 orbits) | 3643 s | 20x | `cosh` law ignores Coriolis coupling to libration |
| `test_v_sep_final_inplane_model` | 2.2e-3 m/s | 0.1896 m/s | 0.99 | same; cable arrives at phi = -89 deg |

The deployment values (3643 s, 0.1896 m/s, 3.596e-2 J) are reproduced exactly
by the radial-only reduction (`simulate(..., radial_only=True)`), which freezes
phi at 0.

The model uses the full separation `L` with `m_eq`. CLAUDE.md pairs the
half-separation `l` with `m_eq`. That pairing gives an equilibrium tension of
3.596e-4 N at 100 m, half of `T_gg`.

## Interactive simulator

`interactive/simulador.html` is a standalone page (open it in a browser) with
five scenes: deployment with free libration against the radial model,
inertial view of the spin cost, the thermal transient at the terminator with
and without winch compensation, and the tension distribution among three
cables, and what the two nadir cameras see (the upper camera images the lower half). It ports `src/dumbbell.py` to JavaScript (fixed-step RK4) for
exploration only. Figures for the report still come from `cases/`.

`interactive/concepto_camaras.html` is a 3D walkthrough for presenting the
imaging concept: separation, vertical alignment, camera placement and
pointing (both nadir, adjacent strips, fore/aft stereo), live camera views
and the stereo pair. Schematic scale; camera tilt angles are the design
values. Needs an internet connection (loads three.js from a CDN).

`interactive/mecanismo.html` simulates a full mechanism cycle in the
in-plane dumbbell model: spring separation, winch braking and exponential
deployment, hold with libration damping by length modulation, retrieval
and magnetic docking. It shows that retrieval is unstable without
libration control (cable tumbles at 36 m) or when too fast (lambda = 0.4 n).
