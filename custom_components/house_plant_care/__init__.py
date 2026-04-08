"""The House Plant Care integration."""

from __future__ import annotations

import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
import homeassistant.helpers.config_validation as cv

from .const import CONF_API_TOKEN, DOMAIN
from .coordinator import HousePlantCareCoordinator

PLATFORMS = [Platform.SENSOR, Platform.BUTTON]

SERVICE_LOG_CARE = "log_care"

LOG_CARE_SCHEMA = vol.Schema(
    {
        vol.Required("plant_id"): cv.positive_int,
        vol.Required("care_type_id"): cv.positive_int,
        vol.Optional("notes"): cv.string,
    }
)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up House Plant Care from a config entry."""
    url: str = entry.data["url"]
    api_token: str = entry.data[CONF_API_TOKEN]

    coordinator = HousePlantCareCoordinator(hass, entry, url, api_token)
    await coordinator.async_config_entry_first_refresh()

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    async def async_log_care(service: ServiceCall) -> None:
        """Handle the log_care service call."""
        plant_id = service.data["plant_id"]
        care_type_id = service.data["care_type_id"]
        notes = service.data.get("notes", "")

        first_coordinator = next(iter(hass.data[DOMAIN].values()))
        await first_coordinator.async_log_care(plant_id, care_type_id, notes)
        await first_coordinator.async_request_refresh()

    hass.services.async_register(
        DOMAIN, SERVICE_LOG_CARE, async_log_care, schema=LOG_CARE_SCHEMA
    )

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok