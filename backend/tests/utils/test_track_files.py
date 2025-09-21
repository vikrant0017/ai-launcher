import json
import time
from pathlib import Path
from typing import NamedTuple

import pytest

# The import path is updated to reflect the new location in src/utils
from src.utils.track_files import FileTracker, FileTrackerOutput

# --- Test Setup: Pytest Fixture ---


class TrackerTestHarness(NamedTuple):
    """A helper object to hold the components of a test setup."""

    tracker: FileTracker
    watch_dir: Path
    state_file: Path


@pytest.fixture
def tracker_harness(tmp_path: Path) -> TrackerTestHarness:
    """
    Sets up a temporary directory structure for testing the FileTracker.

    This fixture provides an isolated environment for each test function,
    which is automatically cleaned up by pytest.

    Args:
        tmp_path: The pytest fixture for creating temporary directories.

    Returns:
        A harness containing the tracker instance and relevant paths.
    """
    watch_dir = tmp_path / "watch"
    state_file = tmp_path / "state.json"
    watch_dir.mkdir()

    tracker = FileTracker(watch_dir=watch_dir, state_filepath=state_file)
    return TrackerTestHarness(
        tracker=tracker, watch_dir=watch_dir, state_file=state_file
    )


# --- Test Cases ---


def test_initial_run_empty_directory(tracker_harness: TrackerTestHarness):
    """Test that the first run in an empty directory reports no changes."""
    # ARRANGE: The directory is empty.

    # ACT: Run the check.
    changes = tracker_harness.tracker.check()

    # ASSERT: No changes should be detected, and the state file should be created.
    assert changes == FileTrackerOutput(set(), set(), set())
    assert tracker_harness.state_file.exists()
    with tracker_harness.state_file.open("r") as f:
        assert json.load(f) == []


def test_new_files_are_detected(tracker_harness: TrackerTestHarness):
    """Test that newly created files are correctly identified."""
    # ARRANGE: Establish a baseline with an empty directory.
    tracker_harness.tracker.check()

    # ACT: Create new files.
    file1 = tracker_harness.watch_dir / "file1.txt"
    file2 = tracker_harness.watch_dir / "subdir"
    file2.mkdir()
    file3 = file2 / "file3.log"

    file1.touch()
    file3.touch()

    changes = tracker_harness.tracker.check()

    # ASSERT: The new files should be in the `new_files` set.
    expected_new = {file1.resolve(), file3.resolve()}
    assert changes.new_files == expected_new
    assert not changes.deleted_files
    assert not changes.modified_files


def test_deleted_files_are_detected(tracker_harness: TrackerTestHarness):
    """Test that deleted files are correctly identified."""
    # ARRANGE: Establish a baseline with some files.
    file1 = tracker_harness.watch_dir / "file1.txt"
    file2 = tracker_harness.watch_dir / "file2.txt"
    file1.touch()
    file2.touch()
    tracker_harness.tracker.check()

    # ACT: Delete one file.
    file1.unlink()
    changes = tracker_harness.tracker.check()

    # ASSERT: The deleted file should be in the `deleted_files` set.
    assert changes.deleted_files == {file1.resolve()}
    assert not changes.new_files
    assert not changes.modified_files


def test_modified_files_are_detected(tracker_harness: TrackerTestHarness):
    """Test that modified files are correctly identified."""
    # ARRANGE: Establish a baseline with a file.
    file1 = tracker_harness.watch_dir / "file1.txt"
    file1.write_text("initial content")
    tracker_harness.tracker.check()

    # ACT: Modify the file. We sleep briefly to ensure the mtime is different.
    time.sleep(0.1)
    file1.write_text("modified content")
    changes = tracker_harness.tracker.check()

    # ASSERT: The modified file should be in the `modified_files` set.
    assert changes.modified_files == {file1.resolve()}
    assert not changes.new_files
    assert not changes.deleted_files


def test_no_changes_detected(tracker_harness: TrackerTestHarness):
    """Test that running a check with no changes yields an empty result."""
    # ARRANGE: Establish a baseline.
    (tracker_harness.watch_dir / "file.txt").touch()
    tracker_harness.tracker.check()

    # ACT: Run the check again without any changes.
    changes = tracker_harness.tracker.check()

    # ASSERT: No changes should be reported.
    assert not any(changes)


def test_combined_changes_are_detected(tracker_harness: TrackerTestHarness):
    """Test a complex scenario with additions, deletions, and modifications."""
    # ARRANGE: Establish a baseline with two files.
    file_to_modify = tracker_harness.watch_dir / "a.txt"
    file_to_delete = tracker_harness.watch_dir / "b.txt"
    file_to_modify.write_text("original")
    file_to_delete.touch()
    tracker_harness.tracker.check()

    # ACT: Perform a series of operations.
    time.sleep(0.1)
    file_to_modify.write_text("changed")  # Modify
    file_to_delete.unlink()  # Delete
    file_new = tracker_harness.watch_dir / "c.txt"
    file_new.touch()  # Create

    changes = tracker_harness.tracker.check()

    # ASSERT: All changes should be correctly categorized.
    assert changes.new_files == {file_new.resolve()}
    assert changes.deleted_files == {file_to_delete.resolve()}
    assert changes.modified_files == {file_to_modify.resolve()}


def test_check_with_write_state_false(tracker_harness: TrackerTestHarness):
    """Test that the state file is not updated when write_state is False."""
    # ARRANGE: Create a new file.
    new_file = tracker_harness.watch_dir / "new.txt"
    new_file.touch()

    # ACT 1: Run check without writing state.
    changes1 = tracker_harness.tracker.check(write_state=False)

    # ASSERT 1: The new file is detected.
    assert changes1.new_files == {new_file.resolve()}
    assert not tracker_harness.state_file.exists()  # State file shouldn't be written

    # ACT 2: Run check again, still without writing state.
    changes2 = tracker_harness.tracker.check(write_state=False)

    # ASSERT 2: The file is *still* detected as new because the baseline was never updated.
    assert changes2.new_files == {new_file.resolve()}
