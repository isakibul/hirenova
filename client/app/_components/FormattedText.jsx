import { classNames } from "@lib/ui";

function parseInline(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

function flushList(blocks, listItems, type) {
  if (!listItems.length) {
    return;
  }

  const ListTag = type === "ordered" ? "ol" : "ul";
  blocks.push({
    type,
    content: (
      <ListTag
        key={`${type}-${blocks.length}`}
        className={classNames(
          "space-y-1 pl-5",
          type === "ordered" ? "list-decimal" : "list-disc",
        )}
      >
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{parseInline(item)}</li>
        ))}
      </ListTag>
    ),
  });
  listItems.length = 0;
}

function parseBlocks(value) {
  const blocks = [];
  const unorderedItems = [];
  const orderedItems = [];

  String(value ?? "")
    .split(/\r?\n/)
    .forEach((rawLine) => {
      const line = rawLine.trim();

      if (!line) {
        flushList(blocks, unorderedItems, "unordered");
        flushList(blocks, orderedItems, "ordered");
        return;
      }

      const heading = line.match(/^#{1,3}\s+(.+)/);
      const unordered = line.match(/^[-*]\s+(.+)/);
      const ordered = line.match(/^\d+[.)]\s+(.+)/);

      if (heading) {
        flushList(blocks, unorderedItems, "unordered");
        flushList(blocks, orderedItems, "ordered");
        blocks.push({
          type: "heading",
          content: (
            <h3 key={`heading-${blocks.length}`} className="text-base font-semibold">
              {parseInline(heading[1])}
            </h3>
          ),
        });
        return;
      }

      if (unordered) {
        flushList(blocks, orderedItems, "ordered");
        unorderedItems.push(unordered[1]);
        return;
      }

      if (ordered) {
        flushList(blocks, unorderedItems, "unordered");
        orderedItems.push(ordered[1]);
        return;
      }

      flushList(blocks, unorderedItems, "unordered");
      flushList(blocks, orderedItems, "ordered");
      blocks.push({
        type: "paragraph",
        content: (
          <p key={`paragraph-${blocks.length}`} className="leading-7">
            {parseInline(line)}
          </p>
        ),
      });
    });

  flushList(blocks, unorderedItems, "unordered");
  flushList(blocks, orderedItems, "ordered");

  return blocks.map((block) => block.content);
}

export default function FormattedText({ emptyText, value }) {
  const text = String(value ?? "").trim();

  if (!text) {
    return <p className="leading-7">{emptyText}</p>;
  }

  return <div className="space-y-4">{parseBlocks(text)}</div>;
}
