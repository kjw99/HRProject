export default function ApplicantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {children}
    </div>
  );
}
