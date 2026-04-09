interface Props {
  blockId: string;
  category: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export default function SelectableBlock({ blockId, category, label, children, className }: Props) {
  return (
    <div
      data-selectable-block={blockId}
      data-block-category={category}
      data-block-label={label}
      className={className}
    >
      {children}
    </div>
  );
}
