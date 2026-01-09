// src/components/LoadingSpinner.jsx
export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-500 border-opacity-100"></div>
    </div>
  );
}