"""Numerical BCS gap-equation utilities.

The model assumes:
- a constant pairing interaction ``V``
- a sharp Debye cutoff ``omega_D``
- dimensionless units with ``k_B = 1`` and constant DOS normalized to 1

The superconducting gap solves

    1 = V * integral_0^omega_D dxi * tanh(E / (2 T)) / E

with quasiparticle energy ``E = sqrt(xi^2 + Delta^2)``.
"""

from __future__ import annotations

import math
from typing import Tuple

import numpy as np

EPSILON = 1e-12
DEFAULT_INTEGRATION_POINTS = 2048
MAX_BISECTION_STEPS = 96


def _validate_inputs(V: float, omega_D: float, T: float) -> Tuple[float, float, float]:
    V = float(V)
    omega_D = float(omega_D)
    T = float(T)

    if V <= 0.0:
        raise ValueError("V must be positive.")
    if omega_D <= 0.0:
        raise ValueError("omega_D must be positive.")
    if T < 0.0:
        raise ValueError("T cannot be negative.")

    return V, omega_D, T


def _quadratic_grid(points: int) -> Tuple[np.ndarray, np.ndarray]:
    u = np.linspace(0.0, 1.0, points)
    return u, u * u


def _gap_integral(
    delta: float,
    omega_D: float,
    temperature: float,
    points: int = DEFAULT_INTEGRATION_POINTS,
) -> float:
    """Evaluate the BCS energy integral on a grid clustered near xi = 0."""

    u, u_squared = _quadratic_grid(points)
    xi = omega_D * u_squared
    quasiparticle_energy = np.sqrt(xi * xi + delta * delta)

    if temperature <= EPSILON:
        kernel = 1.0 / quasiparticle_energy
    else:
        kernel = np.divide(
            np.tanh(quasiparticle_energy / (2.0 * temperature)),
            quasiparticle_energy,
            out=np.zeros_like(quasiparticle_energy),
            where=quasiparticle_energy > EPSILON,
        )
        if delta <= EPSILON:
            kernel[0] = 1.0 / (2.0 * temperature)

    transformed_integrand = kernel * (2.0 * omega_D * u)
    return float(np.trapz(transformed_integrand, u))


def _gap_residual(
    delta: float,
    V: float,
    omega_D: float,
    temperature: float,
    points: int = DEFAULT_INTEGRATION_POINTS,
) -> float:
    return V * _gap_integral(delta, omega_D, temperature, points=points) - 1.0


def _critical_temperature_residual(
    temperature: float,
    V: float,
    omega_D: float,
    points: int = DEFAULT_INTEGRATION_POINTS,
) -> float:
    safe_temperature = max(float(temperature), EPSILON)
    return _gap_residual(0.0, V, omega_D, safe_temperature, points=points)


def _find_gap_bracket(
    V: float,
    omega_D: float,
    temperature: float,
    points: int = DEFAULT_INTEGRATION_POINTS,
) -> Tuple[float, float]:
    scale = max(omega_D, 1.0)
    weak_coupling_guess = 2.0 * omega_D * math.exp(-1.0 / V)
    lower = max(weak_coupling_guess * 1e-4, scale * 1e-12)
    upper = max(weak_coupling_guess * 4.0, omega_D * 0.5, lower * 8.0)

    lower_residual = _gap_residual(lower, V, omega_D, temperature, points=points)
    if lower_residual <= 0.0:
        return 0.0, 0.0

    upper_residual = _gap_residual(upper, V, omega_D, temperature, points=points)
    attempts = 0
    while upper_residual > 0.0 and attempts < 24:
        upper *= 2.0
        upper_residual = _gap_residual(upper, V, omega_D, temperature, points=points)
        attempts += 1

    if upper_residual > 0.0:
        raise RuntimeError("Failed to bracket the superconducting gap.")

    return lower, upper


def compute_gap(
    V: float,
    omega_D: float,
    T: float,
    points: int = DEFAULT_INTEGRATION_POINTS,
) -> float:
    """Solve the BCS gap equation for a given temperature.

    The return value is the positive superconducting gap ``Delta``. If the
    temperature is above the critical temperature, the function returns ``0.0``.
    """

    V, omega_D, T = _validate_inputs(V, omega_D, T)

    lower, upper = _find_gap_bracket(V, omega_D, T, points=points)
    if lower == 0.0 and upper == 0.0:
        return 0.0

    scale = max(omega_D, 1.0)
    low = lower
    high = upper

    for _ in range(MAX_BISECTION_STEPS):
        mid = 0.5 * (low + high)
        residual = _gap_residual(mid, V, omega_D, T, points=points)

        if residual > 0.0:
            low = mid
        else:
            high = mid

        if (high - low) <= 1e-8 * scale:
            break

    return 0.5 * (low + high)


def compute_critical_temperature(
    V: float,
    omega_D: float,
    points: int = DEFAULT_INTEGRATION_POINTS,
) -> float:
    """Solve the linearized BCS gap equation for Tc."""

    V, omega_D, _ = _validate_inputs(V, omega_D, 0.0)

    scale = max(omega_D, 1.0)
    lower = scale * 1e-8
    upper = max(omega_D, 1.0)

    lower_residual = _critical_temperature_residual(lower, V, omega_D, points=points)
    if lower_residual <= 0.0:
        return 0.0

    upper_residual = _critical_temperature_residual(upper, V, omega_D, points=points)
    attempts = 0
    while upper_residual > 0.0 and attempts < 24:
        upper *= 2.0
        upper_residual = _critical_temperature_residual(upper, V, omega_D, points=points)
        attempts += 1

    if upper_residual > 0.0:
        raise RuntimeError("Failed to bracket the critical temperature.")

    low = lower
    high = upper
    for _ in range(MAX_BISECTION_STEPS):
        mid = 0.5 * (low + high)
        residual = _critical_temperature_residual(mid, V, omega_D, points=points)
        if residual > 0.0:
            low = mid
        else:
            high = mid

        if (high - low) <= 1e-8 * scale:
            break

    return 0.5 * (low + high)


def compute_gap_curve(
    V: float,
    omega_D: float,
    max_temperature: float | None = None,
    num_points: int = 64,
    integration_points: int = DEFAULT_INTEGRATION_POINTS,
) -> Tuple[np.ndarray, np.ndarray, float]:
    """Evaluate Delta(T) across a temperature sweep."""

    V, omega_D, _ = _validate_inputs(V, omega_D, 0.0)
    if num_points < 2:
        raise ValueError("num_points must be at least 2.")

    critical_temperature = compute_critical_temperature(V, omega_D, points=integration_points)

    if max_temperature is None:
        max_temperature = max(1.25 * critical_temperature, 0.1 * omega_D)
    elif max_temperature < 0.0:
        raise ValueError("max_temperature cannot be negative.")

    temperatures = np.linspace(0.0, float(max_temperature), int(num_points))
    gaps = np.array(
        [
            compute_gap(V, omega_D, float(temperature), points=integration_points)
            for temperature in temperatures
        ],
        dtype=float,
    )

    return temperatures, gaps, critical_temperature
