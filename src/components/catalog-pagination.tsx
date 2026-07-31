"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Fragment } from "react";
import { getPaginationPages } from "@/lib/vocabulary-search";

export function CatalogPagination({
  page,
  totalPages,
  onChange,
  disabled = false,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}) {
  if (totalPages <= 1) return null;
  const pages = getPaginationPages(page, totalPages);

  return (
    <nav className="catalog-pagination" aria-label="Pagination du vocabulaire">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Page précédente"
      >
        <CaretLeft size={17} weight="bold" />
        <span>Précédente</span>
      </button>
      <div className="catalog-pagination-pages">
        {pages.map((item, index) => {
          const previous = pages[index - 1];
          return (
            <Fragment key={item}>
              {previous && item - previous > 1 ? (
                <span aria-hidden="true">…</span>
              ) : null}
              <button
                className={item === page ? "active" : ""}
                type="button"
                onClick={() => onChange(item)}
                disabled={disabled}
                aria-label={`Page ${item} sur ${totalPages}`}
                aria-current={item === page ? "page" : undefined}
              >
                P{item}
              </button>
            </Fragment>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= totalPages}
        aria-label="Page suivante"
      >
        <span>Suivante</span>
        <CaretRight size={17} weight="bold" />
      </button>
    </nav>
  );
}
