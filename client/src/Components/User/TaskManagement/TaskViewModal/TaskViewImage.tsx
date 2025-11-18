export default function TaskViewImage({ image }) {
  if (!image) return null;

  return (
    <div className="relative group">
      <img
        src={image}
        className="w-full max-h-64 object-cover rounded-2xl shadow-lg group-hover:scale-[1.02] transition-transform"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  );
}
