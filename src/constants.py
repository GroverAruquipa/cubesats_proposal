"""Reference parameters of the tethered 6U CubeSat study.

Single source of every numerical constant used in src/, cases/ and tests/.
SI units throughout. Primary parameters come from the reference table in
CLAUDE.md; auxiliary parameters come from the feasibility report
(report/feasibility.tex). Derived quantities are computed here, never retyped.
"""

import math

# --- Orbit -----------------------------------------------------------------
MU = 3.986004418e14  # m^3/s^2, Earth standard gravitational parameter (CLAUDE.md, WGS-84)
RE = 6378.137e3  # m, Earth equatorial radius (CLAUDE.md, WGS-84)
H = 550e3  # m, nominal circular orbit altitude (CLAUDE.md)

# --- Spacecraft --------------------------------------------------------------
M = 4.0  # kg, mass of each 3U half (CLAUDE.md; CUBICS limit is 6 kg at 2 kg/U)
M1 = M  # kg, mass of half 1 (CLAUDE.md, equal halves)
M2 = M  # kg, mass of half 2 (CLAUDE.md, equal halves)
L_NOM = 100.0  # m, nominal full separation between the two halves (CLAUDE.md)

# --- Cable -------------------------------------------------------------------
D_C = 0.2e-3  # m, cable diameter (CLAUDE.md)
E_C = 100e9  # Pa, cable Young modulus (CLAUDE.md)
RHO_C = 1400.0  # kg/m^3, cable density (CLAUDE.md)
N_C = 3  # -, number of cables between the two halves (CLAUDE.md)
D_ARM = 0.0707  # m, max anchor offset on a 10 cm face, 0.1/sqrt(2) (CLAUDE.md)

# --- Environment and imaging (report/feasibility.tex) ------------------------
RHO_ATM = 1e-13  # kg/m^3, thermospheric density at 550 km (report, sec. 4.5)
C_D = 2.2  # -, drag coefficient (report, sec. 4.5)
V_DRAG = 7.6e3  # m/s, rounded orbital speed used in the drag estimate (report, sec. 4.5)
DELTA_A_DRAG = 0.03  # m^2, frontal area difference between halves (report, sec. 4.5)
SIGMA_D = 0.5  # m, image matching error, 0.1 px at 5 m GSD (report, sec. 11.1)
SIGMA_H_RANGE = H  # m, slant range used in the stereo estimate (report, sec. 11.1)

# --- Derived -----------------------------------------------------------------
A_ORBIT = RE + H  # m, orbit radius
N_ORBIT = math.sqrt(MU / A_ORBIT**3)  # rad/s, mean motion n = sqrt(mu/a^3)
PERIOD = 2.0 * math.pi / N_ORBIT  # s, orbital period
M_EQ = M1 * M2 / (M1 + M2)  # kg, reduced mass of the two halves
A_CABLE = math.pi * D_C**2 / 4.0  # m^2, cable cross section
EA = E_C * A_CABLE  # N, cable axial rigidity
MU_LIN = RHO_C * A_CABLE  # kg/m, cable linear mass
