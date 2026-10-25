---
name: Imported frontend dependencies
description: Environment-specific dependency issues observed after importing this project from a zip.
---

Imported frontend `node_modules` may contain native packages for another operating system and npm `.bin` wrappers without execute permissions. Standard npm scripts can then fail before the app code is checked, while invoking the installed CLI with `node` may get farther but still expose missing platform bindings.

The package-install callback runs at the workspace root, even when the dependency belongs to a nested frontend or backend package. It can create root `package.json` and lock files in a project that did not have them.

**Why:** This project was imported from a zip with Windows-only native bindings and non-executable launch wrappers, so build checks initially failed for environment reasons rather than source errors. A package installation for a nested app also created unintended root manifests.

**How to apply:** When validating this imported project, inspect package-manager errors separately from app errors, use `node node_modules/<package>/bin/<cli>.js` if wrapper permissions block scripts, and install the current platform's optional native bindings before judging the source build. Check the root before and after package installs; remove generated root manifests when the project does not use them.
