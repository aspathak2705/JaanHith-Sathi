export default function PlaceholderPage({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] p-8">
      <div className="w-20 h-20 bg-blue-50 text-primary-container rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl">construction</span>
      </div>
      <h2 className="text-3xl font-bold text-primary mb-3">{title}</h2>
      <p className="text-gray-500 max-w-md text-center">{description}</p>
    </div>
  );
}
