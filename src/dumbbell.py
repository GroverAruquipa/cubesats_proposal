"""In-plane dumbbell in a circular orbit joined by a unilateral cable.

State vector ``y = [L, L_dot, phi, phi_dot]`` with

* ``L``   full separation between the centres of mass of the two halves [m],
* ``phi`` libration angle of the cable from the local vertical, in the
  orbital plane [rad].

Equations of motion (two point masses, massless cable, circular orbit,
gravity expanded to first order in L/a; e.g. Beletsky and Levin,
"Dynamics of Space Tether Systems", 1993, ch. 2):

    L''   = L * ((phi' + n)^2 - n^2 * (1 - 3 cos(phi)^2)) - T / m_eq
    phi'' = -2 * (L'/L) * (phi' + n) - 3 n^2 sin(phi) cos(phi)

with ``m_eq = m1 m2 / (m1 + m2)``. Equilibrium along the local vertical gives
``T = 3 n^2 L m_eq = 3 n^2 (L/2) m`` for equal halves.

Note on the state variable. CLAUDE.md writes these equations with ``l`` the
*half*-separation and the reduced mass ``m_eq``. That pairing is
inconsistent: the reduced-mass equation holds for the full separation, while
the half-separation obeys the same kinematics with the body mass ``m`` in
place of ``m_eq``. With ``l = L/2`` and ``m_eq`` the equilibrium tension is
``3 n^2 (L/2) m_eq = 3.596e-4 N`` at L = 100 m, half the reference
``T_gg = 7.192e-4 N``. The full separation is used here, which reproduces the
reference table.

Cable model (CLAUDE.md): unilateral,

    T = max(0, T0 + c L' + k (L - L_cmd(t)))

and every zero crossing of the inner expression is recorded.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Union

import numpy as np
from scipy.integrate import solve_ivp

from src.constants import M_EQ, N_ORBIT

LengthCommand = Union[float, Callable[[float], float]]


def gravity_gradient_tension(L, m_eq: float = M_EQ, n: float = N_ORBIT):
    """Static gravity gradient tension ``T_gg = 3 n^2 L m_eq`` along the local vertical.

    For equal halves this equals ``3 n^2 (L/2) m`` (report, eq. for T_gg).
    """
    return 3.0 * n**2 * np.asarray(L) * m_eq


def equilibrium_tension(L, phi=0.0, phi_dot=0.0, m_eq: float = M_EQ, n: float = N_ORBIT):
    """Tension that makes ``L'' = 0`` in the dumbbell radial equation.

    ``T = m_eq L ((phi' + n)^2 - n^2 (1 - 3 cos(phi)^2))``. At rest along the
    local vertical this reduces to ``3 n^2 L m_eq``.
    """
    return m_eq * L * ((phi_dot + n) ** 2 - n**2 * (1.0 - 3.0 * np.cos(phi) ** 2))


@dataclass
class CableLaw:
    """Unilateral cable law ``T = max(0, T0 + c L' + k (L - L_cmd(t)))``.

    ``T0`` [N], ``c`` [N s/m], ``k`` [N/m]; ``L_cmd`` [m] is a constant or a
    function of time. The tension is the total over all cables.
    """

    T0: float = 0.0
    c: float = 0.0
    k: float = 0.0
    L_cmd: LengthCommand = 0.0

    def command(self, t: float) -> float:
        return self.L_cmd(t) if callable(self.L_cmd) else self.L_cmd

    def raw(self, t: float, L: float, L_dot: float) -> float:
        """Inner expression before the unilateral clamp; negative means slack."""
        return self.T0 + self.c * L_dot + self.k * (L - self.command(t))

    def tension(self, t: float, L: float, L_dot: float) -> float:
        return max(0.0, self.raw(t, L, L_dot))


def rhs(t, y, law: CableLaw, m_eq: float = M_EQ, n: float = N_ORBIT, radial_only: bool = False):
    """Right-hand side of the in-plane dumbbell equations (module docstring).

    With ``radial_only=True`` the libration is frozen at ``phi = phi' = 0``,
    which reduces the radial equation to ``L'' = 3 n^2 L - T/m_eq``; this is
    the one-dimensional model behind the ``cosh`` deployment estimate.
    """
    L, L_dot, phi, phi_dot = y
    T = law.tension(t, L, L_dot)
    if radial_only:
        return [L_dot, 3.0 * n**2 * L - T / m_eq, 0.0, 0.0]
    w = phi_dot + n
    L_ddot = L * (w**2 - n**2 * (1.0 - 3.0 * np.cos(phi) ** 2)) - T / m_eq
    phi_ddot = -2.0 * (L_dot / L) * w - 3.0 * n**2 * np.sin(phi) * np.cos(phi)
    return [L_dot, L_ddot, phi_dot, phi_ddot]


@dataclass
class SimResult:
    """Output of :func:`simulate`. Arrays are sampled on ``t``."""

    t: np.ndarray
    L: np.ndarray
    L_dot: np.ndarray
    phi: np.ndarray
    phi_dot: np.ndarray
    T: np.ndarray
    T_raw: np.ndarray
    slack_times: np.ndarray  # inner expression crossing zero downwards
    retension_times: np.ndarray  # inner expression crossing zero upwards
    t_stop: float | None  # time the stop length was reached, if any
    status: str = ""
    extra: dict = field(default_factory=dict)

    @property
    def slack_count(self) -> int:
        return int(self.slack_times.size)


def simulate(
    t_span,
    y0,
    law: CableLaw,
    m_eq: float = M_EQ,
    n: float = N_ORBIT,
    radial_only: bool = False,
    L_stop: float | None = None,
    L_min: float = 1e-3,
    t_eval=None,
    max_step: float = 5.0,
    rtol: float = 1e-10,
    atol: float = 1e-12,
) -> SimResult:
    """Integrate the dumbbell with ``scipy.integrate.solve_ivp`` (DOP853).

    Events: zero crossings of the cable law inner expression (non-terminal,
    logged as slack or re-tension), ``L = L_stop`` reached upwards
    (terminal, optional), and ``L = L_min`` reached downwards (terminal,
    collision guard).
    """

    def ev_slack(t, y, *_):
        return law.raw(t, y[0], y[1])

    ev_slack.direction = -1

    def ev_retension(t, y, *_):
        return law.raw(t, y[0], y[1])

    ev_retension.direction = 1

    events = [ev_slack, ev_retension]

    def ev_collision(t, y, *_):
        return y[0] - L_min

    ev_collision.terminal = True
    ev_collision.direction = -1
    events.append(ev_collision)

    if L_stop is not None:

        def ev_stop(t, y, *_):
            return y[0] - L_stop

        ev_stop.terminal = True
        ev_stop.direction = 1
        events.append(ev_stop)

    sol = solve_ivp(
        rhs,
        t_span,
        y0,
        method="DOP853",
        args=(law, m_eq, n, radial_only),
        events=events,
        t_eval=t_eval,
        dense_output=True,
        max_step=max_step,
        rtol=rtol,
        atol=atol,
    )
    if not sol.success:
        raise RuntimeError(sol.message)

    t = sol.t
    Y = sol.y
    T_raw = np.array([law.raw(ti, Li, Ldi) for ti, Li, Ldi in zip(t, Y[0], Y[1])])
    T = np.maximum(0.0, T_raw)

    t_stop = None
    if L_stop is not None and sol.t_events[3].size:
        t_stop = float(sol.t_events[3][0])
    status = "collision" if sol.t_events[2].size else ("stopped" if t_stop is not None else "end")

    return SimResult(
        t=t,
        L=Y[0],
        L_dot=Y[1],
        phi=Y[2],
        phi_dot=Y[3],
        T=T,
        T_raw=T_raw,
        slack_times=sol.t_events[0],
        retension_times=sol.t_events[1],
        t_stop=t_stop,
        status=status,
        extra={"sol": sol},
    )
