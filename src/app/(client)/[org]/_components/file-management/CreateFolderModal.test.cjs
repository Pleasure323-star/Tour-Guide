const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");
const React = require("react");
const ts = require("typescript");

// Exercise the actual modal's rendered props and callbacks without a backend.
// Shared UI primitives are isolated; browser behavior is verified separately.
const source = fs.readFileSync(
  path.join(__dirname, "CreateFolderModal.tsx"),
  "utf8"
);
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX,
  },
}).outputText;

function renderModal(name) {
  const created = [];
  const updates = [];
  let closed = 0;
  const componentModule = { exports: {} };
  const primitives = [
    "Dialog",
    "DialogContent",
    "DialogHeader",
    "DialogTitle",
    "DialogFooter",
    "DialogClose",
  ];
  vm.runInNewContext(compiled, {
    module: componentModule,
    exports: componentModule.exports,
    require: (id) => {
      if (id === "react") {
        return {
          ...React,
          useState: () => [name, (value) => updates.push(value)],
        };
      }
      if (id === "react/jsx-runtime") return require("react/jsx-runtime");
      if (id === "~/components/ui/dialog") {
        return Object.fromEntries(primitives.map((key) => [key, key]));
      }
      if (id === "~/components/ui/input") return { Input: "input" };
      if (id === "~/components/ui/button") return { Button: "button" };
      if (id === "lucide-react") return { X: "svg" };
      throw new Error(`Unexpected modal dependency: ${id}`);
    },
  });
  const root = componentModule.exports.default({
    isOpen: true,
    onClose: () => closed++,
    onCreate: (value) => created.push(value),
  });
  const nodes = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    nodes.push(node);
    React.Children.forEach(node.props?.children, visit);
  }
  visit(root);
  return {
    create: nodes.find(
      (node) => node.type === "button" && node.props.children === "Create"
    ),
    input: nodes.find((node) => node.type === "input"),
    hint: nodes.find((node) => node.props?.id === "folderName-help"),
    created,
    updates,
    closed: () => closed,
  };
}

for (const name of ["", "   ", "\t\n"]) {
  test(`blocks creation for ${JSON.stringify(name)} and explains the requirement`, () => {
    const modal = renderModal(name);
    assert.equal(modal.create.props.disabled, true);
    assert.equal(modal.input.props["aria-describedby"], modal.hint.props.id);
    assert.match(modal.hint.props.children, /Enter a folder name/);
    modal.create.props.onClick();
    assert.deepEqual(modal.created, []);
    assert.deepEqual(modal.updates, []);
    assert.equal(modal.closed(), 0);
  });
}

for (const name of ["Reports", "  Reports  "]) {
  test(`creates a trimmed folder for ${JSON.stringify(name)}`, () => {
    const modal = renderModal(name);
    assert.equal(modal.create.props.disabled, false);
    assert.equal(modal.input.props["aria-describedby"], undefined);
    assert.equal(modal.hint, undefined);
    modal.create.props.onClick();
    assert.deepEqual(modal.created, ["Reports"]);
    assert.deepEqual(modal.updates, [""]);
    assert.equal(modal.closed(), 1);
  });
}
