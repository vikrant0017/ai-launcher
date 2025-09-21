# Simple settings module/subsystem interface for the entire application.
# Loads settings stored in config file (like API_KEYS, list of watch directories)
# Initializes platform specifics (eg, paths)
# Any module in the app should be able to import and query configs
# Note: AppConfig doesn't resolve or validate if path is true

import json
import os
from copy import deepcopy
from pathlib import Path
from typing import ClassVar, Self

from platformdirs import PlatformDirs


class AppConfig:
    _instance: ClassVar[Self | None] = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(
        self,
        data_dir: str,
        config_dir: str,
        watch_dir: str | None,
        gemini_api_key: str | None,
    ) -> None:
        self.data_dir = data_dir
        self.config_dir = config_dir
        self.watch_dir = watch_dir
        self.gemini_api_key = gemini_api_key

    @classmethod
    def from_json(cls, filepath: Path) -> Self:
        """Create a instance of app config from a JSON file"""
        json_str = filepath.read_text(encoding="utf-8")
        json_obj = json.loads(json_str)
        return cls(
            data_dir=json_obj["data_dir"],
            config_dir=json_obj["config_dir"],
            watch_dir=json_obj.get("watch_dir", None),
            gemini_api_key=json_obj.get("gemini_api_key", None),
        )

    def to_json(self, filepath: Path):
        serializable_str = self.asdict()
        json_str = json.dumps(serializable_str, indent=4)
        filepath.write_text(json_str, encoding="utf-8")

    def asdict(self):
        return deepcopy(self.__dict__)

    def update_fields(self, obj: dict):
        """Update multiple attributes at once based on the argument dict key/values"""
        for key, value in obj.items():
            if key in self.__dict__:
                self.__setattr__(key, value)
            else:
                print(f"Attribute '{key}' not found")

    def write(self):
        """Write the current state of the config to the file"""
        config_file = Path(self.config_dir) / "config.json"
        self.to_json(config_file)

    def __repr__(self) -> str:
        return (
            self.__class__.__name__
            + f"({', '.join([f'{key}={repr(value)}' for key, value in self.__dict__.items()])})"
        )


def load_app_config():
    if os.getenv("PYTHON_ENV") == "production":
        APP_NAME = "ai-launcher"
        dirs = PlatformDirs(APP_NAME)
        config_dir = Path(dirs.user_config_dir)
        data_dir = Path(dirs.user_data_dir)
        config_filepath = config_dir / "config.json"

        if config_filepath.exists():
            print("config exists")
            return AppConfig.from_json(config_filepath)

        config_dir = config_filepath.parent
        config_dir.mkdir(parents=True, exist_ok=True)

        default_config = AppConfig(
            data_dir=str(data_dir),
            config_dir=str(config_dir),
            watch_dir=None,  # User will set in production
            gemini_api_key=None,
        )

        default_config.to_json(config_filepath)
        return default_config
    else:
        script_path = Path(__file__)
        project_dir = script_path.parent.parent

        config_filepath = project_dir / "dev_fs" / "config_dir" / "config.json"
        if config_filepath.exists():
            print("config exists")
            return AppConfig.from_json(config_filepath)

        config_dirpath = config_filepath.parent
        config_dirpath.mkdir(parents=True, exist_ok=True)

        config_dir = config_dirpath
        data_dir = project_dir / "dev_fs" / "data_dir"
        watch_dir = project_dir / "dev_fs" / "watch_dir"

        default_config = AppConfig(
            data_dir=str(data_dir),
            config_dir=str(config_dir),
            watch_dir=str(watch_dir),
            gemini_api_key=None,
        )

        default_config.to_json(config_filepath)
        return default_config
