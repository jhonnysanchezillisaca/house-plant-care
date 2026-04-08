"""Sensor platform for House Plant Care integration."""

from __future__ import annotations

import logging
from datetime import datetime, date, timedelta, timezone

from homeassistant.components.sensor import SensorEntity, SensorEntityDescription
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_NAME, ATTR_UNIT_OF_MEASUREMENT
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
    """Set up sensors from a config entry."""
    coordinator: HousePlantCareCoordinator = hass.data[DOMAIN][entry.entry_id]

    sensors: list[SensorEntity] = []

    for plant in coordinator.data.plants:
        plant_id = plant["id"]
        plant_name = plant["name"]
        room_name = _get_room_name(coordinator, plant.get("roomId"))

        for item in coordinator.data.overdue:
            if item["plantId"] == plant_id:
                sensors.append(
                    PlantOverdueSensor(
                        coordinator,
                        entry,
                        plant_id,
                        plant_name,
                        room_name,
                        item["careTypeId"],
                        item["careTypeName"],
                        item["careTypeIcon"],
                        item["daysOverdue"],
                        item["frequencyDays"],
                        item.get("lastPerformedAt"),
                    )
                )

        schedules = coordinator.data.care_schedules.get(plant_id, [])
        seen_care_types = {
            s["careTypeId"] for s in schedules
        }

        for schedule in schedules:
            ct_id = schedule["careTypeId"]
            ct_name = schedule.get("careTypeName", _care_type_name(coordinator, ct_id))
            sensors.append(
                PlantLastCareSensor(
                    coordinator,
                    entry,
                    plant_id,
                    plant_name,
                    room_name,
                    ct_id,
                    ct_name,
                )
            )
            sensors.append(
                PlantNextDueSensor(
                    coordinator,
                    entry,
                    plant_id,
                    plant_name,
                    room_name,
                    ct_id,
                    ct_name,
                    schedule["frequencyDays"],
                )
            )

    async_add_entities(sensors)


def _get_room_name(coordinator: HousePlantCareCoordinator, room_id: int | None) -> str:
    """Look up room name by ID."""
    if room_id is None:
        return "Unknown"
    for room in coordinator.data.rooms:
        if room["id"] == room_id:
            return room["name"]
    return "Unknown"


def _care_type_name(coordinator: HousePlantCareCoordinator, ct_id: int) -> str:
    """Look up care type name by ID."""
    for ct in coordinator.data.care_types:
        if ct["id"] == ct_id:
            return ct["name"]
    return str(ct_id)


class PlantOverdueSensor(CoordinatorEntity, SensorEntity):
    """Sensor showing how many days a care task is overdue."""

    _attr_icon = "mdi:alert-circle"

    def __init__(
        self,
        coordinator: HousePlantCareCoordinator,
        entry: ConfigEntry,
        plant_id: int,
        plant_name: str,
        room_name: str,
        care_type_id: int,
        care_type_name: str,
        care_type_icon: str,
        days_overdue: int,
        frequency_days: int,
        last_performed: str | None,
    ) -> None:
        super().__init__(coordinator)
        self._plant_id = plant_id
        self._plant_name = plant_name
        self._room_name = room_name
        self._care_type_id = care_type_id
        self._care_type_name = care_type_name
        self._care_type_icon = care_type_icon
        self._initial_days_overdue = days_overdue
        self._frequency_days = frequency_days
        self._last_performed = last_performed

        slug = plant_name.lower().replace(" ", "_").replace("-", "_")
        ct_slug = care_type_name.lower().replace(" ", "_")
        self._attr_unique_id = f"{entry.entry_id}_{plant_id}_{care_type_id}_overdue"
        self._attr_name = f"{plant_name} {care_type_name} overdue"
        self._attr_native_unit_of_measurement = "days"
        self._attr_extra_state_attributes = {
            "plant": plant_name,
            "room": room_name,
            "care_type": care_type_name,
            "frequency_days": frequency_days,
            "last_performed": last_performed,
        }

    @property
    def native_value(self) -> int:
        """Return the number of days overdue."""
        for item in self.coordinator.data.overdue:
            if item["plantId"] == self._plant_id and item["careTypeId"] == self._care_type_id:
                return item["daysOverdue"]
        return 0


class PlantLastCareSensor(CoordinatorEntity, SensorEntity):
    """Sensor showing the date of the last care activity."""

    def __init__(
        self,
        coordinator: HousePlantCareCoordinator,
        entry: ConfigEntry,
        plant_id: int,
        plant_name: str,
        room_name: str,
        care_type_id: int,
        care_type_name: str,
    ) -> None:
        super().__init__(coordinator)
        self._plant_id = plant_id
        self._plant_name = plant_name
        self._room_name = room_name
        self._care_type_id = care_type_id
        self._care_type_name = care_type_name

        self._attr_unique_id = f"{entry.entry_id}_{plant_id}_{care_type_id}_last_care"
        self._attr_name = f"{plant_name} {care_type_name} last performed"
        self._attr_device_class = "timestamp"
        self._attr_extra_state_attributes = {
            "plant": plant_name,
            "room": room_name,
            "care_type": care_type_name,
        }

    @property
    def native_value(self) -> str | None:
        """Return the last performed date for this care type."""
        for item in self.coordinator.data.overdue:
            if item["plantId"] == self._plant_id and item["careTypeId"] == self._care_type_id:
                return item.get("lastPerformedAt")
        return None


class PlantNextDueSensor(CoordinatorEntity, SensorEntity):
    """Sensor showing the next due date for a care task."""

    def __init__(
        self,
        coordinator: HousePlantCareCoordinator,
        entry: ConfigEntry,
        plant_id: int,
        plant_name: str,
        room_name: str,
        care_type_id: int,
        care_type_name: str,
        frequency_days: int,
    ) -> None:
        super().__init__(coordinator)
        self._plant_id = plant_id
        self._plant_name = plant_name
        self._room_name = room_name
        self._care_type_id = care_type_id
        self._care_type_name = care_type_name
        self._frequency_days = frequency_days

        self._attr_unique_id = f"{entry.entry_id}_{plant_id}_{care_type_id}_next_due"
        self._attr_name = f"{plant_name} {care_type_name} next due"
        self._attr_device_class = "timestamp"
        self._attr_extra_state_attributes = {
            "plant": plant_name,
            "room": room_name,
            "care_type": care_type_name,
            "frequency_days": frequency_days,
        }

    @property
    def native_value(self) -> str | None:
        """Return the next due date."""
        last_performed: str | None = None
        for item in self.coordinator.data.overdue:
            if item["plantId"] == self._plant_id and item["careTypeId"] == self._care_type_id:
                last_performed = item.get("lastPerformedAt")
                break

        if last_performed:
            last_dt = datetime.fromisoformat(last_performed)
            next_dt = last_dt + timedelta(days=self._frequency_days)
            return next_dt.isoformat()
        else:
            return (datetime.now(timezone.utc)).isoformat()