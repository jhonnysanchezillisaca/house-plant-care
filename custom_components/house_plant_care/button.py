"""Button platform for House Plant Care integration."""

from __future__ import annotations

import logging

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from . import HousePlantCareCoordinator
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up buttons from a config entry."""
    coordinator: HousePlantCareCoordinator = hass.data[DOMAIN][entry.entry_id]

    buttons: list[ButtonEntity] = []

    for plant in coordinator.data.plants:
        plant_id = plant["id"]
        plant_name = plant["name"]

        schedules = coordinator.data.care_schedules.get(plant_id, [])
        for schedule in schedules:
            ct_id = schedule["careTypeId"]
            ct_name = schedule.get("careTypeName", _care_type_name(coordinator, ct_id))
            buttons.append(
                LogCareButton(
                    coordinator,
                    entry,
                    plant_id,
                    plant_name,
                    ct_id,
                    ct_name,
                )
            )

    async_add_entities(buttons)


def _care_type_name(coordinator: HousePlantCareCoordinator, ct_id: int) -> str:
    for ct in coordinator.data.care_types:
        if ct["id"] == ct_id:
            return ct["name"]
    return str(ct_id)


CARE_ICONS = {
    "water": "mdi:water",
    "fertilizer": "mdi:flask",
    "mist": "mdi:weather-fog",
    "prune": "mdi:content-cut",
    "repot": "mdi:flower",
    "check": "mdi:eye",
    "rotate": "mdi:rotate-right",
    "clean_leaves": "mdi:sparkles",
    "propagate": "mdi:sprout",
}


class LogCareButton(CoordinatorEntity, ButtonEntity):
    """Button to log a care activity for a plant."""

    def __init__(
        self,
        coordinator: HousePlantCareCoordinator,
        entry: ConfigEntry,
        plant_id: int,
        plant_name: str,
        care_type_id: int,
        care_type_name: str,
    ) -> None:
        super().__init__(coordinator)
        self._plant_id = plant_id
        self._plant_name = plant_name
        self._care_type_id = care_type_id
        self._care_type_name = care_type_name

        self._attr_unique_id = f"{entry.entry_id}_{plant_id}_{care_type_id}_log"
        self._attr_name = f"Log {care_type_name} for {plant_name}"
        self._attr_icon = CARE_ICONS.get(care_type_name, "mdi:leaf")

    async def async_press(self) -> None:
        """Handle the button press — log the care activity."""
        success = await self.coordinator.async_log_care(
            self._plant_id, self._care_type_id
        )
        if success:
            _LOGGER.info(
                "Logged %s for %s", self._care_type_name, self._plant_name
            )
            await self.coordinator.async_request_refresh()
        else:
            _LOGGER.error(
                "Failed to log %s for %s",
                self._care_type_name,
                self._plant_name,
            )