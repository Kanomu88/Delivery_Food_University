const Skeleton = ({ width = '100%', height = '20px', className = '' }) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
    />
  );
};

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton height="200px" />
    <div style={{ padding: '1rem' }}>
      <Skeleton height="24px" width="80%" />
      <Skeleton height="20px" width="60%" style={{ marginTop: '0.5rem' }} />
      <Skeleton height="32px" width="100%" style={{ marginTop: '1rem' }} />
    </div>
  </div>
);

export const SkeletonList = ({ count = 3 }) => (
  <div className="skeleton-list">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton-list-item">
        <Skeleton height="80px" />
      </div>
    ))}
  </div>
);

export default Skeleton;
