from pathlib import Path

from platformdirs import PlatformDirs
from pytest import MonkeyPatch

from config.app_config import AppConfig, load_app_config


def test_singleton_behaviour():
    app_config_1 = AppConfig("1", "2", "3", "4")
    app_config_2 = AppConfig("a", "b", "c", "d")

    # Same instance
    assert id(app_config_1) == id(app_config_2)

    # The second intialize should overide the values of the same instance of first
    assert app_config_1.data_dir == "a"


def test_create_instance_from_json(mocker):
    json_str = """
        {
            "config_dir": "1",
            "data_dir": "2"
        }
    """
    filepath = Path("/somefilepath")
    mocker.patch("pathlib.Path.read_text", return_value=json_str)
    app_config = AppConfig.from_json(filepath)
    assert app_config.config_dir == "1"
    assert app_config.data_dir == "2"
    assert app_config.watch_dir is None
    assert app_config.gemini_api_key is None


def test_update_fields():
    app_config = AppConfig("a", "b", "c", "d")
    app_config.update_fields({"data_dir": "1", "config_dir": "2"})

    assert app_config.data_dir == "1"
    assert app_config.config_dir == "2"
    assert app_config.watch_dir == "c"
    assert app_config.gemini_api_key == "d"


def test_loads_correct_default_dev_config(monkeypatch: MonkeyPatch, mocker):
    mocker.patch("pathlib.Path.exists", return_value=False)
    monkeypatch.setenv("PYTHON_ENV", "development")
    app_config = load_app_config()
    assert app_config.data_dir.endswith("backend/dev_fs/data_dir")
    assert app_config.config_dir.endswith("backend/dev_fs/config_dir")
    assert app_config.watch_dir is not None
    assert app_config.watch_dir.endswith("backend/dev_fs/watch_dir")
    assert app_config.gemini_api_key is None


def test_loads_correct_default_prod_config(monkeypatch: MonkeyPatch, mocker):
    mocker.patch("pathlib.Path.exists", return_value=False)
    mocker.patch("pathlib.Path.write_text", return_value=0)
    monkeypatch.setenv("PYTHON_ENV", "production")
    app_config = load_app_config()
    platform_dirs = PlatformDirs()
    assert app_config.data_dir.startswith(platform_dirs.user_data_dir)
    assert app_config.config_dir.startswith(platform_dirs.user_config_dir)
    assert app_config.watch_dir is None
    assert app_config.gemini_api_key is None
