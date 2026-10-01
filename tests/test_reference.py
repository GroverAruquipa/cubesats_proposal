"""Regression tests against the validated reference table of CLAUDE.md.

Every value is checked to a relative tolerance of 1e-3. A failure means
either a bug in src/ or an error in the table; the tolerance is not to be
relaxed to make a test pass.
"""

import math

import numpy as np
import pytest

from src import constants as C
from src.dumbbell import (
    CableLaw,
    equilibrium_tension,
    gravity_gradient_tension,
    rhs,
    simulate,
)

RTOL = 1e-3


def check(value, reference):
    assert value == pytest.approx(reference, rel=RTOL), (
        f"model {value:.6g} vs reference {reference:.6g}, "
        f"relative error {abs(value - reference) / abs(reference):.3e}"
    )


# --- Orbit -------------------------------------------------------------------


def test_mean_motion():
    check(C.N_ORBIT, 1.094824e-3)


def test_mean_motion_squared():
    check(C.N_ORBIT**2, 1.198639e-6)


def test_orbital_period_s():
    check(C.PERIOD, 5739.0)


def test_orbital_period_min():
    check(C.PERIOD / 60.0, 95.6)


# --- Equilibrium and gravity gradient tension -------------------------------


@pytest.mark.parametrize("L", [0.2, 20.0, 100.0])
def test_equilibrium_along_local_vertical(L):
    """At rest on the local vertical the model tension equals 3 n^2 L m_eq."""
    T = equilibrium_tension(L, phi=0.0, phi_dot=0.0)
    check(T, 3.0 * C.N_ORBIT**2 * L * C.M_EQ)
    # and that tension indeed cancels both accelerations in the dynamics
    law = CableLaw(T0=T)
    _, L_ddot, _, phi_ddot = rhs(0.0, [L, 0.0, 0.0, 0.0], law)
    assert abs(L_ddot) < 1e-12 * C.N_ORBIT**2 * L
    assert phi_ddot == 0.0


def test_tension_gg_100():
    check(gravity_gradient_tension(100.0), 7.192e-4)
    check(equilibrium_tension(100.0), 7.192e-4)


def test_tension_gg_20():
    check(gravity_gradient_tension(20.0), 1.438e-4)


# --- Rotation ----------------------------------------------------------------


def test_omega_eq():
    check(math.sqrt(3.0) * C.N_ORBIT, 1.8963e-3)


def test_H_required():
    """Angular momentum to spin at omega_eq, the orbital rate subtracted.

    I = 2 m (L/2)^2 = m L^2 / 2 about the centre of mass.
    """
    inertia = C.M * C.L_NOM**2 / 2.0
    check(inertia * (math.sqrt(3.0) - 1.0) * C.N_ORBIT, 16.0)


# --- Cable -------------------------------------------------------------------


def test_cable_axial_rigidity():
    check(C.EA, 3141.6)


def test_cable_stiffness_100():
    check(C.EA / C.L_NOM, 31.42)


def test_cable_linear_mass():
    check(C.MU_LIN, 4.398e-5)


def test_f1_transverse():
    T = gravity_gradient_tension(C.L_NOM)
    check(math.sqrt(T / C.MU_LIN) / (2.0 * C.L_NOM), 2.02e-2)


def test_M_max():
    check(gravity_gradient_tension(C.L_NOM) * C.D_ARM, 5.08e-5)


# --- Deployment under gravity gradient alone --------------------------------

DEPLOY_Y0 = [0.2, 0.0, 0.0, 0.0]  # 0.1 m half-separation, at rest, local vertical


def test_deploy_time_closed_form():
    """t = acosh(L_f/L_0) / (sqrt(3) n), radial motion only."""
    check(math.acosh(100.0 / 0.2) / (math.sqrt(3.0) * C.N_ORBIT), 3643.0)


def test_deploy_time_radial_only_model():
    r = simulate((0.0, 2e4), DEPLOY_Y0, CableLaw(), radial_only=True, L_stop=100.0)
    check(r.t_stop, 3643.0)
    check(r.L_dot[-1], 0.1896)
    check(0.5 * C.M_EQ * r.L_dot[-1] ** 2, 3.596e-2)


def test_deploy_time_inplane_model():
    """Same deployment with libration free, as the CLAUDE.md model specifies."""
    r = simulate((0.0, 2e6), DEPLOY_Y0, CableLaw(), L_stop=100.0, max_step=50.0)
    check(r.t_stop, 3643.0)


def test_v_sep_final_inplane_model():
    r = simulate((0.0, 2e6), DEPLOY_Y0, CableLaw(), L_stop=100.0, max_step=50.0)
    check(r.L_dot[-1], 0.1896)


# --- Imaging and environment -------------------------------------------------


def test_sigma_h():
    check(C.SIGMA_H_RANGE / C.L_NOM * C.SIGMA_D, 2750.0)


def test_drag_differential():
    check(0.5 * C.RHO_ATM * C.V_DRAG**2 * C.C_D * C.DELTA_A_DRAG, 1.91e-7)


# --- Cable model -------------------------------------------------------------


def test_cable_is_unilateral():
    law = CableLaw(T0=-1.0)
    assert law.tension(0.0, 1.0, 0.0) == 0.0
    assert law.raw(0.0, 1.0, 0.0) == -1.0


def test_slack_events_are_logged():
    """A law that goes negative halfway must log exactly one slack event."""
    T_eq = gravity_gradient_tension(10.0)
    law = CableLaw(T0=T_eq, k=-T_eq / 10.0)  # raw = T_eq (1 - L/10), zero at L = 10 m
    r = simulate((0.0, 2e4), [9.9, 0.05, 0.0, 0.0], law, radial_only=True, L_stop=12.0)
    assert r.slack_count == 1
    assert np.all(r.T >= 0.0)
