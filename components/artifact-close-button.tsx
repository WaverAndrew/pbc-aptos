import { memo } from "react";
import { CrossIcon } from "./icons";
import { Button } from "./ui/button";
import { initialArtifactData, useArtifact } from "@/hooks/use-artifact";

function PureArtifactCloseButton() {
  const { setArtifact } = useArtifact();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        setArtifact({ ...initialArtifactData, status: "idle" });
      }}
    >
      <CrossIcon size={16} />
    </Button>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton);
