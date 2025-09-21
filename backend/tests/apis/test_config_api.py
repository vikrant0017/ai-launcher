from fastapi.testclient import TestClient

from server import app

client = TestClient(app)


def test_get_config():
    response = client.get("/config")
    assert response.status_code == 200
    json_response = response.json()
    assert "data_dir" in json_response
    assert "config_dir" in json_response
    assert "watch_dir" in json_response
    assert "gemini_api_key" in json_response

    # Config and Data dir must not be none as they are generated
    # by the code based on platform
    assert json_response["data_dir"] is not None
    assert json_response["config_dir"] is not None


def test_post_config(mocker):
    mock = mocker.patch("server.initialize_services", return_value=None)

    response = client.post(
        "/config",
        json={
            "gemini_api_key": "abc",
            "watch_dir": "xyz",
        },
    )
    assert response.status_code == 200
    json_response = response.json()
    assert "status" in json_response
    assert "new_config" in json_response

    assert json_response["status"] == "success"
    assert json_response["new_config"]["gemini_api_key"] == "abc"
    assert json_response["new_config"]["watch_dir"] == "xyz"

    assert mock.call_count == 1
