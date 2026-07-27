import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { contentSources } from "@/data/sources";

export function SourceReference({ sourceIds }: { sourceIds: string[] }) {
  const sources = contentSources.filter((source) => sourceIds.includes(source.id));
  return (
    <details className="source-reference">
      <summary>Provenance de ce contenu</summary>
      <div className="stack">
        {sources.map((source) => (
          <div key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer" className="row">
              <strong>{source.label}</strong>
              <ArrowSquareOut size={15} />
            </a>
            <p className="muted">
              {source.version} · {source.license}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}
