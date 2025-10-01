"use strict";
import React, { useEffect } from "react";
import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useConfig } from "./ConfigProvider";
import { useRoute } from "./RouteProvider";

declare global {
  interface Window {
    widgets: {
      selectFile: () => Promise<string[] | null>;
    };
  }
}

const Preferences = () => {
  const config = useConfig();
  const [watchDir, setWatchDir] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectingFile, setSelectingFile] = useState(false);

  const { setRoute } = useRoute();

  useEffect(() => {
    setApiKey(config.apiKey);
  }, [config.apiKey]);

  useEffect(() => {
    setWatchDir(config.watchDir);
  }, [config.watchDir]);

  const handleDirSelect = async (e: React.SyntheticEvent<HTMLInputElement>) => {
    e.preventDefault();

    // Process only one call to file selecting at a time
    if (selectingFile) {
      return;
    }

    setSelectingFile(true);
    const dirPath = await window.widgets.selectFile();
    setSelectingFile(false);
    if (dirPath && dirPath.length > 0) {
      setWatchDir(dirPath[0]);
    }
  };

  const setRemoteConfig = async () => {
    const response = await fetch("http://localhost:8001/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gemini_api_key: apiKey,
        watch_dir: watchDir,
      }),
    });

    const jsonResponse = await response.json();
    console.log(jsonResponse.response);

    config.setApiKey(apiKey);
    config.setWatchDir(watchDir);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="scroll-m-20 text-center text-3xl font-extrabold tracking-tight text-balance">
        Preferences
      </h1>
      <div>
        <Label htmlFor="api-key">Gemini API KEY</Label>
        <Input
          id="api-key"
          type="text"
          placeholder="API KEY"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
          }}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              console.log(apiKey);
            }
          }}
        />
      </div>
      <div className="grid w-full max-w-sm items-center gap-3">
        <Label htmlFor="select-dir">Watch Dir</Label>
        <Input
          type="text"
          value={watchDir}
          id="select-dir"
          style={{ caretColor: "transparent" }}
          onSelect={handleDirSelect}
          placeholder="Select Watch Directory"
        ></Input>
        {watchDir && (
          <p className="text-sm text-gray-500">Watching: {watchDir}</p>
        )}
      </div>
      <Button
        id="preferences-btn"
        className="self-center"
        onClick={() => {
          console.log(apiKey, watchDir);
          setRemoteConfig();
          setRoute("/launcher");
        }}
      >
        Close
      </Button>
    </div>
  );
};

export default Preferences;
