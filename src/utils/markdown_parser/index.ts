import type { ExtensionFactoryApi } from "../types/sjmcl";

type ListKind = "ul" | "ol";

type InlineNode =
	| { type: "text"; value: string }
	| { type: "link"; label: string; href: string }
	| { type: "code"; value: string }
	| { type: "strong"; value: string }
	| { type: "em"; value: string };

interface ListItemNode {
	content: InlineNode[];
	children: ListNode[];
}

interface ListNode {
	kind: ListKind;
	indent: number;
	items: ListItemNode[];
}

type BlockNode =
	| { type: "heading"; level: number; content: InlineNode[] }
	| { type: "paragraph"; content: InlineNode[] }
	| { type: "blockquote"; content: InlineNode[] }
	| { type: "image"; alt: string; src: string }
	| { type: "codeblock"; language: string; content: string }
	| { type: "list"; roots: ListNode[] }
	| { type: "blank" };

interface ParseState {
	lines: string[];
	index: number;
}

interface BlockParser {
	name: string;
	test: (state: ParseState) => boolean;
	parse: (state: ParseState) => BlockNode;
}

interface ListFrame {
	list: ListNode;
	indent: number;
	container: ListNode[];
}

function toSafeUrl(url: string): string {
	if (/^\s*javascript:/i.test(url)) {
		return "#";
	}
	return url;
}

function getIndentLevel(rawIndent: string): number {
	return rawIndent.replace(/\t/g, "  ").length;
}

function parseInlineMarkdown(raw: string): InlineNode[] {
	const nodes: InlineNode[] = [];
	const pattern = /\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null = null;

	while ((match = pattern.exec(raw))) {
		if (match.index > lastIndex) {
			nodes.push({ type: "text", value: raw.slice(lastIndex, match.index) });
		}

		if (match[1] && match[2]) {
			nodes.push({
				type: "link",
				label: match[1],
				href: toSafeUrl(match[2]),
			});
		} else if (match[3]) {
			nodes.push({ type: "code", value: match[3] });
		} else if (match[4]) {
			nodes.push({ type: "strong", value: match[4] });
		} else if (match[5]) {
			nodes.push({ type: "em", value: match[5] });
		}

		lastIndex = pattern.lastIndex;
	}

	if (lastIndex < raw.length) {
		nodes.push({ type: "text", value: raw.slice(lastIndex) });
	}

	return nodes;
}

function parseListLine(
	line: string
): { indent: number; kind: ListKind; content: InlineNode[] } | null {
	const match = line.match(/^(\s*)([-*]|\d+\.)\s+(.+)$/);
	if (!match) {
		return null;
	}

	return {
		indent: getIndentLevel(match[1]),
		kind: /\d+\./.test(match[2]) ? "ol" : "ul",
		content: parseInlineMarkdown(match[3]),
	};
}

function getOrCreateList(
	container: ListNode[],
	indent: number,
	kind: ListKind
): ListNode {
	const last = container[container.length - 1];
	if (last && last.indent === indent && last.kind === kind) {
		return last;
	}

	const nextList: ListNode = {
		kind,
		indent,
		items: [],
	};
	container.push(nextList);
	return nextList;
}

function appendListEntry(
	roots: ListNode[],
	frames: ListFrame[],
	entry: { indent: number; kind: ListKind; content: InlineNode[] }
) {
	while (frames.length > 0 && entry.indent < frames[frames.length - 1].indent) {
		frames.pop();
	}

	if (frames.length === 0) {
		const rootList = getOrCreateList(roots, entry.indent, entry.kind);
		rootList.items.push({ content: entry.content, children: [] });
		frames.push({ list: rootList, indent: rootList.indent, container: roots });
		return;
	}

	const currentFrame = frames[frames.length - 1];

	if (entry.indent > currentFrame.indent) {
		const parentItem = currentFrame.list.items[currentFrame.list.items.length - 1];
		if (parentItem) {
			const childList = getOrCreateList(parentItem.children, entry.indent, entry.kind);
			childList.items.push({ content: entry.content, children: [] });
			frames.push({
				list: childList,
				indent: childList.indent,
				container: parentItem.children,
			});
			return;
		}
	}

	const sameLevelList =
		currentFrame.list.indent === entry.indent && currentFrame.list.kind === entry.kind
			? currentFrame.list
			: getOrCreateList(currentFrame.container, entry.indent, entry.kind);

	sameLevelList.items.push({ content: entry.content, children: [] });
	frames[frames.length - 1] = {
		list: sameLevelList,
		indent: sameLevelList.indent,
		container: currentFrame.container,
	};
}

function parseListBlock(state: ParseState): BlockNode {
	const roots: ListNode[] = [];
	const frames: ListFrame[] = [];

	while (state.index < state.lines.length) {
		const entry = parseListLine(state.lines[state.index]);
		if (!entry) {
			break;
		}
		appendListEntry(roots, frames, entry);
		state.index += 1;
	}

	return { type: "list", roots };
}

function parseCodeBlock(state: ParseState): BlockNode {
	const fence = state.lines[state.index].trim();
	const language = fence.slice(3).trim();
	state.index += 1;

	const lines: string[] = [];
	while (state.index < state.lines.length) {
		const line = state.lines[state.index];
		if (line.startsWith("```")) {
			state.index += 1;
			break;
		}
		lines.push(line);
		state.index += 1;
	}

	return {
		type: "codeblock",
		language,
		content: lines.join("\n"),
	};
}

function parseHeading(state: ParseState): BlockNode {
	const line = state.lines[state.index];
	const match = line.match(/^(#{1,6})\s+(.+)$/);
	state.index += 1;

	if (!match) {
		return { type: "paragraph", content: parseInlineMarkdown(line) };
	}

	return {
		type: "heading",
		level: match[1].length,
		content: parseInlineMarkdown(match[2]),
	};
}

function parseBlockquote(state: ParseState): BlockNode {
	const line = state.lines[state.index];
	state.index += 1;
	return {
		type: "blockquote",
		content: parseInlineMarkdown(line.replace(/^\s*>\s?/, "")),
	};
}

function parseImage(state: ParseState): BlockNode {
	const line = state.lines[state.index];
	state.index += 1;
	const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);

	if (!match) {
		return { type: "paragraph", content: parseInlineMarkdown(line) };
	}

	return {
		type: "image",
		alt: match[1],
		src: toSafeUrl(match[2]),
	};
}

function parseParagraph(state: ParseState): BlockNode {
	const line = state.lines[state.index];
	state.index += 1;
	return { type: "paragraph", content: parseInlineMarkdown(line) };
}

const BLOCK_PARSERS: BlockParser[] = [
	{
		name: "codeFence",
		test: (state) => state.lines[state.index].startsWith("```"),
		parse: parseCodeBlock,
	},
	{
		name: "blank",
		test: (state) => !state.lines[state.index].trim(),
		parse: (state) => {
			state.index += 1;
			return { type: "blank" };
		},
	},
	{
		name: "heading",
		test: (state) => /^(#{1,6})\s+/.test(state.lines[state.index]),
		parse: parseHeading,
	},
	{
		name: "blockquote",
		test: (state) => /^\s*>\s?/.test(state.lines[state.index]),
		parse: parseBlockquote,
	},
	{
		name: "image",
		test: (state) => /^!\[[^\]]*\]\([^)]+\)\s*$/.test(state.lines[state.index]),
		parse: parseImage,
	},
	{
		name: "list",
		test: (state) => /^(\s*)([-*]|\d+\.)\s+/.test(state.lines[state.index]),
		parse: parseListBlock,
	},
	{
		name: "paragraph",
		test: () => true,
		parse: parseParagraph,
	},
];

function parseBlocks(markdown: string): BlockNode[] {
	const state: ParseState = {
		lines: markdown.split(/\r?\n/),
		index: 0,
	};
	const blocks: BlockNode[] = [];

	while (state.index < state.lines.length) {
		for (const parser of BLOCK_PARSERS) {
			if (!parser.test(state)) {
				continue;
			}
			blocks.push(parser.parse(state));
			break;
		}
	}

	return blocks;
}

function renderInline(
	api: ExtensionFactoryApi,
	nodes: InlineNode[],
	keyPrefix: string
): Array<string | unknown> {
	const React = api.React;
	const { Text, Link, Code } = api.ChakraUI;

	return nodes.map(function (node, index) {
		const key = keyPrefix + "-" + String(index);

		if (node.type === "text") {
			return node.value;
		}

		if (node.type === "link") {
			return React.createElement(
				Link,
				{
					key,
					href: node.href,
					target: "_blank",
					rel: "noopener noreferrer",
				},
				node.label
			);
		}

		if (node.type === "code") {
			return React.createElement(Code, { key }, node.value);
		}

		if (node.type === "strong") {
			return React.createElement(Text, { as: "span", key, fontWeight: "bold" }, node.value);
		}

		return React.createElement(Text, { as: "span", key, fontStyle: "italic" }, node.value);
	});
}

function renderListNode(
	api: ExtensionFactoryApi,
	list: ListNode,
	keyPrefix: string
): unknown {
	const React = api.React;
	const { OrderedList, UnorderedList, ListItem, Box } = api.ChakraUI;
	const ListComponent = list.kind === "ol" ? OrderedList : UnorderedList;

	const items = list.items.map(function (item, index) {
		const itemKey = keyPrefix + "-item-" + String(index);
		const inlineChildren = renderInline(api, item.content, itemKey + "-inline");

		let nestedChild: unknown = null;
		if (item.children.length > 0) {
			nestedChild = React.createElement(
				Box,
				{ key: itemKey + "-nested", mt: 1 },
				...item.children.map(function (child, childIndex) {
					return renderListNode(api, child, itemKey + "-child-" + String(childIndex));
				})
			);
		}

		return React.createElement(
			ListItem,
			{ key: itemKey, mb: 1 },
			...inlineChildren,
			nestedChild
		);
	});

	return React.createElement(ListComponent, { key: keyPrefix, ps: 5, mb: 2 }, ...items);
}

export function parseMarkdown(
	api: ExtensionFactoryApi,
	markdown: string
): unknown[] {
	const React = api.React;
	const { Text, Code, Image, Box } = api.ChakraUI;
	const blocks = parseBlocks(markdown || "");

	return blocks.flatMap(function (block, index) {
		const key = "block-" + String(index);

		if (block.type === "blank") {
			return [React.createElement(Box, { key, h: 3 })];
		}

		if (block.type === "heading") {
			const sizeMap = ["2xl", "xl", "lg", "md", "sm", "xs"] as const;
			return [
				React.createElement(
					Text,
					{
						key,
						fontWeight: "bold",
						fontSize: sizeMap[block.level - 1],
						mt: 2,
						mb: 2,
					},
					...renderInline(api, block.content, key + "-content")
				),
			];
		}

		if (block.type === "paragraph") {
			return [
				React.createElement(
					Text,
					{ key, lineHeight: "1.45", mb: 2 },
					...renderInline(api, block.content, key + "-content")
				),
			];
		}

		if (block.type === "blockquote") {
			return [
				React.createElement(
					Box,
					{
						key,
						ps: 3,
						py: 1,
						borderStartWidth: "3px",
						borderColor: "gray.300",
						mb: 2,
					},
					React.createElement(
						Text,
						{ lineHeight: "1.45" },
						...renderInline(api, block.content, key + "-content")
					)
				),
			];
		}

		if (block.type === "image") {
			return [
				React.createElement(Image, {
					key,
					src: block.src,
					alt: block.alt,
					maxW: "100%",
					borderRadius: "md",
					mb: 2,
				}),
			];
		}

		if (block.type === "codeblock") {
			return [
				React.createElement(
					Code,
					{
						key,
						display: "block",
						whiteSpace: "pre",
						overflowX: "auto",
						userSelect: "text",
						p: 3,
						borderRadius: "md",
						mb: 2,
					},
					block.content
				),
			];
		}

		return block.roots.map(function (root, rootIndex) {
			return renderListNode(api, root, key + "-list-root-" + String(rootIndex));
		});
	});
}
