export default function AnnouncementBar() {
  return (
    <div className="bg-[#17130F] text-white h-9 flex items-center justify-center px-4 text-center">
      <p className="text-sm font-normal tracking-wide hidden md:block">
        Premium leather goods. Made to last. Cash on Delivery available.
      </p>
      <p className="text-sm font-normal tracking-wide md:hidden">
        Crafted in leather · Cash on Delivery available
      </p>
    </div>
  );
}
