# Adding an image-processing operation

Follow this recipe only after a Planner has assigned a task card. For detailed
CV constraints, use the project `cv-operation` skill.

1. Select the wave and stable snake_case `operation_id`; state the image
   convention and expected output kind in the task card.
2. Add the registry entry: English name/description, module, parameter type,
   default, bounds, step, grayscale requirement, and output kind.
3. Implement a pure processing function with a docstring covering color order,
   dtype/range, alpha, border mode, parameter units, and timing semantics.
4. Register the handler and wire the API boundary without moving algorithm logic
   into routes. Validate invalid input with a clear 4xx response.
5. Expose the operation through the registry-driven UI; do not copy parameter
   limits or defaults into the component.
6. Add synthetic invariant tests, validation-error tests, and a licensed sample
   test when samples exist. For float paths, document the tolerance rationale.
7. Run the task-card commands, update the card evidence and workboard, then send
   the diff to `cv-reviewer`.

Frequency-domain operations additionally require the `cv-frequency-validation`
skill and the Wave 6 acceptance gate.
