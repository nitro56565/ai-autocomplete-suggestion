import { useMonaco } from "@monaco-editor/react";
import { lazy, useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import {
  registerCompletion,
  type CompletionRegistration,
  type Monaco,
  type StandaloneCodeEditor,
} from "monacopilot";

const MonacoEditor = lazy(() =>
  import("@monaco-editor/react").then((mod) => ({ default: mod.Editor }))
);

const concertoKeywords = [
  "map",
  "concept",
  "from",
  "optional",
  "default",
  "range",
  "regex",
  "length",
  "abstract",
  "namespace",
  "import",
  "enum",
  "scalar",
  "extends",
  "default",
  "participant",
  "asset",
  "o",
  "identified by",
  "transaction",
  "event",
];

const concertoTypes = [
  "String",
  "Integer",
  "Double",
  "DateTime",
  "Long",
  "Boolean",
];

const handleEditorWillMount = (monacoInstance: typeof monaco) => {
  monacoInstance.languages.register({
    id: "concerto",
    extensions: [".cto"],
    aliases: ["Concerto", "concerto"],
    mimetypes: ["application/vnd.accordproject.concerto"],
  });

  monacoInstance.languages.setMonarchTokensProvider("concerto", {
    keywords: concertoKeywords,
    typeKeywords: concertoTypes,
    operators: ["=", "{", "}", "@", '"'],
    symbols: /[=}{@"]+/,
    escapes: /\\(?:[btnfru"'\\]|\\u[0-9A-Fa-f]{4})/,
    tokenizer: {
      root: [
        { include: "@whitespace" },
        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              "@keywords": "keyword",
              "@typeKeywords": "type",
              "@default": "identifier",
            },
          },
        ],
        [/"([^"\\]|\\.)*$/, "string.invalid"], // non-terminated string
        [/"/, "string", "@string"],
      ],
      string: [
        [/[^\\"]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, "string", "@pop"],
      ],
      whitespace: [
        [/\s+/, "white"],
        [/(\/\/.*)/, "comment"],
      ],
    },
  });

  monacoInstance.editor.defineTheme("concertoTheme", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "cd2184" },
      { token: "type", foreground: "008080" },
      { token: "identifier", foreground: "000000" },
      { token: "string", foreground: "008000" },
      { token: "string.escape", foreground: "800000" },
      { token: "comment", foreground: "808080" },
      { token: "white", foreground: "FFFFFF" },
    ],
    colors: {},
  });

  monacoInstance.editor.setTheme("concertoTheme");
};

export default function ConcertoEditor() {
  const monacoInstance = useMonaco();

  const options: monaco.editor.IStandaloneEditorConstructionOptions = {
    minimap: { enabled: false },
    wordWrap: "on",
    automaticLayout: true,
    scrollBeyondLastLine: false,
  };

  const completionRef = useRef<CompletionRegistration | null>(null);

  const handleMount = (editor: StandaloneCodeEditor, monaco: Monaco) => {
    // Register Monacopilot with Node.js backend endpoint
    completionRef.current = registerCompletion(monaco, editor, {
      endpoint: "http://localhost:3000/api/code-completion",
      language: "concerto",
    });
  };

  const data = `
  namespace hello@1.0.0
import org.accordproject.money@0.3.0.{MonetaryAmount} from https://models.accordproject.org/money@0.3.0.cto

concept Address {
    o String line1
    o String city
    o String state
    o String country
}

concept OrderLine {
    o String sku
    o Integer quantity
    o Double price
}

concept Order {
    o DateTime createdAt
    o OrderLine[] orderLines
}

@template
concept TemplateData {
    o String name
    o Address address
    o Integer age optional
    o MonetaryAmount salary
    o String[] favoriteColors
    o Order order
}`

  useEffect(() => {
    // Cleanup to avoid memory leaks
    return () => {
      completionRef.current?.deregister();
    };
  }, []);

  useEffect(() => {
    if (!monacoInstance) return;

    const model = monacoInstance.editor.getModels()?.[0];
    if (!model) return;

    monacoInstance.editor.setModelMarkers(model, "customMarker", []);
  }, [monacoInstance]);

  return (
    <div className="editorwrapper">
        <MonacoEditor
          options={options}
          language="concerto"
          height="80vh "
          width="80%"
          beforeMount={handleEditorWillMount}
          defaultValue={data}
          onMount={handleMount}
          theme="vs-dark"
        />
    </div>
  );
}
