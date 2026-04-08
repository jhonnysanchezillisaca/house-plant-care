"""Config flow for House Plant Care integration."""

from __future__ import annotations

import logging
from typing import Any

import aiohttp
import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import CONF_URL
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.exceptions import HomeAssistantError

from .const import CONF_API_TOKEN, DOMAIN

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_URL): str,
        vol.Required(CONF_API_TOKEN): str,
    }
)


async def validate_input(hass: HomeAssistant, data: dict[str, Any]) -> dict[str, str]:
    """Validate the user input allows us to connect."""
    url = data[CONF_URL].rstrip("/")
    api_token = data[CONF_API_TOKEN]

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{url}/api/rooms",
                headers={"Authorization": f"Bearer {api_token}"},
            ) as resp:
                if resp.status != 200:
                    raise InvalidAuth
                await resp.json()
    except aiohttp.ClientError as exc:
        raise CannotConnect from exc

    return {
        "title": f"Plant Care ({url})",
        "url": url,
    }


class HousePlantCareConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for House Plant Care."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            try:
                info = await validate_input(self.hass, user_input)
            except CannotConnect:
                errors["base"] = "cannot_connect"
            except InvalidAuth:
                errors["base"] = "invalid_auth"
            except Exception:
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"
            else:
                return self.async_create_entry(
                    title=info["title"],
                    data={
                        CONF_URL: user_input[CONF_URL].rstrip("/"),
                        CONF_API_TOKEN: user_input[CONF_API_TOKEN],
                    },
                )

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_USER_DATA_SCHEMA,
            errors=errors,
            description_placeholders={},
        )


class CannotConnect(HomeAssistantError):
    """Error to indicate we cannot connect."""


class InvalidAuth(HomeAssistantError):
    """Error to indicate there is invalid auth."""