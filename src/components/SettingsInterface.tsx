import {
  DefaultButton,
  ITextProps,
  PrimaryButton,
  Stack,
  Text,
  TextField,
  Toggle,
} from "@fluentui/react";
import { setAttribute } from "@fluentui/react/lib/components/KeytipData/useKeytipRef";
import React, { FC, FocusEventHandler, useState } from "react";
import Settings from "../settings/settings";
import { stackTokens } from "../style";

interface SettingsInterfaceProps {
  onSave: () => void;
}

const SettingsInterface: FC<SettingsInterfaceProps> = ({
  onSave,
}: SettingsInterfaceProps) => {
  const settings = Settings.getInstance();

  const [autoUpdate, setAutoUpdate] = useState(settings.get("autoUpdate"));
  const [authPlugins, setAuthPlugins] = useState<string[]>(
    settings.get("customAuthPlugin") || []
  );
  const [newPlugin, setNewPlugin] = useState("");

  function save() {
    settings.set("autoUpdate", autoUpdate);
    const plugins = [...authPlugins];
    if (newPlugin !== "") plugins.push(newPlugin);

    settings.set(
      "customAuthPlugin",
      plugins.filter((p) => p !== "")
    );

    settings.save();

    onSave && onSave();
  }

  function reset() {
    setAutoUpdate(settings.get("autoUpdate"));
    setAuthPlugins(settings.get("customAuthPlugin") || []);
    setNewPlugin("");
  }
  return (
    <Stack tokens={stackTokens}>
      <Text variant={"large" as ITextProps["variant"]} className="header">
        Settings
      </Text>

      <Stack>
        <Toggle
          label="Enable Automatic Updates?"
          defaultChecked={autoUpdate}
          onText="On"
          offText="Off"
          onChange={(_, checked?: boolean) => setAutoUpdate(!!checked)}
        />
      </Stack>

      <Stack
        tokens={{
          childrenGap: "10 0",
        }}
      >
        <Text variant={"medium" as ITextProps["variant"]} className="header">
          Custom Authentication Plugins
        </Text>
        {authPlugins.map((p, i) => (
          <TextField
            value={p}
            key={`plugin-${i}`}
            className="plugin-input"
            data-index={i}
            onChange={(e, newValue) => {
              const target = e.currentTarget;
              const index = parseInt(target.dataset.index!);
              const plugins = [...authPlugins];
              plugins[index] = newValue || "";
              setAuthPlugins(plugins);
            }}
          />
        ))}

        <TextField
          value={newPlugin}
          className="plugin-input"
          data-index={authPlugins.length}
          onChange={(_, newValue) => setNewPlugin(newValue || "")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (!newPlugin || newPlugin === "") return;

              const plugins = [...authPlugins];

              plugins.push(newPlugin);

              setAuthPlugins(plugins);
              setNewPlugin("");
            }
          }}
        />
      </Stack>

      <Stack tokens={stackTokens}>
        <Text>Some settings will require a restart to take effect.</Text>
      </Stack>

      <Stack horizontal={true} tokens={stackTokens}>
        <PrimaryButton onClick={save}>Save</PrimaryButton>
        <DefaultButton text="Reset" onClick={reset} />
      </Stack>
    </Stack>
  );
};

export default SettingsInterface;
