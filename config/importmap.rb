# Pin npm packages by running ./bin/importmap

pin "application"
pin "theme", to: "theme.js"
pin "admin", to: "admin.js"

# React and dependencies
pin "react", to: "https://ga.jspm.io/npm:react@18.2.0/index.js"
pin "react-dom", to: "https://ga.jspm.io/npm:react-dom@18.2.0/index.js"
pin "scheduler", to: "https://ga.jspm.io/npm:scheduler@0.23.0/index.js"
pin "react-dom/client", to: "https://ga.jspm.io/npm:react-dom@18.2.0/client.js"

# Rich text editor
pin "quill", to: "https://ga.jspm.io/npm:quill@1.3.7/dist/quill.js"
pin "react-quill", to: "https://ga.jspm.io/npm:react-quill@2.0.0/lib/index.js"

# React admin components
pin "admin-react", to: "admin-react.js"
pin "minimalist-editor", to: "minimalist-editor.js"
pin "components/MinimalistEditor", to: "components/MinimalistEditor.js"
