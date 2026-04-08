"""DataUpdateCoordinator for House Plant Care integration."""

from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

import aiohttp

from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.update_coordinator import (
    DataUpdateCoordinator,
    UpdateFailed,
)

from .const import CONF_API_TOKEN, DEFAULT_SCAN_INTERVAL, DOMAIN

_LOGGER = logging.getLogger(__name__)


class HousePlantCareData:
    """Container for all data fetched from the Plant Care API."""

    def __init__(self) -> None:
        self.rooms: list[dict[str, Any]] = []
        self.plants: list[dict[str, Any]] = []
        self.care_types: list[dict[str, Any]] = []
        self.care_schedules: dict[int, list[dict[str, Any]]] = {}
        self.overdue: list[dict[str, Any]] = []


class HousePlantCareCoordinator(DataUpdateCoordinator[HousePlantCareData]):
    """Coordinator to poll data from the House Plant Care API."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        url: str,
        api_token: str,
    ) -> None:
        """Initialize the coordinator."""
        self.url = url.rstrip("/")
        self.api_token = api_token
        self.entry = entry

        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=DEFAULT_SCAN_INTERVAL),
        )

    def _headers(self) -> dict[str, str]:
        """Return auth headers."""
        return {"Authorization": f"Bearer {self.api_token}"}

    async def _async_update_data(self) -> HousePlantCareData:
        """Fetch data from the API."""
        data = HousePlantCareData()

        try:
            async with aiohttp.ClientSession() as session:
                data.rooms = await self._fetch(session, "/api/rooms")
                data.plants = await self._fetch(session, "/api/plants")
                data.care_types = await self._fetch(session, "/api/care-types")
                data.overdue = await self._fetch(session, "/api/overdue")

                for plant in data.plants:
                    pid = plant["id"]
                    schedules = await self._fetch(
                        session, f"/api/care-schedules?plantId={pid}"
                    )
                    data.care_schedules[pid] = schedules
        except aiohttp.ClientError as exc:
            raise UpdateFailed(f"Error communicating with API: {exc}") from exc

        return data

    async def _fetch(
        self, session: aiohttp.ClientSession, endpoint: str
    ) -> list[dict[str, Any]]:
        """Fetch JSON data from an API endpoint."""
        url = f"{self.url}{endpoint}"
        async with session.get(url, headers=self._headers()) as resp:
            if resp.status != 200:
                raise UpdateFailed(f"API returned status {resp.status}")
            return await resp.json()

    async def async_log_care(
        self, plant_id: int, care_type_id: int, notes: str = ""
    ) -> bool:
        """Log a care activity via the API."""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.url}/api/care-logs"
                async with session.post(
                    url,
                    headers=self._headers(),
                    json={
                        "plantId": plant_id,
                        "careTypeId": care_type_id,
                        "notes": notes,
                    },
                ) as resp:
                    return resp.status == 200
        except aiohttp.ClientError:
            return False