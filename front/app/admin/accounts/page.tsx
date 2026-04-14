import AccountManagementClient from '@/components/hr/admin/accounts/AccountManagement'
import { MOCK_USERS } from '@/mocked/adminData'
import { UserAccount } from '@/types/admin'
import React from 'react'

function page() {
    return (
        <AccountManagementClient initialUsers={MOCK_USERS as UserAccount[]} />
    )
}

export default page
