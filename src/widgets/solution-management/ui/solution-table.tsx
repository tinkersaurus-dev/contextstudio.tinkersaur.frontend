"use client";

/**
 * Solution Table Component
 *
 * Displays solutions, components, and changes in a hierarchical table format.
 * Allows adding and deleting items at each level.
 */

import { Fragment } from "react";
import { Table, Box, HStack } from "@chakra-ui/react";
import { Button } from "@/shared/ui/button";
import { useSolutionStore } from "../model/solution-store";
import { AddItemDialog } from "./add-item-dialog";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export function SolutionTable() {
  const {
    solutions,
    addSolution,
    deleteSolution,
    addComponent,
    deleteComponent,
    addChange,
    deleteChange,
    getComponentsBySolution,
    getChangesByComponent,
  } = useSolutionStore();

  return (
    <Box>
      <Box mb={4}>
        <AddItemDialog
          title="Add Solution"
          placeholder="Enter solution name..."
          trigger={
            <Button>
              <FiPlus /> Add Solution
            </Button>
          }
          onAdd={addSolution}
        />
      </Box>

      <Table.Root variant="outline" size="md">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader width="60%">Name</Table.ColumnHeader>
            <Table.ColumnHeader width="20%">Type</Table.ColumnHeader>
            <Table.ColumnHeader width="20%">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {solutions.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={3} textAlign="center" color="gray.500" py={8}>
                No solutions yet. Click &quot;Add Solution&quot; to get started.
              </Table.Cell>
            </Table.Row>
          ) : (
            solutions.map((solution) => {
              const solutionComponents = getComponentsBySolution(solution.id);
              return (
                <Fragment key={solution.id}>
                  {/* Solution Row */}
                  <Table.Row bg="blue.50" _dark={{ bg: "blue.950" }}>
                    <Table.Cell fontWeight="bold">{solution.name}</Table.Cell>
                    <Table.Cell>Solution</Table.Cell>
                    <Table.Cell>
                      <HStack gap={2}>
                        <AddItemDialog
                          title="Add Component"
                          placeholder="Enter component name..."
                          trigger={
                            <Button size="sm" variant="ghost">
                              <FiPlus /> Component
                            </Button>
                          }
                          onAdd={(name) => addComponent(name, solution.id)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => deleteSolution(solution.id)}
                        >
                          <FiTrash2 />
                        </Button>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>

                  {/* Component Rows */}
                  {solutionComponents.map((component) => {
                    const componentChanges = getChangesByComponent(component.id);
                    return (
                      <Fragment key={component.id}>
                        <Table.Row bg="green.50" _dark={{ bg: "green.950" }}>
                          <Table.Cell pl={8}>{component.name}</Table.Cell>
                          <Table.Cell>Component</Table.Cell>
                          <Table.Cell>
                            <HStack gap={2}>
                              <AddItemDialog
                                title="Add Change"
                                placeholder="Enter change name..."
                                trigger={
                                  <Button size="sm" variant="ghost">
                                    <FiPlus /> Change
                                  </Button>
                                }
                                onAdd={(name) => addChange(name, component.id)}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => deleteComponent(component.id)}
                              >
                                <FiTrash2 />
                              </Button>
                            </HStack>
                          </Table.Cell>
                        </Table.Row>

                        {/* Change Rows */}
                        {componentChanges.map((change) => (
                          <Table.Row
                            key={change.id}
                            bg="yellow.50"
                            _dark={{ bg: "yellow.950" }}
                          >
                            <Table.Cell pl={16}>{change.name}</Table.Cell>
                            <Table.Cell>Change</Table.Cell>
                            <Table.Cell>
                              <Button
                                size="sm"
                                variant="ghost"
                                colorPalette="red"
                                onClick={() => deleteChange(change.id)}
                              >
                                <FiTrash2 />
                              </Button>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Fragment>
                    );
                  })}
                </Fragment>
              );
            })
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
