import { requireRole } from "@/app/server/auth/require-role.server";
import { Metadata } from 'next';
import HrClientWrapper from '@/components/hr/HrClientWrapper';

export const metadata: Metadata = {
  title: 'HR Portal - 인재 관리 시스템',
  description: 'AI 기반 인재 검증 및 채용 관리 시스템',
};

export default async function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // await requireRole(["hr"]);

  return <HrClientWrapper>{children}</HrClientWrapper>;
}
