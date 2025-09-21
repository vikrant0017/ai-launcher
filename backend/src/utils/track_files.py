"""
Monitors a directory for file changes (creations, deletions, modifications).

This module provides a FileTracker class that compares the state of files in a
directory against a previously saved state, reporting any differences.

Key features:
- Efficiently detects new, deleted, and modified files using file modification times.
- Persists the file state to a JSON file for comparison across runs.
- Can be used as a library or run as a standalone script for demonstration.

TODO: Add options for include/exclude glob patterns.
TODO: Implement an in-memory cache for the file state.
"""

import json
import logging
from pathlib import Path
from typing import Dict, NamedTuple, Set

# --- Configuration ---
# Configure logging for the entire application
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# --- Data Structures ---


class FileState(NamedTuple):
    """A lightweight, immutable representation of a file's state."""

    path: Path
    mtime: float

    @classmethod
    def from_path(cls, path: Path) -> "FileState":
        """Creates a FileState instance from a Path object."""
        return cls(path=path, mtime=path.stat().st_mtime)


class FileTrackerOutput(NamedTuple):
    """The result of a file tracking analysis."""

    new_files: Set[Path]
    deleted_files: Set[Path]
    modified_files: Set[Path]


# --- Core Logic ---


class FileTracker:
    """
    Tracks file changes in a directory by comparing current state to the last known state.
    """

    def __init__(self, watch_dir: Path, state_filepath: Path):
        self.watch_dir = watch_dir.resolve()
        self.state_filepath = state_filepath.resolve()

        # Observer
        self._observers = []

        if not self.watch_dir.is_dir():
            raise NotADirectoryError(f"Watch directory not found: {self.watch_dir}")

        logger.info(f"Initialized tracker for directory: {self.watch_dir}")
        logger.info(f"Using state file: {self.state_filepath}")

    def _read_state(self) -> Dict[Path, FileState]:
        """Reads the last known file states from the state file."""
        if not self.state_filepath.exists():
            return {}

        try:
            with self.state_filepath.open("r") as f:
                data = json.load(f)

            return {
                Path(item["path"]): FileState(
                    path=Path(item["path"]), mtime=item["mtime"]
                )
                for item in data
            }
        except (json.JSONDecodeError, KeyError) as e:
            logger.warning(f"Could not parse state file, treating as empty: {e}")
            return {}

    def _write_state(self, state: Dict[Path, FileState]):
        """Writes the current file states to the state file."""
        payload = [{"path": str(fs.path), "mtime": fs.mtime} for fs in state.values()]
        with self.state_filepath.open("w") as f:
            json.dump(payload, f, indent=2)

    def _scan_directory(self) -> Dict[Path, FileState]:
        """Scans the watch directory and returns the current state of all files."""
        return {
            path: FileState.from_path(path)
            for path in self.watch_dir.rglob("*")
            if path.is_file()
        }

    def check(self, write_state: bool = True) -> FileTrackerOutput:
        """
        Analyzes the directory for changes and returns the delta.

        Args:
            write_state: If True, the new state will be written to the state file.

        Returns:
            A FileTrackerOutput object detailing the changes.
        """
        previous_state = self._read_state()
        current_state = self._scan_directory()

        previous_paths = set(previous_state.keys())
        current_paths = set(current_state.keys())

        # Efficiently find differences using set operations
        new_paths = current_paths - previous_paths
        deleted_paths = previous_paths - current_paths

        # Check for modifications only in files that existed before
        common_paths = previous_paths & current_paths
        modified_paths = {
            path
            for path in common_paths
            if previous_state[path].mtime != current_state[path].mtime
        }

        if write_state:
            self._write_state(current_state)
            logger.info(f"Updated state file with {len(current_state)} entries.")

        return FileTrackerOutput(
            new_files=new_paths,
            deleted_files=deleted_paths,
            modified_files=modified_paths,
        )

    def attach(self, observer):
        self._observers.append(observer)

    def detach(self, observer):
        self._observers.remove(observer)

    def sync(self):
        "Sync all files in the watch dir with the vector store"
        tracking_results = self.check()
        print(tracking_results)
        logger.info("Syncing Files...")
        if filepaths := tracking_results.new_files:
            print(filepaths)
            for filepath in filepaths:
                for observer in self._observers:
                    logger.info(f"Embedding new file at {filepath}")
                    observer.handle_new_file(filepath=filepath)

        if filepaths := tracking_results.modified_files:
            for filepath in filepaths:
                for observer in self._observers:
                    logger.info(f"Re-emdedding modified file at {filepath}")
                    observer.handle_modified_file(filepath=filepath)

        if filepaths := tracking_results.deleted_files:
            for filepath in filepaths:
                for observer in self._observers:
                    logger.info(f"Deleting embeddings of file at {filepath}")
                    observer.handle_deleted_file(filepath=filepath)


# --- Main Execution ---


def main():
    """
    Main function to demonstrate the FileTracker's functionality.
    """
    # Use clear, absolute paths for directories and files
    project_root = Path(__file__).parent
    watch_directory = project_root / "tmp" / "data" / "watch_dir"
    state_file = project_root / ".tracked_files.json"

    # Ensure the watch directory exists for the demo
    watch_directory.mkdir(exist_ok=True, parents=True)

    print(f"Watching directory: {watch_directory}")
    print(f"Using state file: {state_file}\n")

    tracker = FileTracker(watch_dir=watch_directory, state_filepath=state_file)

    # Create a dummy file to demonstrate changes
    (watch_directory / "test.txt").touch()

    changes = tracker.check()

    print("--- Analysis Results ---")
    if changes.new_files:
        print(f"New files: {changes.new_files}")
    if changes.deleted_files:
        print(f"Deleted files: {changes.deleted_files}")
    if changes.modified_files:
        print(f"Modified files: {changes.modified_files}")
    if not any(changes):
        print("No changes detected.")
    print("------------------------")


if __name__ == "__main__":
    main()
