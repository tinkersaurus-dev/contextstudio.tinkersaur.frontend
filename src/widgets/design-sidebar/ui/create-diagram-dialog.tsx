/**
 * Create Diagram Dialog
 *
 * Modal dialog for creating a new diagram with name input and type selection.
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  Portal,
  Input,
  Stack,
  Field,
  Button,
  Listbox,
  createListCollection,
} from "@chakra-ui/react";
import { DiagramType } from "@/shared/types/content-data";

export interface CreateDiagramDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when the dialog is closed */
  onClose: () => void;
  /** Callback when a diagram is created */
  onCreate: (name: string, diagramType: DiagramType) => void;
}

const diagramTypes = createListCollection({
  items: [
    { label: "BPMN", value: DiagramType.BPMN },
    { label: "Sequence", value: DiagramType.Sequence },
    { label: "Data Flow", value: DiagramType.DataFlow },
  ],
});

/**
 * Dialog for creating a new diagram
 */
export function CreateDiagramDialog({
  isOpen,
  onClose,
  onCreate,
}: CreateDiagramDialogProps) {
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<DiagramType[]>([
    DiagramType.BPMN,
  ]);

  const handleCreate = () => {
    if (name.trim() && selectedType.length > 0) {
      onCreate(name.trim(), selectedType[0]);
      // Reset form
      setName("");
      setSelectedType([DiagramType.BPMN]);
    }
  };

  const handleCancel = () => {
    // Reset form
    setName("");
    setSelectedType([DiagramType.BPMN]);
    onClose();
  };

  const isValid = name.trim().length > 0;

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) {
          handleCancel();
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Create New Diagram</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Field.Root>
                  <Field.Label>Diagram Name</Field.Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter diagram name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && isValid) {
                        handleCreate();
                      }
                    }}
                    autoFocus
                  />
                </Field.Root>

                <Listbox.Root
                  collection={diagramTypes}
                  value={selectedType}
                  onValueChange={(details) =>
                    setSelectedType(details.value as DiagramType[])
                  }
                >
                  <Listbox.Label>Diagram Type</Listbox.Label>
                  <Listbox.Content>
                    {diagramTypes.items.map((type) => (
                      <Listbox.Item item={type} key={type.value}>
                        <Listbox.ItemText>{type.label}</Listbox.ItemText>
                        <Listbox.ItemIndicator />
                      </Listbox.Item>
                    ))}
                  </Listbox.Content>
                </Listbox.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button onClick={handleCreate} disabled={!isValid}>
                Create
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
