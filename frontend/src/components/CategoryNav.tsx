// components/CategoryNav.tsx
type CategoryNavProps = {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
};

export default function CategoryNav({
  categories,
  active,
  onSelect,
}: CategoryNavProps) {
  return (
    <nav aria-label="Menu sections" className="nomi-notebook-tabs">
      <div className="nomi-notebook-tab-rail">
        {categories.map((category) => {
          const isActive = active === category;
          return (
            <button
              key={category}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSelect(category)}
              className={`nomi-notebook-tab ${isActive ? "is-active" : ""}`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </nav>
  );
}