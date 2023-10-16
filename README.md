# ES Logger Extension for VSCode

This is an extension I hacked up for Mediafly's 2023 Codeapalooza.

## Installation

1. Install the extension using the "Extensions: Install from VSIX" command in VS Code.
2. Activate the extension by using the "Log ES Queries" command.
3. Attach to a running Node instance with the VS Code debugger.
4. Do something in your app that makes an Elasticsearch query.

## Usage

Once the extension is activated and logs are flowing, you can see a list of captured queries in the "ES Queries" panel (next to Terminal, Debug Console, etc.). Right-clicking any item will allow you to copy the query as a cURL command or as JSON.

## Configuration

The extension assumes that you're using the @elastic/elasticsearch NPM package version 5.6.22 or thereabouts, because it just sets up a logpoint in that code and parses the results. It is made slightly less brittle by having the exact log point location and content configurable, via provided "ES Query Logger" settings in VSCode.
