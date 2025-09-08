"""
Track if file has changed in the provided watchdirectory
Accept watchdir and a path to store intermediate filesystem state
Return the set of files as added, deleted, modified since the last run
Use a strategy like pattern to hook different strategies for compariong files
TODO: Add options to include exclude pattterns like including only .md or pdf files,etc
TODO: Cache results instead of featching from file evertime, and only read on start
"""

from datetime import datetime
from os import PathLike
from pathlib import Path

from pydantic import BaseModel


class FileInfo(BaseModel):
    filepath: PathLike
    mtime: datetime


class FileTrackerOutput(BaseModel):
    new_files: list[PathLike]
    del_files: list[PathLike]
    mod_files: list[PathLike]


class FileTracker:
    def __init__(self, watch_dir, filepath):
        self.watch_dir = Path(watch_dir)
        self.filepath = Path(filepath)

    def __call__(self, *args, **kwargs):
        return self.analyse_files(*args, **kwargs)

    def _write_info(self, file_infos: list[FileInfo]):
        self.filepath.write_text(
            "\n".join(
                f"{file_info.mtime.isoformat()},{file_info.filepath}"
                for file_info in file_infos
            )
        )

    def _get_last_file_info(self):
        str_infos = Path(self.filepath).read_text()
        lines = str_infos.splitlines()

        return [
            FileInfo(
                filepath=Path(line.split(",")[1]),
                mtime=datetime.fromisoformat(line.split(",")[0]),
            )
            for line in lines
        ]

    def _get_current_file_info(self):
        return [
            FileInfo(filepath=path, mtime=datetime.fromtimestamp(path.stat().st_mtime))
            for path in self.watch_dir.rglob("*")
            if path.is_file()
        ]

    def analyse_files(self, write=True) -> FileTrackerOutput:
        """
        Args:
            write: Replace the old info with current info?
        """
        try:
            prev_file_infos = self._get_last_file_info()
        except FileNotFoundError:
            prev_file_infos = []

        current_file_infos = self._get_current_file_info()

        new_files = []
        mod_files = []
        del_files = []

        # Check for added or modified files
        for cinfo in current_file_infos:
            x = [pinfo for pinfo in prev_file_infos if pinfo.filepath == cinfo.filepath]
            x = x[0] if len(x) else None
            if x:
                if x.mtime != cinfo.mtime:
                    mod_files.append(cinfo.filepath)
            else:
                new_files.append(cinfo.filepath)

        # Check for deleted files
        for pinfo in prev_file_infos:
            x = [
                cinfo
                for cinfo in current_file_infos
                if pinfo.filepath == cinfo.filepath
            ]
            x = x[0] if len(x) else None
            if not x:
                del_files.append(pinfo.filepath)

        if write:
            self._write_info(current_file_infos)

        return FileTrackerOutput(
            new_files=new_files, mod_files=mod_files, del_files=del_files
        )
