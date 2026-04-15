import AccountManagementClient from "@/components/admin/accounts/AccountManagement";
import { MOCK_USERS } from "@/mocked/adminData";
import { UserAccount } from "@/types/admin";

function page() {
  return <AccountManagementClient initialUsers={MOCK_USERS as UserAccount[]} />;
}

export default page;
