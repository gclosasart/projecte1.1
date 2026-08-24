export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-office-blur dark:bg-black">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-600/30 border-t-teal-600 dark:border-teal-400/30 dark:border-t-teal-400" />
    </div>
  );
}
